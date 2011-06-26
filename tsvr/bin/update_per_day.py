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

    def updateItems(self):
        tu = self.mc.top.user
        ti = self.mc.top.items
        tuser = User()
        titems = Items()
        x = tu.find({'sessV':{'$not':False}})
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

    def updateTrade(self):
        tu = self.mc.top.user
        ti = self.mc.top.trade
        ttrade = Trade()
        x = tu.find({'sessV':{'$not':False}})
        for i in x:
            tlog.info('update trade of user: %s' %(i['nick']))
            try:
                tt = ttrade.sold_get(i['top_session'])
                for j in tt:
                    try:
                        ti.update({'tid':j['tid']}, {'$set':j}, upsert=True)
                    except Exception as e:
                        tlog.warning('error in update trade to db: e' %str(e))
            except Exception as e:
                tlog.warning('error in getting trade: %s' %(str(e)))

    def updateCats(self):
        tu = self.mc.top.user
        tc = self.mc.top.cats
        tcats = Sellercats({'sessV':{'$not':False}})
        x = tu.find()
        for i in x:
            tlog.info('update cats of user: %s' %(i['nick']))
            try:
                tscs = tcats.list(i['top_session'], i['nick'])
                tscs['nick'] = i['nick']
                tc.update({'nick':i['nick']}, {'$set': tscs}, upsert=True)
            except Exception as e:
                tlog.warning('error in getting cats: %s' %(str(e)))

    def run ( self ): 
        tlog.debug('run thread, type: %s' %(self.type))
        if self.type=='updateItems':
            self.updateItems()
        if self.type=='updateTrade':
            self.updateTrade()
        if self.type=='updateCats':
            self.updateCats()

def start_tsvr(tnum=3):
    fw = open(os.path.abspath('./status/tsvr.pid'), 'w')
    fw.write(str(os.getpid()))
    fw.flush()
    fw.close
    Tsvr('updateItems').start()
    Tsvr('updateTrade').start()
    Tsvr('updateCats').start()


logging.config.fileConfig('./conf/log_for_updateItems.conf')
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
    start_tsvr(5)




