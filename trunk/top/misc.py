#!/bin/env python
#coding: utf-8
from uuid import uuid4
import time

_defaultTemplate={
        'name':'淘金宝预置模板',
        'position':'b',
        'mode':'a',
        'status':'s',
        'html_name':'standard.html',
        'editable':False
}

def defaultTemplate():
    a=_defaultTemplate.copy()
    a.update(html_flag=uuid4().hex)
    nowtime=time.time()
    a.update(created=nowtime)
    a.update(modified=nowtime)
    return a

def maxTemplateNum(vip=0):
    return 2+2*vip

