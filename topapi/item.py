#coding=utf8

from base import TBase

class Item(TBase):
    typename = 'item'
    method = 'item.'
    fields='id,detail_url,num_iid,title,nick,type,skus,props_name,promoted_service,cid,seller_cids,props,input_pids,input_str,desc,pic_url,num,valid_thru,list_time,delist_time,stuff_status,location,price,post_fee,express_fee,ems_fee,has_discount,freight_payer,has_invoice,has_warranty,has_showcase,modified,increment,auto_repost,approve_status,postage_id,product_id,auction_point,property_alias,item_imgs,prop_imgs,outer_id,is_virtual,is_taobao,is_ex,is_timing,videos,is_3D,score,volume,one_station,second_kill,auto_fill,violation,appkey,callbackUrl,created,is_prepay,ww_status,wap_desc,wap_detail_url,after_sale_id,cod_postage_id,sell_promise'

    def get(self, sessionkey, num_iid, fields=''):
        self.method = 'item.get'
        self.session = sessionkey
        self.setParams(num_iid=num_iid)
        if fields:
            self.fields=fields
        r = self.do() 
        if r.has_key('item'):
            return r['item']
        else:
            return r

    def update(self, sessionkey, num_iid, **kwargs):
        self.method = 'item.update'
        self.session = sessionkey
        self.setParams(num_iid=num_iid)
        self.setParams(**kwargs)
        return self.do() 
