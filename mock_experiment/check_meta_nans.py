from glob import glob
import pandas as pd
import json

def get_metafeatures(d):
        """Fetch dataset metafeatures from file"""
        # print('fetching data for', d)
        # payload={}
        # # payload = {'metafeatures'}
        try:
           with open(d+'/metafeatures.json') as data_file:    
                   data = json.load(data_file)
            # data = json.loads(r.read().decode(r.info().get_param('charset')
            #                           or 'utf-8'))[0]
        except Exception as e:
            print('exception when grabbing metafeature data for',d)
            raise e
        
        df = pd.DataFrame.from_records(data,columns=data.keys(),index=[0])
        df['dataset'] = d
        df.sort_index(axis=1, inplace=True)

        # print('df:',df)
        return df

frames = []
for f in glob('mock_experiment/metafeatures/api/datasets/*'):
    df = get_metafeatures(f)
    frames.append(df)

dfa = pd.concat(frames)
print(dfa)
for c in dfa.columns:
    print(c)
print('cols with missing values:')
missing_cols = [col for col in dfa.columns if dfa[col].isna().any()]
for m in missing_cols:
    print(m)
