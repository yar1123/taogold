#coding=utf8

import urllib,urllib2,time,hashlib,json

from config import TConfig

class TBase(object):
    def __init__(self):
        self.p = dict(
            method = 'taobao.',
            v = '2.0',
            format = 'json',
        )
    def setParams(self,**kwargs):
        self.p.update(kwargs)
    def setFields(self,fields):
        self.p['fields'] = fields
    def setFormat(self,format):
        if format in ('json','xml'):self.p['format'] = format
    def _sign(self):
        if self.p.has_key('sign'):
            del self.p['sign']
        self.p['timestamp'] = time.strftime('%Y-%m-%d %X',time.localtime())
        if self.fields:
            self.p['fields'] = self.fields
        self.p['method'] = 'taobao.'+self.method
        self.p['api_key'] = TConfig.appkey
        self.p['session'] = self.session
        for k,v in self.p.iteritems():
            try:
                self.p[k] = v.encode('utf8')
            except:
                pass
        src = TConfig.appsecret + ''.join(["%s%s" % (k, v) for k, v in sorted(self.p.items())])
        m=hashlib.md5()
        m.update(src)
        self.p['sign'] = m.hexdigest().upper()
    def do(self, **kwargs):
        self.p.update(kwargs)
        self._sign()
        form_data = urllib.urlencode(self.p)
        urlopen = urllib2.urlopen(TConfig.url, form_data)
        rsp = urlopen.read()
        urlopen.close()
        rsp = rsp.decode('UTF-8', 'ignore')
        rsp = json.loads(rsp, strict=False)
        if rsp.has_key('error_response'):
            error_code = rsp['error_response']['code']
            msg = rsp['error_response']['msg']
            sub_code = rsp['error_response']['sub_code']
            raise Exception((error_code, msg, sub_code))
        else:
            rsp = rsp[self.method.replace('.','_') + '_response']
            return rsp #[self.typename]
