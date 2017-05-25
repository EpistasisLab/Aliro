"""
AI agent for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from time import sleep
import json
import urllib
import requests
import pdb
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
    """

    def __init__(self,rec=Recommender(),
                 db_path='http://ibi-admin-031.med.upenn.edu/api/datasets',
                 extra_payload=dict()):
        self.rec = rec
        # access to database
        self.db_path = db_path
        # api key for the recommender
        self.api_key='Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E='
        # optional extra payloads (e.g. user id) for posting to the db
        self.extra_payload = extra_payload
        # load previous state

    def check_requests(self):
        """Returns true if new AI request has been submitted by user."""
        return False
    def check_results(self):
        """Returns true if new results have been posted since the previous
        time step."""
        return False
    def get_new_results(self,timestamp=None):
        """Returns a dataframe of new results from the DB"""
        # payload = {'token':self.api_key,
        #         #    'filter_ids':self.trained_data_ids,
        #             'algorithm': self.models,
        #             'experiments': 'finished',
        #           }
        # payload.update(self.extra_payload)
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
                    {'experiment_id': 12345,
                     'dataset': "Gametes",
                     'algorithm':"LogisticRegression",
                     'parameters':{'alpha': 0.1, 'C': 100.0},
                     'accuracy': 0.75
                     },
                    {'experiment_id': 4623,
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
        """Sends recommendation to the API."""
        ml,p = self.rec.recommend()
        recs = []
        for algs,params in zip(ml,p):
            rec.append({'recommendation':{'algorithm':ml,
                               'parameters':p}
             })
        # dump recommendations
        json.dumps(rec)

    def update(self):
        """Updates recommender based on new results."""
        # get new results
        new_data = self.get_new_results()
        self.rec.update(new_data)

    def save_state(self):
        """Save ML+P scores in pickle or to DB"""

    def db_to_results_data(self,response):
        """load json files from db and convert to results_data.
        Output: a DataFrame with at least these columns:
                'algorithm'
                'parameters'
                self.metric
        """

######################################################## Manager
def main():
    pennai = AI()
    try:
        while True:
            print('checking requests...')
            if pennai.check_requests():
                pennai.send_rec()
            print('checking results...')
            if pennai.check_results():
                pennai.update()
            sleep(5)
    except (KeyboardInterrupt, SystemExit):
        print('Saving current AI state and closing....')
    finally:
        pennai.save_state()

if __name__ == '__main__':
    main()
