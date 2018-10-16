# generate and store metafeatures in directories. 

import pandas as pd
import numpy as np
from pmlb import dataset_names, fetch_data
import os
from ai.metalearning.get_metafeatures import get_metafeatures
import simplejson
import sys
from glob import glob

if len(sys.argv)>1:
    pmlb_file = sys.argv[1]
else:
    pmlb_file = 'mock_experiment/sklearn-benchmark5-data-mock_experiment.tsv.gz'

if len(sys.argv)>2:
    data_dir = sys.argv[2]
else:
    data_dir = '../penn-ml-benchmarks/datasets/classification/'

if len(sys.argv)>3:
    tail = sys.argv[3]
else:
    tail = '.tsv.gz'

print(pmlb_file)
print(data_dir)
print(tail)
compression = 'gzip' if 'gz' in tail else None
# load pmlb data
pmlb_data = pd.read_csv(pmlb_file,
                        compression='gzip', sep='\t').fillna('')

for dataset, dfg in pmlb_data.groupby('dataset'):
    # print(data_dir+'/'+dataset+'/*'+tail)
    # dataset_path = data_dir+dataset+'/'+dataset+tail
    # dataset_path = data_dir+'/'+dataset+tail
    dataset_path = glob(data_dir+'/'+dataset+'/*'+tail)
    print('dataset_path:',dataset_path)
    assert(len(dataset_path)==1)
    dataset_path = dataset_path[0]
    print(dataset_path)
    mf = get_metafeatures(dataset_path,'target',compression = compression)
    meta_json = simplejson.dumps(mf, ignore_nan=True) #, ensure_ascii=False)    
    if not os.path.exists('mock_experiment/metafeatures/api/datasets/'+dataset):
            os.makedirs('mock_experiment/metafeatures/api/datasets/'+dataset)
    out_file = 'mock_experiment/metafeatures/api/datasets/'+dataset+'/metafeatures.json'
    with open(out_file,'w') as out:
        out.write(meta_json)


