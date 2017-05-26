"""
AI agent for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from time import sleep
import json
import pickle
import requests
import pdb
import time
import ai.ml_ids
import os
from ai.recommender.base import Recommender


class AI():
    """AI managing agent for Penn AI.

    Responsible for:
    - checking for user requests for recommendations,
    - checking for new results from experiments,
    - calling the recommender system to generate experiment recommendations,
    - posting the recommendations to the API.
    - handling communication with the API.

    Parameters
    ----------
    rec: recommender to use

    db_path: base path to the database server

    extra_payload: any additional payload that needs to be specified

    user: the user for this AI instance.

    rec_score_file: pickled score file to keep persistent scores between
                    sessions
    """

    def __init__(self,rec=Recommender(),
                 db_path='http://ibi-admin-031.med.upenn.edu',
                 extra_payload=dict(),
                 user='testuser',rec_score_file='rec_scores.obj'):
        """initializes AI managing agent."""
        self.rec = rec
        # access to database
        self.db_path = db_path
        self.exp_path = '/'.join([self.db_path,'api/experiments'])
        self.data_path = '/'.join([self.db_path,'api/datasets'])
        self.submit_path = '/'.join([self.db_path,'/api/v1/projects/'])
        self.user=user
        # api key for the recommender
        self.api_key='Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E='
        # optional extra payloads (e.g. user id) for posting to the db
        self.extra_payload = extra_payload
        # file name of stored scores for the recommender
        self.rec_score_file = rec_score_file
        # if there is a file, load it as the recommender scores
        if os.path.isfile(self.rec_score_file):
            self.load_state()
        # requests queue
        self.request_queue = []
        # static payload is the payload that is constant for every API post
        self.static_payload = {'token':self.api_key,
                                'user':self.user}
        # add any extra payload
        self.static_payload.update(extra_payload)

    def load_state(self):
        """loads pickled score file."""
        filehandler = open(self.rec_score_file)
        self.rec.scores = pickle.load(filehandler)

    def check_requests(self):
        """Returns true if new AI request has been submitted by user."""
        payload = {'ai':'requested'}
        payload.update(self.static_payload)

        r = requests.post(self.data_path,data=json.dumps(payload))
        pdb.set_trace()
        responses = json.loads(r.text)
        # if there are any requests, add them to the queue and return True
        if len(responses) > 0:
            self.request_queue = responses
            return True

        return False

    def check_results(self,timestamp=None):
        """Returns true if new results have been posted since the previous
        time step."""
        if timestamp is None:
            timestamp = 0

        payload = {'status':'success',
                   'time':timestamp}
        payload.update(self.static_payload)
        # get new results
        r = requests.post(exp_db_path,data=json.dumps(payload))
        # if there are new results, return True
        if len(json.loads(r.text)) > 0:
            return True

        return False

    def get_new_results(self,timestamp=None):
        """Returns a dataframe of new results from the DB"""
        # payload = {'token':self.api_key,
        #         #    'filter_ids':self.trained_data_ids,
        #             'algorithm': self.models,
        #             'experiments': 'finished',
        #           }
        # payload.update(self.static_payload)
        # print('payload:',payload)
        # ##post the payload to the API
        # r = requests.post(self.db_path, data = json.dumps(payload))
        # if r.status_code==503:
        #     raise ValueError('Failed to connect to database',r.reason)
        # print(r)
        # # pdb.set_trace()
        # response = json.loads(r.text)
        # print('response:',response[0])

        response = [
                    {'_id': 12345,
                     'dataset': "Gametes",
                     'algorithm':"LogisticRegression",
                     'parameters':{'alpha': 0.1, 'C': 100.0},
                     'accuracy': 0.75
                     },
                    {'_id': 4623,
                     'dataset': "HeartDisease",
                     'algorithm':"DecisionTree",
                     'parameters':{'max_depth':6},
                     'accuracy': 0.8,
                     }
                     ]
        # frames = []
        # columns = ['dataset','algorithm','parameters',self.metric]
        # results = [r['results'] for r in response]
        # for res in response:
        #     frames.append(res['dataset'])
        #     for r in res['results']:
        #         frames.append(r['algorithm'])
        #         params = ''
        #         for i,d in r['parameters'].items():
        #             print('key:',i,'value:',d)
        #             ids.append(i)
        #             frames.append(pd.DataFrame.from_dict(d,orient='index'))
        # pd.concat(frames,keys=i)
        df = pd.DataFrame(response)
        # print('results:\n',results)
        # df = pd.DataFrame(response)
        # ai = pd.DataFrame(response[0]['ai'])
        print('dataframe:\n',df)
        # print('ai:',ai)
        return df

    def send_rec(self):
        """Sends recommendation to the API."""(':')
        for r in self.requests:
            dataset = r['name']
            # get recommendation for dataset
            ml,p = self.rec.recommend()
            recs = []
            for alg,params in zip(ml,p):
                rec.append({'dataset_id':r['_id'],
                            # 'dataset_name':r['name'],
                            'algorithm_id':ml_ids[alg],
                            # 'ml_name':alg,
                            'parameters':dict()
                            })
                # add recommended parameters
                for p in params.sep(','):
                    rec[-1]['parameters'][p.split(':')[0]] = p.split(':')[1]

            # submit path is ml_id/experiment
            submit_path = '/'.join([self.submit_path,r['_id'],'/experiment'])
            # post recommendations
            requests.post(submit_path,json.dumps(rec))

    def update_recommender(self,timestamp=None):
        """Updates recommender based on new results."""
        # get new results
        new_data = self.get_new_results()
        # update recommender
        self.rec.update(new_data,timestamp)

    def save_state(self):
        """Save ML+P scores in pickle or to DB"""
        out = open(self.rec_score_file,'w')
        pickle.dump(self.rec.scores, out)

    def db_to_results_data(self,response):
        """load json files from db and convert to results_data.
        Output: a DataFrame with at least these columns:
                'algorithm'
                'parameters'
                self.metric
        """

####################################################################### Manager
def main():
    pennai = AI()
    try:
        while True:
            print('checking requests...')
            if pennai.check_requests():
                pennai.send_rec()
            print('checking results...')
            if pennai.check_results(time.gmtime()):
                pennai.update_recommender()
            sleep(5)
    except (KeyboardInterrupt, SystemExit):
        print('Saving current AI state and closing....')
    finally:
        pennai.save_state()

if __name__ == '__main__':
    main()
