#coding=utf8

from base import TBase

class Items(TBase):
    typename = 'items'
    method = 'items.'
    fields='id,detail_url,num_iid,title,nick,type,skus,props_name,promoted_service,cid,seller_cids,props,input_pids,input_str,desc,pic_url,num,valid_thru,list_time,delist_time,stuff_status,location,price,post_fee,express_fee,ems_fee,has_discount,freight_payer,has_invoice,has_warranty,has_showcase,modified,increment,auto_repost,approve_status,postage_id,product_id,auction_point,property_alias,item_imgs,prop_imgs,outer_id,is_virtual,is_taobao,is_ex,is_timing,videos,is_3D,score,volume,one_station,second_kill,auto_fill,violation,appkey,callbackUrl,created,is_prepay,ww_status,wap_desc,wap_detail_url,after_sale_id,cod_postage_id,sell_promise'
    def inventory(self, sessionkey, fields=''):
        self.method = 'items.inventory.get'
        return self._items_do(sessionkey, fields=fields)

    def onsale(self, sessionkey, fields=''):
        self.method = 'items.onsale.get'
        return self._items_do(sessionkey, fields=fields)

    def list(self, sessionkey, num_iids, fields=''):
        self.method = 'items.list.get'
        self.session = sessionkey
        self.setParams(num_iids=num_iids)
        if fields:
            self.fields=fields
        return self.do()

    def _items_do(self, sessionkey, fields=''):
        self.session = sessionkey
        if fields:
            self.fields=fields
        r = []
        n=1
        while True:
            rt = self.do(page_size=200, page_no=n)
            if not rt:
                break
            r.extend(rt['items']['item'])
            n+=1 
            if len(r) >= rt['total_results']:
                break
        return r
