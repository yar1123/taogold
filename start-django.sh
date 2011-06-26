#!/bin/bash 
set -x 
rootdir=/home/wgwang/develop/pytop 
cd $rootdir
kill -9 `cat /home/wgwang/develop/pytop/django_pid`
rm -f $rootdir/django_pid
export DJANGO_SETTINGS_MODULE=top.settings
#python ./django-admin.py runfcgi --pythonpath=$rootdir  protocol=scgi host=127.0.0.1 port=8101 daemonize=true method=prefork maxrequests=100000 maxchildren=30 pidfile=$rootdir/django_pid
python ./django-admin.py runfcgi --pythonpath=$rootdir  protocol=scgi host=127.0.0.1 port=8101 method=prefork maxrequests=100000 maxchildren=30 pidfile=$rootdir/django_pid

sleep 3

ps -ef | grep django 

sleep 1

curl "http://localhost:8100/top/thread/startthread"




