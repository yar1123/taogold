#coding=utf8

from base import TBase

class Shop(TBase):
    typename = 'shop'
    method = 'shop.'
    fields='sid,cid,nick,title,desc,bulletin,pic_path,created,modified,shop_score,remain_count,all_count,used_count'

    def get(self, nick, fields=''):
        self.method = 'shop.get'
        self.session ='' 
        self.setParams(nick=nick)
        if fields:
            self.fields=fields
        return self.do() 


if __name__ == '__main__':
    s = Shop()

    print s.get('淘金电商', fields='sid')
