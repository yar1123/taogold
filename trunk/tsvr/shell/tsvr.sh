#!/bin/bash - 
#===============================================================================
#
#          FILE:  tsvr.sh
# 
#         USAGE:  ./tsvr.sh 
# 
#   DESCRIPTION:  
# 
#       OPTIONS:  ---
#  REQUIREMENTS:  ---
#          BUGS:  ---
#         NOTES:  ---
#        AUTHOR: wgwang (), wg93.wang@gmail.com
#       COMPANY: 
#       CREATED: 2011年06月01日 11时26分32秒 CST
#      REVISION:  ---
#===============================================================================

#set -x 

cd ${0%/*}
shdir=$PWD
rootdir=${shdir%/*}

cd $rootdir
mkdir -p $rootdir/status
mkdir -p $rootdir/logs 

. $shdir/functions
export PYTHONPATH=$rootdir/../

start()
{
  echo "Starting tsvr........." 
  #[ -f $rootdir/status/mongod.lock ] && echo "mongod is running!" && return
  daemon --pidfile $rootdir/status/tsvr.pid python ./bin/tsvr.py 
  RETVAL=$?
  echo
  [ $RETVAL -eq 0 ] && touch $rootdir/status/tsvr.lock
}

stop()
{
  echo "Stopping tsvr...... "
  [ ! -f $rootdir/status/tsvr.lock ] && echo "tsvr is not running!" && return
  killproc -p $rootdir/status/tsvr.pid -d 5
  RETVAL=$?
  echo
  [ $RETVAL -eq 0 ] && rm -f $rootdir/status/tsvr.lock
}

restart () {
	stop 
    sleep 3
	start
}

RETVAL=0

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  restart|reload|force-reload)
    restart
    ;;
  condrestart)
    [ -f $rootdir/status/tsvr.lock] && restart || :
    ;;
  status)
    status $mongod
    RETVAL=$?
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart|reload|force-reload|condrestart}"
    RETVAL=1
esac





