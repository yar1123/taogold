import time 
import threading
import pymongo
import re 
import bson 
import os 
import sys 

from topapi import *

import logging 
import logging.config

class Tsvr( threading.Thread ):
    def __init__(self, type):
        self.type=type
        self.mc = pymongo.Connection('127.0.0.1', 27017)
        threading.Thread.__init__ ( self )

    def keepSessionValid(self):
        tu = self.mc.top.user
        tuser = User()
        while True:
            x = tu.find()
            tlog.debug('for keeping session_key valid, user num: %d' %(x.count()))
            for i in x:
                try:
                    tuser.get(i['top_session'], i['nick'], fields='user_id,alipay_bind')
                except Exception as e:
                    tlog.warning('error in getting user info from top: %s' %(str(e)))
                    if 'Invalid session' in str(e):
                        tu.update(i, {'$set':{'sessV':False}})
                    else:
                        tu.update(i, {'$set':{'sessV':True}})
            time.sleep(600)

    def newUser(self):
        tu = self.mc.top.user 
        ti = self.mc.top.items 
        tc = self.mc.top.cats
        tuser = User()
        titems = Items()
        tcats = Sellercats()
        while True:
            x = tu.find({'new_user':True})
            for i in x:
                tlog.info('new user: %s' %(i['nick']))
                try:
                    tbui = tuser.get(i['top_session'], i['nick'])
                except Exception as e:
                    tlog.warning('error in getting user info: %s' %(str(e)))
                    tbui = {'error':str(e)}
                tbui.update(new_user=False) 
                tu.update(i, {'$set':tbui}, upsert=True)
                tbio = []
                try:
                    tbio = titems.onsale(i['top_session'], 
                            fields='id,detail_url,num_iid,title,nick,type,pic_url,num,price,volume,created,seller_cids')
                except Exception as e:
                    tlog.warning('error in getting onsale items: %s' %(str(e)))
                for j in tbio:
                    try:
                        j.update(_onsale_=True)
                        ti.update({'num_iid':j['num_iid']}, {'$set':j}, upsert=True)
                    except Exception as e:
                        tlog.warning('error when insert items to db: %s' %(str(e)))
                tbii = []
                try:
                    tbii = titems.inventory(i['top_session'], 
                            fields='id,detail_url,num_iid,title,nick,type,pic_url,num,price,volume,created,seller_cids')
                except Exception as e:
                    tlog.warning('error in getting inventory items: %s' %(str(e)))
                for j in tbii:
                    try:
                        j.update(_onsale_=False)
                        ti.update({'num_iid':j['num_iid']}, {'$set':j}, upsert=True)
                    except Exception as e:
                        tlog.warning('error when insert items to db: %s' %(str(e)))
                try:
                    tlog.debug('getting cats from top...')
                    tscs = tcats.list(i['top_session'], i['nick'])
                    tscs['nick'] = i['nick']
                    tc.update({'nick':i['nick']}, {'$set': tscs}, upsert=True)
                except Exception as e:
                    tlog.warning('error in getting Sellercats: %s' %(str(e)))
            time.sleep(1)
    
    def updateItem(self):
        tu = self.mc.top.user
        ti = self.mc.top.items
        tuser = User()
        titems = Items()
        x = tu.find()
        for i in x:
            tlog.info('update items of user: %s' %(i['nick']))
            try:
                tbui = tuser.get(i['top_session'], i['nick'])
            except Exception as e:
                tlog.warning('error in getting user info: %s' %(str(e)))
                tbui = {'error':str(e)}
            tu.update(i, {'$set':tbui}, upsert=True)
            try:
                tbio = titems.onsale(i['top_session'])
                [ j.update(_onsale_=True) for j in tbio ]
                for j in tbio:
                    ti.update({'num_iid':j['num_iid']}, {'$set':j}, upsert=True)
                tbii = titems.inventory(i['top_session'])
                [ j.update(_onsale_=False) for j in tbii ]
                for j in tbii:
                    ti.update({'num_iid':j['num_iid']}, {'$set':j}, upsert=True)
            except Exception as e:
                tlog.warning('error in getting onsale items: %s' %(str(e)))

    def _useTemplate(self, temp, top_session, amp, tbitem):
        tbinfo = tbitem.get(top_session, str(amp['num_iid']), fields='num_iid,desc')
        desc = tbinfo['desc']
        if temp['position'] == 't':
            desc = '<a name="recommend_wgid_%s"></a>%s<a name="recommend_wgid_%s"></a>%s' \
                    %(temp['html_flag'], amp['page'], temp['html_flag'], desc)
        else:
            desc = '%s<a name="recommend_wgid_%s"></a>%s<a name="recommend_wgid_%s"></a>' \
                    %(desc, temp['html_flag'], amp['page'], temp['html_flag'])
        tbinfo = tbitem.update(top_session, str(amp['num_iid']), desc=desc)
        tlog.info('update result: %s' %str(tbinfo) )

    def _stopTemplate(self, temp, top_session, amp, tbitem):
        tbinfo = tbitem.get(top_session, str(amp['num_iid']), fields='num_iid,desc')
        desc = tbinfo['desc']
        flag = '<a name="recommend_wgid_%s"></a>.*<a name="recommend_wgid_%s"></a>' %(temp['html_flag'], temp['html_flag'])
        repl = re.compile(flag, re.DOTALL)
        desc = repl.sub(' ', desc)
        tbinfo = tbitem.update(top_session, str(amp['num_iid']), desc=desc)

    def _doUpdate(self, c):
        mp = c.top.manipulate 
        mh = c.top.history
        tl = c.top.template 
        usr = c.top.user 
        tbitem = Item()
        while True:
            x = mp.find_and_modify(remove=True)
            #x = mp.find_one()
            if not x:
                time.sleep(1)
                return
                continue 
            tempid = x['tempid']
            nick = x['nick']
            num_iid = x['num_iid']
            tlog.debug('process update: nick=%s tempid=%s num_iid=%s' %(nick, tempid, num_iid))
            ts = tl.find({'_id':bson.ObjectId(tempid)})
            if ts.count() != 1:
                tlog.warning('find template[%s] fail' %(tempid)) 
                continue 
            ts = ts[0]
            ur = usr.find({'nick':nick})
            if ur.count() != 1:
                tlog.warning('find user[%s] fail' %(nick)) 
                continue
            ur = ur[0]
            fail=''
            try:
                if x['status'] == 'U':
                    self._useTemplate(ts, ur['top_session'], x, tbitem)
                else:
                    self._stopTemplate(ts, ur['top_session'], x, tbitem)
            except Exception as e:
                tlog.warning('update template[%s] num_iid[%s] nick[%s] status[%s] fail' \
                        %(tempid, num_iid, nick, x['status']))
                fail = str(e)
            if not fail:
                mh.update({'nick':x['nick'], 'tempid':x['tempid'], 'status':x['status'], 'mpid':x['mpid']}, 
                        {'$push':{'success':(x['num_iid'], '')}}, upsert=True)
            else:
                mh.update({'nick':x['nick'], 'tempid':x['tempid'], 'status':x['status'], 'mpid':x['mpid']}, 
                        {'$push':{'fail':(x['num_iid'], fail)}}, upsert=True)
            y = mp.find({'tempid':tempid})
            tlog.debug('num of template[%s] in manipulate collection is %d' %(tempid, y.count()))
            if y.count() == 0 :
                if x['status'] == 'U':
                    status = 'u'
                elif x['status'] == 'S':
                    status = 's'
                else:
                    continue
                tlog.debug('update template[%s] status' %(tempid))
                tl.update({'_id':bson.ObjectId(tempid)}, {'$set':{'status':status}})

    def manipulate(self):
        while True:
            try:
                self._doUpdate(self.mc)
            except Exception as e:
                tlog.warning('error in updating: %s' %str(e))
            time.sleep(1)

    def run ( self ): 
        tlog.debug('run thread, type: %s' %(self.type))
        if self.type=='new_user':
            self.newUser() 
        if self.type=='keepSessionValid':
            self.keepSessionValid()
        if self.type=='update':
            self.manipulate()


def start_tsvr(tnum=30):
    fw = open(os.path.abspath('./status/tsvr.pid'), 'w')
    fw.write(str(os.getpid()))
    fw.flush()
    fw.close
    Tsvr('new_user').start()
    Tsvr('keepSessionValid').start()
    for i in range(tnum):
        Tsvr('update').start()


logging.config.fileConfig('./conf/log.conf')
tlog = logging.getLogger('root')

if __name__ == '__main__':
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
    start_tsvr(50)




