import pymongo
from topapi import increment
m = pymongo.Connection('127.0.0.1:57324')


db = m.taogold

ipr = increment.Increment()

cur = db.user.find(fields = ['top_session', ])

for i in cur:
    j = i['top_session']
    print ipr. customer_permit(j)

    




