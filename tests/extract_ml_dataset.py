import urllib.request, urllib.parse
import json
import os
baseURL = os.environ['FGLAB_URL']
experimentsURL=baseURL+'/api/experiments'
postvars = {'apikey':os.environ['APIKEY']} 
params = json.dumps(postvars).encode('utf8')
req = urllib.request.Request(experimentsURL, data=params,
  headers={'content-type': 'application/json'})
r = urllib.request.urlopen(req)
data = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
print(len(data))
