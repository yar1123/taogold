#coding=utf8

from base import TBase

class Sellercats(TBase):
    typename = 'sellercats'
    method = 'sellercats.'
    fields='type,cid,parent_cid,name,pic_url,sort_order,created,modified'

    def list(self, sessionkey, nick, fields=''):
        self.method = 'sellercats.list.get'
        self.session = sessionkey
        self.setParams(nick=nick)
        if fields:
            self.fields=fields
        r = self.do() 
        return r['seller_cats']

