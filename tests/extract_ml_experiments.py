import urllib.request, urllib.parse
import json
import os
baseURL = 'http://hoth.pmacs.upenn.edu:5080'
experimentsURL=baseURL+'/api/experiments'
postvars = {'apikey':'Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E='}
params = json.dumps(postvars).encode('utf8')
req = urllib.request.Request(experimentsURL, data=params,
  headers={'content-type': 'application/json'})
r = urllib.request.urlopen(req)
data = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
print(len(data))
