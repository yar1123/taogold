#!coding: utf-8
# Create your views here.
import math
import time
import os
import logging
import sys
import json
import uuid
import base64
import hashlib 
import operator

import pymongo
import bson 

from exceptions import Exception

from django.http import HttpResponse
from django.http import HttpResponseRedirect

from django.template.loader import get_template
from django.template import Context
from django.shortcuts import render_to_response

from topapi import *

from misc import *

from settings import mongo

dlog = logging.getLogger('django')


def setWGID(req, res):
    try:
        wgid = req.COOKIES.get('WGID')
    except:
        wgid = ''
    if not wgid:
        a=uuid.uuid4()
        res.set_cookie('WGID', a.hex)
        dlog.debug('set WGID: %s' %(a.hex))

class ErrorRedirect:
    @staticmethod
    def sessionKey():
        con_url=TConfig.sessionUrl + TConfig.appkey
        dlog.info('session key error, redirect to login: %s' %con_url)
        return HttpResponseRedirect(con_url) 
    @staticmethod
    def defaultError():
        return HttpResponseRedirect('/top/error.html')

def checkSessionAndGetNick(request):
    s = request.COOKIES 
    g = request.GET 
    sk_from_req = True
    top_session = g.get('top_session', '').strip()
    if not top_session:
        top_session = s.get('top_session', '').strip()
        sk_from_req = False
    if not top_session: 
        dlog.warning('get top_session fail, need redirect to taobao to login')
        raise Exception('get top_session fail, need redirect to taobao to login')
    if sk_from_req:
        top_parameters = g.get('top_parameters', '').strip()
        top_sign = g.get('top_sign', '').strip()
    else:
        top_parameters = s.get('top_parameters', '').strip()
        top_sign = s.get('top_sign', '').strip()
    src=TConfig.appkey+top_parameters+top_session+TConfig.appsecret 
    m=hashlib.md5()
    m.update(src)
    if m.digest() != base64.b64decode(top_sign):
        dlog.warning('check session key and parameters fail: [sessionKey:%s parameters:%s sign:%s]' 
                %(top_session, top_parameters, top_sign))
        raise Exception('check session key and parameters fail: [sessionKey:%s parameters:%s sign:%s]' 
                %(top_session, top_parameters, top_sign))
    parameters = base64.b64decode(top_parameters)
    param={}
    for i in parameters.split('&'):
        (k, v) = i.split('=')
        param[k]=v
    nick = param['visitor_nick'].decode('gbk').strip()
    if not nick:
        dlog.warning('get nick fail, need redirect to taobao to login')
        raise Exception('get nick fail, need redirect to taobao to login')
    param['nick']=nick
    param['top_session']=top_session
    param['top_parameters']=top_parameters
    param['top_sign']=top_sign 
    param['sk_from_req']=sk_from_req
    return param

def recommendHome(request):
    try:
        param = checkSessionAndGetNick(request)
    except:
        r = ErrorRedirect.sessionKey()
        setWGID(request, r)
        return r
    nick = param['nick']
#get template list from db 
    tg_user = mongo.taogold.user
    try:
        u = tg_user.find_one({'nick':nick})
    except Exception as e:
        dlog.warning('find [%s] in db fail, error: %s' %(nick, str(e)))
        return ErrorRedirect.defaultError()
    if not u:
#new user
        dlog.info('new user: %s' %(nick))
#get user info from taobao
        try:
            tuser = User().get(param['top_session'], nick)
            u = tuser['user']
        except Exception as e:
            dlog.warning('get user[%s] info from taobao fail: %s' %(nick, str(e)))
            return ErrorRedirect.defaultError()
        #for default template parameters
        u['_id'] = nick
        u.update({'tg_temp':defaultTemplate()})
        try:
            tg_user.save(u, safe=True, check_keys=True)
        except Exception as e:
            dlog.warning('insert new user[%s] to db fail: %s' %(nick, str(e)))
            return ErrorRedirect.defaultError()
    r = render_to_response('temp-list.html', {'temp_list':[u['tg_temp'], ], 'nick':nick})
    if param['sk_from_req']:
        g=request.GET
        r.set_cookie('top_session', g.get('top_session', ''))
        r.set_cookie('top_parameters', g.get('top_parameters', ''))
        r.set_cookie('top_sign', g.get('top_sign', ''))
        r.set_cookie('top_appkey', g.get('top_appkey', ''))
    setWGID(request, r)
    return r

