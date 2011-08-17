#!coding: utf-8
import time 
import threading
import pymongo
import re 
import bson 
import os 
import sys 
import urllib2 

from topapi import *

import logging 
import logging.config

class Tsvr(): #threading.Thread ):
    def __init__(self, type):
        self.type=type
        self.mc = pymongo.Connection('127.0.0.1', 27017)
        self.db = self.mc.taogold
        #threading.Thread.__init__ ( self )

    def _doUpdateStop(self, nick):
        return

    def _doUpdateUse(self, nick):
        tlog.debug('update for %s' %(nick))
        u = self.db.user.find_one({'_id':nick})
        if not u:
            raise Exception('%s not in db' %(nick))
        allitems = Items().onsale(u['top_session'], fields='num_iid')
        tbitem = Item()
        for item in allitems:
            num_iid = item['num_iid']
            tlog.debug('process update: nick=%s num_iid=%s' %(nick, num_iid))
            di = self.db.items.find_one({'_id':num_iid})
            if di:
                try:
                    rec_iids = di['rec_iid']
                except Exception as e:
                    tlog.warning('get rec_iid for [%s:%d] fail, use random' %(nick, num_iid))
                    rec_iids = []
            else:
                try:
                    get_tb_item_info = tbitem.get(u['top_session'], num_iid)
                    get_tb_item_info['_id'] = get_tb_item_info['num_iid']
                    self.db.items.insert(get_tb_item_info)
                except Exception as e:
                    tlog.warning('get [%s:%d] from taobao and insert db fail' %(nick, num_iid))
                rec_iids = []
            try:
                page = self.generatePage(nick, rec_iids)
            except Exception as e:
                tlog.warning('generate rec page for [%s:%d] fail: %s' %(nick, num_iid, str(e)))
                continue 
            temp = u['tg_temp']
            #has_flag = page.find(temp['html_flag'])
            if temp['html_flag'] not in page:
                tlog.warning('generated page wrong')
                print 'generated page wrong'*3
                continue
            try:
                item_allinfo = tbitem.get(u['top_session'], num_iid, fields='desc')
            except Exception as e:
                tlog.warning('get [%s:%d] desc from taobao fail: %s' %(nick, num_iid, repr(e)))
                continue
            if 'desc' in item_allinfo:
                desc = item_allinfo['desc']
            else:
                tlog.warning('desc not in [%s:%d] info getting from taobao: %s' %(nick, num_iid, repr(e)))
                continue
            try:
                if temp['position'] != 'b':
                    #desc = '<a name="recommend_wgid_%s"></a>%s<a name="recommend_wgid_%s"></a>%s' %( 
                    #        temp['html_flag'], page, temp['html_flag'], desc)
                    desc = page + desc
                else:
                    #desc = '%s<a name="recommend_wgid_%s"></a>%s<a name="recommend_wgid_%s"></a>' %(
                    #        desc, temp['html_flag'], page, temp['html_flag'])
                    desc = desc + page
                tbinfo = tbitem.update(u['top_session'], num_iid, desc=desc)
                tlog.debug('update [%s:%d] result: %s' %(nick, num_iid, repr(tbinfo)))
            except Exception as e:
                raise
                tlog.warning('update[use] item[%s:%d] to taobao fail: %s'
                        %(nick, num_iid, str(e)))
#增加对淘宝的错误码的判断，部分错误码需要停止该用户的继续更新操作
                continue

    def generatePage(self, nick, num_iids):
        str_iids = ';'.join([str(i) for i in num_iids])
        try:
            nick = urllib2.quote(nick)
        except:
            nick = urllib2.quote(nick.encode('utf-8'))
        url = 'http://127.0.0.1:8100/top/preview.html?nick=%s&num_iids=%s' %(nick, str_iids)
        f = urllib2.urlopen(url)
        page = f.read()
        f.close()
        page = page.decode('utf-8', 'ignore')
        return page
        
    def update(self):
        x = self.db.user.find_one({'tg_temp.status':{'$in':['U', 'S']}})
        if not x:
            return False
        if x['tg_temp']['status'] == 'U':
            x = self.db.user.find_and_modify({'tg_temp.status':'U'},
                    update={'$set':{'tg_temp.status':'V'}})
            if not x:
                return False
            self._doUpdateUse(x['_id'])
        else:
            x = self.db.user.find_and_modify({'tg_temp.status':'S'},
                    update={'$set':{'tg_temp.status':'T'}})
            if not x:
                return False
            self._doUpdateStop(x['_id'])
        return True

    def manipulate(self):
        while True:
            try:
                r = self.update()
                if r:
                    continue
            except Exception as e:
                raise
                tlog.warning('error in update: %s' %(str(e)))
            time.sleep(1)

    def get_items(self):
        x = self.db.user.find_one({'tg_new':True})
        if not x:
            return False
        x = self.db.user.find_and_modify({'tg_new':True},
                    update={'$set':{'tg_new':False}})
        if not x:
            return False 
        try:
            allitems = Items().onsale(x['top_session'], fields='num_iid')
        except Exception as e:
            tlog.warning('get onsale items of [%s] from taobao fail: %s' %(x['_id'], str(e)))
            allitems = []
        try:
            y = Items().inventory(x['top_session'], fields='num_iid')
        except Exception as e:
            tlog.warning('get inventory items of [%s] from taobao fail: %s' %(x['_id'], str(e)))
            y = []
        allitems.extend(y)
        tbitem = Item()
        for item in allitems:
            try:
                item_info = tbitem.get(x['top_session'], item['num_iid'])
            except Exception as e:
                tlog.warning('get item[%s:%d] info from taobao fail: %s' 
                        %(x['_id'], item['num_iid'], str(e)))
                continue
            item_info['_id'] = item_info['num_iid']
            self.db.items.save(item_info)
            tlog.debug('save [%s:%d] to db success' %(x['_id'], item_info['num_iid']))
        return True
        
    def newUser(self):
        while True:
            try:
                r = self.get_items()
                if r:
                    continue
            except Exception as e:
                tlog.warning('get_items in new_user fail: %s' %(str(e)))
            time.sleep(1)

    def run ( self ): 
        tlog.debug('run thread, type: %s' %(self.type))
        if self.type=='new_user':
            self.newUser() 
        if self.type=='update':
            self.manipulate()


def start_tsvr(tnum=30):
    fw = open(os.path.abspath('./status/tsvr.pid'), 'w')
    fw.write(str(os.getpid()))
    fw.flush()
    fw.close
    Tsvr('update').run()
    #Tsvr('new_user').start()
    #for i in range(tnum):
    #    Tsvr('update').start()

def main():
    try:
        pid = os.fork()
        if pid>0:
            sys.exit(0)
    except Exception as e:
        sys.exit('fork #1 error: %s' %(str(e)))
    try:
        pid = os.fork()
        if pid>0:
            sys.exit(0)
    except Exception as e:
        sys.exit('fork #2 error: %s' %(str(e)))
    start_tsvr(2)


if __name__ == '__main__':
    logging.config.fileConfig('./conf/log.conf')
    tlog = logging.getLogger('root')
    start_tsvr(2)
    #main()

