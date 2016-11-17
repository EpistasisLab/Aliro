import requests

project_id = '57ffd3c1fa76cb0022258722'
url = 'http://lab:5080/api/v1/projects/'+project_id+'/batch'
headers = {'Accept' : 'application/json', 'Content-Type' : 'application/json'}
r = requests.post(url, data=open('batch.json', 'rb'), headers=headers)
print(r.json())

