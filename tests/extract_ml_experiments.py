import urllib.request, urllib.parse
import json
import os
import datetime 
unixtime = int(datetime.datetime.now().strftime("%s")) * 1000
#last 8 hours
lastupdate = unixtime - (8 * 60 * 60 * 1000 )
#baseURL = os.environ['FGLAB_URL']
baseURL = 'http://hoth.pmacs.upenn.edu:5080'
experimentsURL=baseURL+'/api/experiments'
#postvars = {'apikey':os.environ['APIKEY'],'date_start':lastupdate} 
postvars = {'apikey':'Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E=','date_start':lastupdate}
params = json.dumps(postvars).encode('utf8')
req = urllib.request.Request(experimentsURL, data=params,
  headers={'content-type': 'application/json'})
r = urllib.request.urlopen(req)
data = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
print(len(data))
