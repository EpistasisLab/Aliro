import pandas as pd
from glob import glob
import sys

mf_name = sys.argv[1]
if len(sys.argv) > 2: # then kb specified
    kb_name = [sys.argv[2]]
else:
    kb_name = glob('*.tsv.gz')
print('mf_name:',mf_name)
print('kb_name:',kb_name)
# get metafeatures
mf_df = pd.read_csv(mf_name,compression='gzip')
mf_df.rename(columns={'Unnamed: 0':'dataset'},inplace=True)

dataset_to_id = mf_df[['dataset','_id']].set_index('dataset').to_dict()['_id']
import pdb

# loop thru data
# for each dataset, add id column and resave
for f in kb_name:
    print(f)
    df = pd.read_csv(f,sep='\t',compression='gzip')
    print('mapping ids...')
    # pdb.set_trace()
    df['_id'] = df['dataset'].apply(lambda x: dataset_to_id[x] 
            if x in dataset_to_id.keys() else 'MISSING')
    print('missing ids for these datasets:',
          df.loc[df['_id'] == 'MISSING']['dataset'].unique()
          )
    df = df.loc[df['_id'] != 'MISSING']

    df.to_csv('new/'+f,index=None,
            sep='\t',compression='gzip')


# for f in glob('test/results/*.tsv'):
#     print(f)
#     df = pd.read_csv(f,sep='\t')
#     print('mapping ids...')
#     # pdb.set_trace()
#     df['_id'] = df['dataset'].apply(lambda x: dataset_to_id[x] 
#             if x in dataset_to_id.keys() else 'MISSING')
#     print('missing ids for these datasets:',
#           df.loc[df['_id'] == 'MISSING']['dataset'].unique()
#           )
#     df = df.loc[df['_id'] != 'MISSING']

#     df.to_csv('test/results/new/'+f.split('results/')[-1],index=None,
#             sep='\t')

