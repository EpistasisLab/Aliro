# first, we need to construct a dataset that has each parameter as a feature. to do this we have to deconstruct
#the 'parameter' column into new columns.
import pandas as pd
# get data metafeatures
metafeatures = pd.read_csv('data_metafeatures.csv',sep=',',index_col=0)
print('loaded ', metafeatures.shape[1]-1, ' metafeatures for ', metafeatures.shape[0], ' datasets')
# get ML results
print('loading pmlb results data...')
data = pd.read_csv('../notebooks/sklearn-benchmark5-data.tsv.gz', sep='\t', names=['dataset',
                                                                     'classifier',
                                                                     'parameters',
                                                                     'accuracy',
                                                                     'macrof1',
                                                                     'bal_accuracy']).fillna('')
data.describe()
# function to check if parameter is a number.
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

from tqdm import tqdm
pd.options.mode.chained_assignment = None

print('converting parameters to features...')
from sklearn.externals.joblib import Parallel, delayed

def process_line(i,p):
    d = dict()
    for ps in p.split(','):
        if is_number(ps.split('=')[-1]):
            d[str(ps.split('=')[0])] = float(ps.split('=')[-1])
        else:
            d[str(ps.split('=')[0])] = ps.split('=')[-1]

#     print(d)

    # add d to data

    for key, value in d.items():
        if key not in data.columns:
            data[key] = 'NaN'

        data.ix[i, key] = value

Parallel(n_jobs=10)(delayed(process_line)(i,p) for i,p in enumerate(data['parameters'])):

        # print('data.ix[i,key]:',data.ix[i,key])
data.to_csv('sklearn-benchmark5-data-metafeatures-parameters.tsv.gz',compression='gzip',sep='\t',index=False)
