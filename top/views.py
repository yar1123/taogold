#!coding: utf-8
# Create your views here.
import math
import time
import threading
import urllib
import os
import htmllib 
import logging
import sys
import json
import random
import uuid
import base64
import re
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
        dlog.warning('check session key and parameters fail: [sessionKey:%s \
                parameters:%s sign:%s]' %(top_session, top_parameters, top_sign))
        #raise Exception('check session key and parameters fail: [sessionKey:%s \
        #        parameters:%s sign:%s]' %(top_session, top_parameters, top_sign))
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
    #param['user_type']= u['type']
    return param

def getRecommendItems(mongo, nick):
    items = mongo.top.items.find({'nick':nick}, limit=5)
    if items.count() < 3:
        tu = mongo.top.user.find_one({'nick':nick})
        if not tu:
            raise Exception('find user in db fail in getRecommendItems')
        titems = Items()
        items = titems.onsale(tu['top_session'], 
                fields = 'id,detail_url,num_iid,title,nick,type,pic_url,num,price,volume,created,seller_cids')
        if len(items) < 3:
            raise Exception('goods is too less')
    return  (items[0], items[1], items[2])
    trades = mongo.top.trade.find({'seller_nick':nick}, fields=['num_iid', 'total_fee'])
    sell_info = {} 
    for i in trades:
        try:
            num_iid = i['num_iid']
            if num_iid in sell_info:
                sell_info[num_iid] += float(i['total_fee'])
            else:
                sell_info[num_iid] = float(i['total_fee'])
        except Exception as e:
            dlog.warning('error in getRecommendItems to calc the total trades fees: %s' %(str(e))) 
    try:
        sell_info = sorted(sell_info.iteritems(), key=operator.itemgetter(1), reverse=True)[:3]
        r = [ i[0] for i in sell_info ]
        r = [ i for i in mongo.top.items.find({'num_iid':{'$nin':r}}) ]
    except Exception as e:
        dlog.warning('error in getRecommendItems to get the max trades fees items: %s' %(str(e)))
        r = []
    try:
        items_r = [ i for i in mongo.top.items.find({'nick':nick, 'num_iid':{'$in':r}}) ]
    except Exception as e:
        items_r = []
        dlog.warning('error in getRecommendItems to get the items or max trades fees: %s' %(str(e)))
    if len(items_r) > 3:
        raise Exception('some repeat num_iid in db: %s' %(','.join([i['num_iid'] for i in items_r])))
    if len(items_r)< 3:
        items=mongo.top.items.find({'nick':nick, 'num_iid':{'$nin':r}}, limit=3)
    for i in items:
        items_r.append(i)
    return (items_r[0], items_r[1], items_r[2])

def recommendHome(request):
    try:
        param = checkSessionAndGetNick(request)
    except:
        r = ErrorRedirect.sessionKey()
        setWGID(request, r)
        return r
    nick = param['nick']
#get template list from db 
    top=mongo.top.template
    try:
        qs = top.find({'nick':nick})
    except Exception as e:
        dlog.warning('find [%s] in db fail, error: %s' %(nick, str(e)))
        return ErrorRedirect.defaultError()
    if qs.count()==0:
#there is not any template for the current user, create the default template for him.
        try:
            t = defaultTemplate()
            t.update(nick=nick)
            t.update(rec_goods=getRecommendItems(mongo, nick))
            top.update({'nick':nick}, {'$set':t}, upsert=True)
        except Exception as e:
            dlog.warning('create new template for new user[%s] fail, error: %s' %(nick, str(e)))
            return ErrorRedirect.defaultError()
        qs = top.find({'nick':nick})
        if qs.count() != 1:
            top.remove({'nick':nick})
            dlog.warning('new user[%s], template num is %d' %(nick, qs.count()))
            return ErrorRedirect.defaultError()
        dlog.info('create new template[%s] for %s' %(str(qs[0]['_id']), nick))
    tset = []
    for i in qs:
        i['id']=i['_id']
        tset.append(i)
    dlog.debug('nick:[%s] template num: [%d], template list: [%s]' %(nick, qs.count(), ';'.join(map(lambda x: str(x['_id']), tset))))
    r = render_to_response('temp-list.html', {'temp_list':tset, 'nick':nick})
    if param['sk_from_req']:
        g=request.GET
        r.set_cookie('top_session', g.get('top_session', ''))
        r.set_cookie('top_parameters', g.get('top_parameters', ''))
        r.set_cookie('top_sign', g.get('top_sign', ''))
        r.set_cookie('top_appkey', g.get('top_appkey', ''))
    setWGID(request, r)
    return r

