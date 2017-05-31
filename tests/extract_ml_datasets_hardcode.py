import urllib.request, urllib.parse
import json
import os
baseURL = os.environ['FGLAB_URL']
experimentsURL=baseURL+'/api/datasets'
postvars = {'apikey':os.environ['APIKEY'],'ai':'requested'} 
params = json.dumps(postvars).encode('utf8')
req = urllib.request.Request(experimentsURL, data=params,
  headers={'content-type': 'application/json'})
r = urllib.request.urlopen(req)
data = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
print(data)
