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

    def customers_get (self, sessionkey, nick=''):
        self.method = 'increment.customers.get'
        if nick:
            self.setParams(nicks=nick)
        self.session = sessionkey
        return self.do()

    def trades_get(self, sessionkey, nick='', start='', end=''):
        if start:
            self.setParams(start_modified=start)
        if end:
            self.setParams(end_modified=end)
        if nick:
            self.setParams(nick=nick)
        self.method = 'increment.trades.get'
        self.session = sessionkey
        return self.do()


if __name__  == '__main__':
    a = Increment()
    print a.trades_get('6100a16e379b468aabf9454419c60b991534ec02b02c4da99294966', '丹丹可爱淘')


