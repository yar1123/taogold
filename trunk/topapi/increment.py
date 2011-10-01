#coding=utf8

from base import TBase

class Increment(TBase):
    typename = 'increment'
    method = 'increment.'
    fields= ''
    def customer_permit (self, sessionkey, fields=''):
        self.method = 'increment.customer.permit'
        self.session = sessionkey
        return self.do()