def generatePage(nick, num_iids=[]):
    tg_user = mongo.taogold.user
    u = tg_user.find_one({'_id':nick})
    if not u:
        raise Exception('db has not user: %s' %(nick))
    try:
        user_type = u['type']
    except Exception as e:
        user_type = 'C'
        dlog.warning('get user type fail: %s' %str(e))
    if not num_iids:
        tg_items = mongo.taogold.items.find({'nick':nick}).limit(3)
    else:
        tg_items = mongo.taogold.items.find({'_id':{'$in':num_iids}}).limit(3)
    if tg_items.count(True) != 3:
        raise Exception('%s has not enough goods: %d' %(nick, tg_items.count()))
    y = list(tg_items)
    x = u['tg_temp']
    for xxx in y:
        try:
            fprice = float(xxx['price'])
            xxx['price_a']=int(fprice)
            xxx['price_b']='%.2d' %(int(100*(fprice-xxx['price_a'])))
        except:
            xxx['price_a']=0
            xxx['price_b']='00'
    t = get_template(x['html_temp'])
    d= {
            'goods_list':y,
            'nick':nick,
            'user_type':user_type,
    }
    page = t.render(Context(d))
    page = '<a name="recommend_wgid_%s"></a>%s<a name="recommend_wgid_%s"></a>' %(
            x['html_flag'], page.strip(), x['html_flag'])
    return page

def previewTemplate(request):
    url_host = request.get_host()
    if '127.0.0.1' in url_host or 'localhost' in url_host:
        nick = request.GET.get('nick', '')
    else:
        try:
            param  = checkSessionAndGetNick(request)
        except Exception as e:
            dlog.warning('check session fail: %s' %str(e))
            return ErrorRedirect.sessionKey()
        nick = param['nick']
    if not nick:
        return ErrorRedirect.sessionKey()
    try:
        g = request.GET 
        num_iids = g.get('iids', '').split(';')
        num_iids = [ int(i) for i in num_iids ]
    except Exception as e:
        dlog.debug('get num_iids from request fail')
        num_iids = []
    if len(num_iids) != 3:
        dlog.debug('length of num_iids is not 3')
        num_iids = []
    try:
        page = generatePage(nick, num_iids)
    except Exception as e:
        dlog.warning('generating preview page for %s fail: %s' %(nick, repr(e)))
        return ErrorRedirect.defaultError()
    return HttpResponse(page, mimetype="text/plain")
    
def viewHistory(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    u = mongo.taogold.user.find_one({'_id':nick})
    if not u:
        dlog.warning('get user[%s] from db fail' %(nick))
        return ErrorRedirect.defaultError()
    t = u['tg_temp']
    mh = mongo.taogold.history
    try:
        hl = mh.find({'nick':nick})
    except Exception as e:
        dlog.warning('error in getting history of nick=%s: %s' %(nick, str(e)))
        return ErrorRedirect.defaultError()
    hl = hl.sort('_id', pymongo.DESCENDING).limit(20)
    qsl = []
    for i in hl:
        try:
            itmptime = i['_id'].generation_time.strftime('%s')
            itmptime = int(itmptime) + 28800
            i['time']= time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(itmptime))
        except:
            i['time']= i['_id'].generation_time.strftime('%Y-%m-%d %H:%M:%S')
        try:
            i['success_num'] = len(i['success'])
        except:
            i['success_num'] = 0
        try:
            i['fail_num'] = len(i['fail'])
        except:
            i['fail_num'] = 0 
        i['manipulate'] = i['status'].lower()
        i['name']=t['name']
        i['id']=str(i['_id'])
        qsl.append(i)
    d={'history':qsl, 'nick':nick}
    return render_to_response('operation-list.html', d)

