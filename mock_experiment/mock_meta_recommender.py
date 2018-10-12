# metarecommender with the get_metafeatures class overridden to return 
# hard-coded json metafeature data.
from ai.recommender.meta_recommender import MetaRecommender
from ai.recommender.mlp_meta_recommender import MLPMetaRecommender
import json
import pdb
import pandas as pd
def get_metafeatures(self,d):
        """Fetch dataset metafeatures from file"""
        # print('fetching data for', d)
        # payload={}
        # # payload = {'metafeatures'}
        # payload.update(self.static_payload)
        # params = json.dumps(payload).encode('utf8')
        # print('full path:', self.mf_path+'/'+d)
        try:
            # req = urllib.request.Request(self.mf_path+'/'+d, data=params)
            # r = urllib.request.urlopen(req)
           with open(self.mf_path+'/'+d+'/metafeatures.json') as data_file:    
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

class MockMetaRecommender(MetaRecommender):
    def get_metafeatures(self,d):
        return get_metafeatures(self,d)    

class MockMLPMetaRecommender(MLPMetaRecommender):
    def get_metafeatures(self,d):
        return get_metafeatures(self,d)    

