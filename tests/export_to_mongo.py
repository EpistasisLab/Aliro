import pandas as pd
import dask.dataframe as dd
import json
import pymongo
from bson.objectid import ObjectId
import string
import urllib.request, urllib.parse
import json
from datetime import datetime
from tqdm import tqdm
import os
pd.options.mode.chained_assignment = None
#limit number of records we'll process
#
baseURL=os.environ['FGLAB_URL']
MONGODB_URI=os.environ['MONGODB_URI']
datasetsURL=baseURL + '/api/datasets'
algorithmsURL=baseURL + '/api/projects'
datasetsURL=baseURL + '/api/datasets'
apiDict = {'apikey':os.environ['APIKEY']}
apiParams = json.dumps(
    apiDict
    ).encode('utf8')
#
# first, we need to construct a dataset
print('loading api datasets into dictionary...')
req = urllib.request.Request(datasetsURL, data=apiParams,
  headers={'content-type': 'application/json'})
r = urllib.request.urlopen(req)
datasets = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
datasets_dict = {}
for dataset in datasets:
     name =  dataset['name'].lower();
     _id = dataset['_id'];
     files = dataset['files'];
     datasets_dict[name] =  {'_id':_id,'files':files};
#
print('loading api algorithms into dictionary...')
req = urllib.request.Request(algorithmsURL, data=apiParams,
  headers={'content-type': 'application/json'})
r = urllib.request.urlopen(req)
algorithms = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
algorithm_names = {}
for algorithm in algorithms:
     name =  algorithm['name'].lower();
     _id = algorithm['_id'];
     algorithm_names[name.lower()] =  _id;
#
print('loading pmlb results data...')
data = pd.read_csv('metalearning/sklearn-benchmark5-data-short.tsv.gz', sep='\t',
                   names=['dataset',
                         'classifier',
                         'parameters',
                         'accuracy',
                         'macrof1',
                         'bal_accuracy']).fillna('')


print('discarding duplicate dataset/classifier combinations...')
data = data.groupby(['dataset','classifier']).head(1).reset_index(drop=True)
print('formatting records for import...')
records = json.loads(data.T.to_json()).values()
ret_records = []
client = pymongo.MongoClient(MONGODB_URI)
db = client.FGLab
for record in records:
#split parameters into individual fields
  # 
  algorithm_name = record['classifier'].lower()
  if(algorithm_name in algorithm_names):
    new_record = {}
    new_record['_project_id'] = ObjectId(algorithm_names[algorithm_name])
    #dataset info
    dataset_name = record['dataset'].lower();
    if(dataset_name in datasets_dict):
      dataset = datasets_dict[dataset_name]
      new_record['_dataset_id'] = ObjectId(dataset['_id'])
      files = datasets_dict[dataset_name.lower()]['files']
      new_files = []
      for filedata in files:
        filedata['_id'] = ObjectId(filedata['_id'])
        new_files.append(filedata);
      new_record['files'] = new_files 
   
      
    #algorithm parameters
    parameters = record['parameters'].split(",");
    nested_parameters = {}
    for parameter in parameters:
      psplit = parameter.split("=")
      if(len(psplit) > 1):
        nested_parameters[psplit[0]] = psplit[1];
        new_record['_options'] = nested_parameters;
    #scores
    scores = {}
    scores['accuracy_score'] = record['accuracy']
    scores['balanced_accuracy'] = record['bal_accuracy']
    scores['f1_score'] = record['macrof1']
    new_record['_scores'] = scores;
    #
    new_record['_started'] = datetime.min
    new_record['_finished'] = datetime.min
    new_record['_status'] = 'success'
    new_record['username'] = 'pmlb'
    db.experiments.insert(new_record)
    
#print(ret_records);
#
#for record_dict in ret_records:
#  post_params = json.dumps(
#    {**record_dict, **apiDict}
#    ).encode('utf8')
#  print(post_params);
  