def newtemplate(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    top=mongo.top.template
    qs = top.find({'nick':nick})
    if qs.count() >= maxTemplateNum():
        dlog.warning('user[%s] reach the max template num' %(nick))
        d={'errno':-1, 'tnum':maxTemplateNum(), 'msg':'达到最大模板数', 'nick':nick}
        return render_to_response('new-template.html', d)
    d={'template': {'name':'掌柜自定义模板', 'mode':'a', 'position':'b'},
            'action':'/top/add.html', 'nick':nick}
    dlog.info('user[%s] new a template' %(nick))
    return render_to_response('new-template.html', d)


def generatePage(mongo, tempid, nick):
    t = mongo.top.template 
    u = mongo.top.user 
    try:
        user_type = u.find_one({'nick':nick})
        user_type = user_type['user']['type']
    except Exception as e:
        user_type = 'C'
        dlog.warning('get user type fail: %s' %str(e))
    x = t.find({'_id':bson.ObjectId(tempid)})
    if x.count() != 1:
        raise Exception('get template[%s] from db fail' %(tempid))
    x = x[0]
    y = x['rec_goods']
    for xxx in y:
        try:
            fprice = float(xxx['price'])
            xxx['price_a']=int(fprice)
            xxx['price_b']='%.2d' %(int(100*(fprice-xxx['price_a'])))
        except:
            xxx['price_a']=0
            xxx['price_b']='00'
    t = get_template(x['html_name'])
    d= {
            'goods_list':y,
            'nick':nick,
            'user_type':user_type,
    }
    page = t.render(Context(d))
    return page

def previewTemplate(request, tempid=""):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    g = request.GET
    if not tempid:
        tempid=g.get('tempid', '').strip()
    if not tempid:
        dlog.warning('user[%s] get tempid from request fail' %(nick))
        return ErrorRedirect.defaultError()
    page = generatePage(mongo, tempid, nick)
    return HttpResponse(page, mimetype="text/plain")
    
def addTemplate(request, nick):
    top=mongo.top.template
    qs = top.find({'nick':nick})
    if qs.count() >= maxTemplateNum():
        dlog.warning('user[%s] reach the max template num' %(nick))
        d={'errno':-1, 'tnum':maxTemplateNum(), 'msg':'达到最大模板数', 'nick':nick}
        return render_to_response('new-template.html', d)
    created=time.time()
    try:
        d = editTemplateInternal(request, mongo, nick)
    except Exception as e:
        dlog.warning('user[%s] add template fail: %s' %(nick, e))
        mongo.disconnect()
        return ErrorRedirect.defaultError()
    d.update(created=created)
    d.update(html_name='standard.html')
    d.update(editable=True)
    d.update(status='s')
    d.update(html_flag=uuid.uuid4().hex)
    t = mongo.top.template
    id = t.insert(d, safe=True)
    id=str(id)
    page = generatePage(mongo, id, nick)
    dlog.info('user[%s] add a template: %s' %(nick, id))
    return  HttpResponse(page, mimetype="text/plain")

def onsaleGoods(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey(request)
    nick = param['nick']
    g = request.GET 
    catid = g.get('cat', '')
    word = g.get('kw', '')
    try:
        start = int(g.get('start', '0')) 
        len = int(g.get('len', '40'))
    except:
        start = 0
        len = 40
    its = mongo.top.items 
    x = its.find({'nick':nick})
    goods = []
    for i in x:
        i['id']=str(i['_id'])
        del i['_id']
        goods.append(i)
    if catid:
        #catid = int(catid)
        goods = [i for i in goods if catid in i['seller_cids'].split(',')]
    if word:
        word = word.lower()
        goods = [i for i in goods if word in i['title'].lower()]
    goods = goods[start*len : (start+1)*len]
    rstr = json.dumps(goods)
    return HttpResponse(rstr, mimetype="text/plain")

def getCats(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    tc = mongo.top.cats
    r = tc.find_one({'nick':nick}) 
    y = json.dumps(r['seller_cat'])
    return HttpResponse(y, mimetype="text/plain")

def editTemplateInternal(request, mongo, nick):
    if request.method == 'POST':
        g=request.POST 
    else:
        g=request.GET 
    name = g.get('name', '')
    position = g.get('position', '')
    mode = g.get('mode', '')
    if not name or position not in ['t', 'b'] or mode not in ['a', 'm']:
        raise Exception('error data from request, name[%s], position[%s], mode[%s]' %(name, position, mode))
    if mode == 'm':
        rec_goods_iid = g.get('iid', '').split(',')
        if not rec_goods_iid:
            raise Exception('get recommended goods list fail')
        if len(rec_goods_iid) != 3:
            raise Exception('num of manual recommend goods is not 3: %d' %(len(rec_goods_iid)))
        rec_goods = []
        for i in rec_goods_iid:
            x = mongo.top.items.find({'num_iid':int(i), 'nick':nick})
            if x.count() != 1:
                raise Exception('num_iid of manual recommend goods is wrong: [%s] -- [%s]' \
                        %(i, ';'.join(map(lambda x: x['num_iid']), x)))
            rec_goods.append(x[0])
    else:
        rec_goods = getRecommendItems(mongo, nick)
    d = {'name':name,
            'position':position,
            'mode':mode,
            'rec_goods':rec_goods,
            'nick':nick,
    }
    d.update(modified=time.time())
    return d

def saveEditTemplate(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    if request.method == 'POST':
        g=request.POST 
    else:
        g=request.GET 
    tempid=g.get('tempid', '').strip()
    if not tempid:
        return addTemplate(request, nick)
    ts = mongo.top.template
    try:
        qc = ts.find({'_id':bson.ObjectId(tempid), 'nick':nick, 'editable':True})
    except Exception as e:
        dlog.warning('error in getting template of tempid=%s and nick=%s from db: %s' %(tempid, nick, e))
        return ErrorRedirect.defaultError()
    if qc.count() != 1:
        dlog.warning('get template[%s] from db fail: [%s]' \
                %(tempid, ';'.join(map(lambda x: str(x['_id']), qc))))
    try:
        d = editTemplateInternal(request, mongo, nick)
    except Exception as e:
        dlog.warning('user[%s] edit template[%s] fail: %s' %(nick, tempid, str(e)))
        mongo.disconnect()
        return ErrorRedirect.defaultError()
    ts.update({'_id':bson.ObjectId(tempid)}, {'$set':d})
    page = generatePage(mongo, tempid, nick)
    dlog.info('user [%s] save edit template[%s] result' %(nick, tempid))
    return HttpResponse(page, mimetype="text/plain")
    
def editTemplate(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    g = request.GET
    tempid=g.get('tempid', '').strip()
    if not tempid:
        dlog.warning('user[%s] get tempid from request fail: %s' %(nick))
        return ErrorRedirect.defaultError()
    ts = mongo.top.template
    try:
        q = ts.find({'_id':bson.ObjectId(tempid), 'nick':nick, 'editable':True})
    except Exception as e:
        dlog.warning('error in getting template of tempid=%d and nick=%s: %s' %(tempid, nick, str(e)))
        return ErrorRedirect.defaultError()
    if q.count() != 1:
        dlog.warning('get template from db fail: count==%d' %(q.count()))
        return ErrorRedirect.defaultError()
    q = q[0]
    q['id']=str(q['_id'])
    d={'template':q, 
            'action':'/top/saveedit.html?&tempid='+tempid,
            'nick':nick}
    dlog.info('user[%s] edit template[%s]' %(nick, q['id']))
    return render_to_response('new-template.html', d)

def viewHistory(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    g = request.GET
    tempid=g.get('tempid', '').strip()
    mh = mongo.top.history
    ts = mongo.top.template
    try:
        if tempid:
            hl = mh.find({'tempid':tempid, 'nick':nick})
        else:
            hl = mh.find({'nick':nick})
    except Exception as e:
        dlog.warning('error in getting template of tempid=%s and nick=%s: %s' %(tempid, nick, str(e)))
        return ErrorRedirect.defaultError()
    hl = hl.sort('_id', pymongo.DESCENDING)
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
        t = ts.find({'_id':bson.ObjectId(i['tempid'])})
        if t.count() != 1:
            dlog.warning('error when getting template[%s]' %(i['tempid']))
            return ErrorRedirect.defaultError()
        i['name']=t[0]['name']
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
    mh = mongo.top.history 
    q = mh.find({'_id':bson.ObjectId(hisid), 'mpid':mp})
    if q.count() != 1:
        dlog.warning('error in getting history from db: %s' %(hisid))
        mongo.disconnect()
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
    its = mongo.top.items
    for i in ct:
        print i[0]
        ai = its.find_one({'num_iid':i[0]})
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
    g=request.GET 
    tempid = g.get('tempid', '').strip()
    if not tempid:
        dlog.warning('user[%s] get tempid fail' %(nick))
        return ErrorRedirect.defaultError()
    ts = mongo.top.template 
    x = ts.find_and_modify({'_id':bson.ObjectId(tempid), 'status':'s'}, update={'$set':{'status':'U'}})
    if not x:
        dlog.warning('template[%s] is not found or is not unused' %(tempid))
        return ErrorRedirect.defaultError()
    page = generatePage(mongo, tempid, nick)
    its = mongo.top.items 
    mp = mongo.top.manipulate 
    goods = its.find({'nick':nick})
    n = goods.count()
    mpid = uuid.uuid4().hex
    for i in goods:
        mp.insert({'tempid':tempid, 'nick':nick, 'num_iid':i['num_iid'], 'page':page, 'status':'U', 'created':time.time(), 'mpid':mpid})
    #mh.insert({'nick':nick, 'tempid':tempid, 'status':'U', 'created':time.time()})
    n = n/60+1
    d={'op':'use', 'ti':n}
    return HttpResponse(json.dumps(d), mimetype="text/plain")

def stopTemplate(request):
    try:
        param  = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('check session fail: %s' %str(e))
        return ErrorRedirect.sessionKey()
    nick = param['nick']
    g=request.GET 
    tempid = g.get('tempid', '').strip()
    if not tempid:
        dlog.warning('user[%s] get tempid fail' %(nick))
        return ErrorRedirect.defaultError()
    ts = mongo.top.template 
    x = ts.find_and_modify({'_id':bson.ObjectId(tempid), 'status':'u'}, update={'$set':{'status':'S'}})
    if not x:
        dlog.warning('template[%s] is not found or is not used' %(tempid))
        return ErrorRedirect.defaultError()
    its = mongo.top.items 
    mp = mongo.top.manipulate
    goods = its.find({'nick':nick})
    n = goods.count()
    mpid = uuid.uuid4().hex
    for i in goods:
        mp.insert({'tempid':tempid, 'nick':nick, 'num_iid':i['num_iid'], 'status':'S', 'created':time.time(), 'mpid':mpid})
    #mh.insert({'nick':nick, 'tempid':tempid, 'status':'U', 'created':time.time()})
    n = n/60+1
    d={'op':'stop', 'ti':n}
    return HttpResponse(json.dumps(d), mimetype="text/plain")

def topindex(request):
    try:
        param = checkSessionAndGetNick(request)
    except Exception as e:
        dlog.warning('session key error: %s' %(str(e)))
        r = ErrorRedirect.sessionKey()
        setWGID(request, r)
        return r
    nick = param['nick']
    tu = mongo.top.user 
    uu = tu.find({'nick':nick})
    if uu.count()==0:
        try:
            tu.update({'nick':nick}, {'nick':nick, 'top_session':param['top_session'], 'new_user':True}, safe=True, upsert=True)
        except Exception as e:
            dlog.warning('insert new user to db fail: %s' %(str(e)))
    if param['sk_from_req']:
        tu.update({'nick':nick}, {'$set':{'top_session':param['top_session'], 'sessV':True}}, upsert=True)
    try:
        uu = tu.find({'nick':nick})
        if uu.count() != 1:
            dlog.warning('more than 1 nick in db, nick: %s' %(nick))
            return ErrorRedirect.defaultError()
        uu = uu[0]
        if 'sessV' in uu and not uu['sessV']:
            dlog.warning('sessionKey expire: %s' %(nick))
            return ErrorRedirect.sessionKey()
    except Exception as e:
        dlog.warning('error occur when checking sessionKey in db[%s]: %s' %(nick, str(e)))
        return ErrorRedirect.defaultError()
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
    db = mongo.top 
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
                sid = sid['shop']['sid']
                st = sid['shop']['title']
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
    #return HttpResponse(y, mimetype="text/plain")
    return HttpResponse(y, mimetype="application/json")





