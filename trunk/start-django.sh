#!/bin/bash 
set -x  
shdir=${0%/*}
cd $shdir
rootdir=$PWD
echo $rootdir
kill -9 `cat $rootdir/django_pid`
rm -f $rootdir/django_pid
export DJANGO_SETTINGS_MODULE=newtop.settings
#python ./django-admin.py runfcgi --pythonpath=$rootdir  protocol=scgi host=127.0.0.1 port=8101 daemonize=true method=prefork maxrequests=100000 maxchildren=30 pidfile=$rootdir/django_pid
python ./django-admin.py runfcgi --pythonpath=$rootdir  protocol=scgi host=127.0.0.1 port=8101 method=prefork maxrequests=100000 maxchildren=30 pidfile=$rootdir/django_pid

sleep 3

ps -ef | grep django 


