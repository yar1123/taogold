#!/bin/env python
#coding: utf-8
from uuid import uuid4
import time

_defaultTemplate={
        'name':'淘金宝模板',
        'position':'b',
        'mode':'a',
        'status':'s',
        'html_temp':'standard.html',
}

def defaultTemplate():
    a=_defaultTemplate.copy()
    a.update(html_flag=uuid4().hex)
    nowtime=int(time.time())
    a.update(created=nowtime)
    a.update(modified=nowtime)
    return a

