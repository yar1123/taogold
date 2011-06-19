#coding=utf8

from base import TBase

class Trade(TBase):
    typename = 'trade'
    fields='seller_nick,buyer_nick,title,type,created,tid,seller_rate,buyer_rate,status,payment,discount_fee,adjust_fee,post_fee,total_fee,pay_time,end_time,modified,consign_time,buyer_obtain_point_fee,point_fee,real_point_fee,received_payment,commission_fee,pic_path,num_iid,num,price,cod_fee,cod_status,shipping_type,receiver_name,receiver_state,receiver_city,receiver_district,receiver_address,receiver_zip,receiver_mobile,receiver_phone,orders'
    def sold_get(self, sessionkey, fields=''):
        self.session = sessionkey
        self.method = 'trades.sold.get'
        return self._trade_do(sessionkey, fields)

    def _trade_do(self, sessionkey, fields=''):
        self.session = sessionkey
        if fields:
            self.fields=fields
        r = []
        n=1
        while True:
            rt = self.do(page_size=100, page_no=n)
            if not rt:
                break 
            if rt['total_results'] == 0:
                break
            r.extend(rt['trades']['trade'])
            n+=1 
            if len(r) >= rt['total_results']:
                break
        return r
