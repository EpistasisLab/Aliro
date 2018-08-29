# generate and store metafeatures in directories. 

import pandas as pd
import numpy as np
from pmlb import dataset_names, fetch_data
import os
from ai.metalearning.get_metafeatures import get_metafeatures
import simplejson

pmlb_file = 'mock_experiment/sklearn-benchmark5-data-mock_experiment.tsv.gz'
# load pmlb data
print('load pmlb data')
pmlb_data = pd.read_csv(pmlb_file,
                        compression='gzip', sep='\t').fillna('')
data_dir = '../penn-ml-benchmarks/datasets/classification/'

for dataset, dfg in pmlb_data.groupby('dataset'):
    print(dataset)
    dataset_path = data_dir+dataset+'/'+dataset+'.tsv.gz'
    mf = get_metafeatures(dataset_path,'target',{'compression':'gzip'})
    meta_json = simplejson.dumps(mf, ignore_nan=True) #, ensure_ascii=False)    
    if not os.path.exists('metafeatures/api/datasets/'+dataset):
            os.makedirs('metafeatures/api/datasets/'+dataset)
    out_file = 'metafeatures/api/datasets/'+dataset+'/metafeatures.json'
    with open(out_file,'w') as out:
        out.write(meta_json)


