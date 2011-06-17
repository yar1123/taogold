#coding=utf8

from base import TBase

class Shop(TBase):
    typename = 'shop'
    method = 'shop.'
    fields='sid,cid,nick,title,desc,bulletin,pic_path,created,modified,shop_score,remain_count,all_count,used_count'

    def get(self, sessionkey, nick, fields=''):
        self.method = 'shop.get'
        self.session = sessionkey
        self.setParams(nick=nick)
        if fields:
            self.fields=fields
        return self.do() 

