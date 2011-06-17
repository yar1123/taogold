#coding=utf8

from base import TBase

class User(TBase):
    typename = 'user'
    fields = 'user_id,nick,sex,buyer_credit,seller_credit,location.city,location.state,location.country,created,last_visit,location.zip,birthday,type,has_more_pic,item_img_num,item_img_size,prop_img_num,prop_img_size,auto_repost,promoted_type,status,alipay_bind,consumer_protection'
    def get(self, sessionkey, nick, fields=''):
        self.session = sessionkey
        self.method = 'user.get'
        if fields:
            self.fields=fields
        return self.do()

