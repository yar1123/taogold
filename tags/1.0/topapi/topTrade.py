
from top.topapi.topBase import TOPBase


class TOPGoods:
    def innerGoodsProcess(self, method, sessionkey, fields, otherParams):
        self.base = TOPBase()
        param = {
                'fields':fields,
                'session':sessionkey,
                }
        param.update(otherParams)
        self.base.setParam(method, param)
        self.base.topFetch()
        return self.base.content 

    def inventory(self, sessionkey, fields='num_iid,title', otherParams={}):
        return self.innerGoodsProcess('taobao.items.inventory.get', sessionkey, fields, otherParams)

