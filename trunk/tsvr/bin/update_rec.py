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

class Usvr:
    def __init__(self, type):
        self.type=type
        self.mc = pymongo.Connection('127.0.0.1', 27017)
        threading.Thread.__init__ ( self )

    def newUser(self):
        tu = self.mc.top.user 
        ti = self.mc.top.items
        tuser = User()
        titems = Items()
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
                try:
                    tbio = titems.onsale(i['top_session'], fields= \
                            'id,detail_url,num_iid,title,nick,type,pic_url,num,price,volume,created,seller_cids')
                    [ i.update(_onsale_=True) for i in tbio ]
                    ti.insert(tbio)
                    tbii = titems.inventory(i['top_session'], fields= \
                            'id,detail_url,num_iid,title,nick,type,pic_url,num,price,volume,created,seller_cids')
                    [ i.update(_onsale_=False) for i in tbio ]
                    ti.insert(tbii)
                except Exception as e:
                    tlog.warning('error in getting onsale items: %s' %(str(e)))
            time.sleep(1)



