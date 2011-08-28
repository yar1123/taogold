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

python ./bin/update_per_day.py