def historyDetail(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    g = request.GET
    hisid=g.get('hisid', '').strip()
    mp=g.get('mp', '').strip()
    op = g.get('op', '').strip()
    if not hisid or op not in ['suc', 'fail'] or not mp:
        dlog.warning('user[%s] get hisid or op from request fail' %(nick))
        return ErrorRedirect.defaultError()
    mh = mongo.taogold.history 
    q = mh.find({'_id':bson.ObjectId(hisid), 'mpid':mp})
    if q.count() != 1:
        dlog.warning('error in getting history from db: %s' %(hisid))
        return ErrorRedirect.defaultError()
    q = q[0]
    if op == 'suc':
        num = len(q['success'])
        ct = q['success']
    else:
        num = len(q['fail'])
        ct = q['fail']
    try:
        pn = int(g.get('pn', '1'))-1
    except:
        pn = 0
    rn = 20
    pn = pn*rn
    num = math.ceil(1.0*num/rn)
    ct = ct[pn:pn+rn]
    details = []
    its = mongo.taogold.items
    for i in ct:
        print i[0]
        ai = its.find_one({'_id':i[0]})
        if ai:
            if op == 'fail':
                try:
                    ai['fail_factor'] = i[1]
                except:
                    ai['fail_factor'] = 'unkown'
            details.append(ai)
    d={'details':details, 
            'manipulate':q['status']=='U' and 'u' or 's', 
            'op':op, 'nick':nick, 'pagenum':num, 'pn':pn, 'op':op, 'hisid':hisid}
    return render_to_response('operation-detail.html', d)

def useTemplate(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    db = mongo.taogold
    x = db.user.find_and_modify({'_id':nick, 'tg_temp.status':'s'}, update={'$set':{'tg_temp.status':'U'}})
    if not x:
        dlog.warning('user[%s] is not found or is not unused' %(nick))
        return ErrorRedirect.defaultError()
    d={'op':'use', 'ti':60}
    return HttpResponse(json.dumps(d), mimetype="text/plain")

def stopTemplate(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    db = mongo.taogold
    x = db.user.find_and_modify({'_id':nick, 'tg_temp.status':'u'}, update={'$set':{'tg_temp.status':'S'}})
    if not x:
        dlog.warning('user[%s] is not found or is not used' %(nick))
        return ErrorRedirect.defaultError()
    d={'op':'stop', 'ti':60}
    return HttpResponse(json.dumps(d), mimetype="text/plain")

def topindex(request):
    try:
        param = checkSessionAndGetNick(request)
    except Exception as e:
        raise
        dlog.warning('session key error: %s' %(str(e)))
        r = ErrorRedirect.sessionKey()
        setWGID(request, r)
        return r
    nick = param['nick']
    db = mongo.taogold
    u = db.user.find_one({'_id':nick})
    if not u:
#new user
        dlog.info('new user: %s' %(nick))
#get user info from taobao
        try:
            tuser = User().get(param['top_session'], nick)
            u = tuser['user']
        except Exception as e:
            dlog.warning('get user[%s] info from taobao fail: %s' %(nick, str(e)))
            return ErrorRedirect.defaultError()
        #for default template parameters
        u['_id'] = nick
        u['inP'] = False
        u.update({'tg_temp':defaultTemplate()})
        u['top_session'] = param['top_session']
        u['tg_new'] = True
        try:
            db.user.save(u, safe=True, check_keys=True)
        except Exception as e:
            dlog.warning('insert new user[%s] to db fail: %s' %(nick, str(e)))
            return ErrorRedirect.defaultError()
    elif param['sk_from_req']:
        db.user.update({'_id':nick}, {'$set':{'top_session':param['top_session']}}, upsert=True)
    r = render_to_response('index.html', {'nick':nick})
    if param['sk_from_req']:
        g=request.GET
        r.set_cookie('top_session', g.get('top_session', ''))
        r.set_cookie('top_parameters', g.get('top_parameters', ''))
        r.set_cookie('top_sign', g.get('top_sign', ''))
        r.set_cookie('top_appkey', g.get('top_appkey', ''))
    setWGID(request, r)
    return r

def topshare(request):
    try:
        param = checkSessionAndGetNick(request)
    except:
        r = ErrorRedirect.sessionKey()
        setWGID(request, r)
        return r
    nick = param['nick']
    r = render_to_response('share.html', {'nick':nick})
    if param['sk_from_req']:
        g=request.GET
        r.set_cookie('top_session', g.get('top_session', ''))
        r.set_cookie('top_parameters', g.get('top_parameters', ''))
        r.set_cookie('top_sign', g.get('top_sign', ''))
        r.set_cookie('top_appkey', g.get('top_appkey', ''))
    setWGID(request, r)
    return r


def toperror(request):
    try:
        param = checkSessionAndGetNick(request)
    except:
        r = ErrorRedirect.sessionKey()
        setWGID(request, r)
        return r
    nick = param['nick']
    r = render_to_response('error.html', {'nick':nick})
    if param['sk_from_req']:
        g=request.GET
        r.set_cookie('top_session', g.get('top_session', ''))
        r.set_cookie('top_parameters', g.get('top_parameters', ''))
        r.set_cookie('top_sign', g.get('top_sign', ''))
        r.set_cookie('top_appkey', g.get('top_appkey', ''))
    setWGID(request, r)
    return r

def useShow(request):
    db = mongo.taogold
    ushop = Shop()
    user_filter = ['淘金电商', '淘宝开放平台', '装修市场测试', '商家测试帐号17']
    try:
        x = db.history.find({'status':'U', 'nick':{'$nin':user_filter}}, fields=['nick', 'tempid', 'success']).sort( [('_id', -1), ] ).limit(10)
        r = []
        for i in x:
            u = db.user.find_one({'nick':i['nick']}, fields=['user.seller_credit.level'])
            t = db.template.find_one({'_id':bson.ObjectId(i['tempid'])})
            itmptime = i['_id'].generation_time.strftime('%s')
            itmptime = int(itmptime) + 28800
            itmptime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(itmptime))
            itemsnum = i['success']
            itemsnum = len(itemsnum)
            try:
                sid = ushop.get(i['nick'], fields='sid,title')
                st = sid['shop']['title']
                sid = sid['shop']['sid']
            except:
                sid=0
                st=''
            d = {'time': itmptime,
                    'nick':i['nick'],
                    'level':u['user']['seller_credit']['level'],
                    'tempname':t['name'],
                    'itemsnum':itemsnum,
                    'sid':sid,
                    'stitle':st,
                    }
            r.append(d)
    except Exception as e:
        dlog.warning('error in useShow: %s' %(str(e)))
        raise
        return ErrorRedirect.defaultError()
    y = json.dumps(r)
    return HttpResponse(y, mimetype="text/plain")
    #return HttpResponse(y, mimetype="application/json")





