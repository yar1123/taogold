#!/bin/bash 
set -x  
shdir=${0%/*}
cd $shdir
rootdir=$PWD
echo $rootdir
kill  `cat $rootdir/django_pid`
sleep 2
rm -f $rootdir/django_pid
ps -ef | grep django 

export DJANGO_SETTINGS_MODULE=top.settings
#python ./django-admin.py runfcgi --pythonpath=$rootdir  protocol=scgi host=127.0.0.1 port=8101 daemonize=true method=prefork maxrequests=100000 maxchildren=30 pidfile=$rootdir/django_pid
python ./django-admin.py runfcgi --pythonpath=$rootdir --pythonpath=$rootdir/yzx  protocol=scgi host=127.0.0.1 port=8101 method=prefork maxrequests=100000 maxchildren=30 pidfile=$rootdir/django_pid

sleep 2

ps -ef | grep django 


