"""
AI agent for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from time import sleep
import datetime
import json
import pickle
import requests
import urllib.request, urllib.parse
import pdb
import time
from ai.validate_recommendation import validate_recs
import os
from ai.recommender.average_recommender import AverageRecommender
from collections import OrderedDict

ml_ids = {
        'BernoulliNB':'5813bdaec1321420f8bbcc7f',
        'DecisionTreeClassifier':'5817660338215335404347c7',
        'DecisionTreeRegressor':'5853571ca52513003444131b',
        'ElasticNetCV':'58535850a52513003444131e',
        'ExtraTreesClassifier':'581791063821533540434826',
        'ExtraTreesRegressor':'585358eba52513003444131f',
        'GP-simplified':'57bf24e1548cd20008bc71df',
        'GaussianNB':'5813bdb8c1321420f8bbcc80',
        'GradientBoostingClassifier':'581796a43821533540434890',
        'GradientBoostingRegressor':'58535984a525130034441320',
        'KNeighborsClassifier':'5817a21138215335404348cd',
        'KNeighborsRegressor':'58535a05a525130034441321',
        'LassoLarsCV':'58535a5aa525130034441322',
        'LinearSVC':'5817a73538215335404348ee',
        'LinearSVR':'58535b31a525130034441326',
        'LogisticRegression':'5817ad7f3821533540434948',
        'MDR.js':'57c5a83f4b09d40023ee4f6e',
        'Meta-GA':'58535b8fa525130034441327',
        'MultinomialNB':'5813bdc4c1321420f8bbcc81',
        'RandomForestClassifier':'5817af52382153354043496e',
        'RandomForestRegressor':'58535c7ea525130034441328',
        'RidgeCV':'58535d09a525130034441329',
        'deap-GP-SymbReg':'58535d64a52513003444132a'
        }

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

    def __init__(self,rec=TimeRecommender(),
                 db_path=os.environ['FGLAB_URL'],
                 #db_path='http://hoth.pmacs.upenn.edu:5080',
                 extra_payload=dict(),
                 user='testuser',rec_score_file='rec_state.obj',
                 verbose=True,warm_start=True):
        """initializes AI managing agent."""
        self.rec = rec
        # access to database
        self.db_path = db_path
        self.exp_path = '/'.join([self.db_path,'api/experiments'])
        self.data_path = '/'.join([self.db_path,'api/datasets'])
        self.status_path = '/'.join([self.db_path,'api/v1/datasets'])
        self.submit_path = '/'.join([self.db_path,'api/v1/projects'])
        self.user=user
        self.verbose = verbose #False: no printouts, True: printouts on updates
        # api key for the recommender
        self.api_key='Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E='
        # optional extra payloads (e.g. user id) for posting to the db
        self.extra_payload = extra_payload
        # file name of stored scores for the recommender
        self.rec_score_file = rec_score_file
        # requests queue
        self.request_queue = []
        # static payload is the payload that is constant for every API post
        self.static_payload = {'apikey':self.api_key}#,
                               # 'user':self.user}
        # add any extra payload
        self.static_payload.update(extra_payload)
        # header info
        self.header = {'content-type': 'application/json'}
        # timestamp for updates
        # self.last_update = int(datetime.datetime.now().strftime("%s")) * 1000
        self.last_update = 0
        # if there is a file, load it as the recommender scores
        self.warm_start = warm_start
        if os.path.isfile(self.rec_score_file) and self.warm_start:
            self.load_state()

    def load_state(self):
        """loads pickled score file."""
        if os.stat(self.rec_score_file).st_size != 0:
            filehandler = open(self.rec_score_file,'rb')
            state = pickle.load(filehandler)
            self.rec.scores = state['scores']
            self.rec.trained_dataset_models = state['trained_dataset_models']
            self.last_update = state['last_update']
            if self.verbose:
                print('loaded previous state from ',self.last_update)

    def check_requests(self,debug=False):
        """Returns true if new AI request has been submitted by user."""
        print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
              ':','checking requests...')
        if debug:
            responses = [{'_id': '5930f023ffb08f0832362efd', 'files': [{'filename': 'mushroom.csv', '_id': '5930f023ffb08f0832362eff', 'mimetype': 'text/csv'}, {'filename': 'README.md', '_id': '5930f023ffb08f0832362efe', 'mimetype': 'text/x-markdown'}], 'ai': 'requested', 'name': 'Mushrooms', 'username': 'testuser'}, {'_id': '5930f023ffb08f0832362f06', 'files': [{'filename': 'README.md', '_id': '5930f023ffb08f0832362f0a', 'mimetype': 'text/x-markdown'}, {'filename': 'adult.csv', '_id': '5930f023ffb08f0832362f0b', 'mimetype': 'text/csv'}], 'ai': 'requested', 'name': 'Adults', 'username': 'testuser'}]
        else:
            payload = {'ai':'requested'}
            payload.update(self.static_payload)

            r = requests.post(self.data_path,data=json.dumps(payload),
                              headers=self.header)
            responses = json.loads(r.text)
        # if there are any requests, add them to the queue and return True
        if len(responses) > 0:
            self.request_queue = responses
            if self.verbose:
                print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                      ':','new ai request for:',[r['name'] for r in responses])
            if not debug:
                # set AI flag to 'true' to acknowledge requests received
                payload= {'ai':True}
                payload.update(self.static_payload)
                for r in self.request_queue:
                    data_submit_path = '/'.join([self.submit_path,r['_id'],'ai'])
                    tmp = requests.post(data_submit_path,data=json.dumps(payload),
                                      headers=self.header)
            return True

        return False

    def check_results(self,debug=False):
        """Returns true if new results have been posted since the previous
        time step."""
        if self.verbose:
            print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                  ':','checking results...')
        if debug:
            # DEBUG: load results from pickle
            f = open('experiments_response.obj','rb')
            data = pickle.load(f)
        else:
            # get new results
            payload = {'date_start':self.last_update,'status':'success'}
            payload.update(self.static_payload)
            params = json.dumps(payload).encode('utf8')
            req = urllib.request.Request(self.exp_path, data=params,
                                       headers=self.header)
            r = urllib.request.urlopen(req)
            data = json.loads(r.read().decode(r.info().get_param('charset')
                                              or 'utf-8'))

        if len(data) > 0:
            # if there are new results, return True
            if self.verbose:
                print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                      ':',len(data),' new results!')
            #process new results
            self.process_new_results(data)
            # update timestamp
            self.last_update = int(datetime.datetime.now().strftime("%s"))*1000
            return True

        return False

    def process_new_results(self,data):
        """Returns a dataframe of new results from the DB"""
        # clean up response
        processed_data = []
        for d in data:
            if '_options' in d.keys() and '_scores' in d.keys() and all (k in d['_scores'] for k in ('accuracy_score','f1_score','balanced_accuracy')):
                processed_data.append(
                    {'dataset':d['_dataset_id'],
                    'algorithm':d['_project_id'],
                    'accuracy':d['_scores']['accuracy_score'],
                    'f1':d['_scores']['f1_score'],
                    'balanced_accuracy':d['_scores']['balanced_accuracy'],
                    'parameters':str(d['_options']),
                    # 'parameters':str(OrderedDict(sorted(d['_options'].items(),
                    #                                     key=lambda x:x[1],
                    #                                     reverse=True)))
                    })

        self.new_data = pd.DataFrame(processed_data)
        # print('results:\n',results)
        # df = pd.DataFrame(response)
        # ai = pd.DataFrame(response[0]['ai'])
        # print('dataframe:\n',self.new_data.head())
        # print('ai:',ai)


    def send_rec(self):
        """Sends recommendation to the API."""
        i = 0
        for r in self.request_queue:
            dataset = r['name']
            # get recommendation for dataset
            ml,p,ai_scores = self.rec.recommend(dataset_id=r['_id'])
            # ml,p = validate_recs(ml,p)

            for alg,params,score in zip(ml,p,ai_scores):
                # validate recommendations against available options
                alg,params = validate_recs(alg,params)

                rec = {'dataset_id':r['_id'],
                        # 'dataset_name':r['name'],
                        'algorithm_id':alg,
                        # 'ml_name':alg,
                        'parameters':eval(params),
                        'ai_score':score,
                        }
                # # add recommended parameters
                # for p in params.sep(','):
                #     rec[-1]['parameters'][p.split(':')[0]] = p.split(':')[1]
                rec.update(self.static_payload)
                # submit path is ml_id/experiment
                rec_path = '/'.join([self.submit_path,
                                        rec['algorithm_id'],
                                        'experiment'])
                # post recommendations
                requests.post(rec_path,data=json.dumps(rec),headers=self.header)
                #submit update to dataset to indicate ai:True
                payload= {'ai':'finished'}
                payload.update(self.static_payload)
                status_submit_path = '/'.join([self.status_path,r['_id'],'ai'])
                r = requests.put(status_submit_path,data=json.dumps(payload),
#                data_submit_path = '/'.join([self.submit_path,r['_id'],'ai'])
#                tmp = requests.post(data_submit_path,data=json.dumps(payload),
                                  headers=self.header)
            i += 1
        if self.verbose:
            print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                  ':',' sent ',i,' recommendations')

    def update_recommender(self):
        """Updates recommender based on new results."""
        # update recommender
        self.rec.update(self.new_data)
        if self.verbose:
            print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                 'recommender updated')
        # reset new data
        self.new_data = pd.DataFrame()

    def save_state(self):
        """Save ML+P scores in pickle or to DB"""
        out = open(self.rec_score_file,'wb')
        state={}
        state['scores'] = self.rec.scores
        state['trained_dataset_models'] = self.rec.trained_dataset_models
        state['last_update'] = self.last_update
        pickle.dump(state, out)

    def db_to_results_data(self,response):
        """load json files from db and convert to results_data.
        Output: a DataFrame with at least these columns:
                'algorithm'
                'parameters'
                self.metric
        """

####################################################################### Manager
def main():
    print('=======','Penn AI','=======',sep='\n')
    pennai = AI(warm_start=True)
    debug = False
    try:
        while True:
            # check for new experiment results
            if pennai.check_results(debug=debug):
                pennai.update_recommender()
            # check for new recommendation requests
            if pennai.check_requests(debug=debug):
                pennai.send_rec()
            sleep(5)
    except (KeyboardInterrupt, SystemExit):
        print('Saving current AI state and closing....')
    finally:
        pennai.save_state()

if __name__ == '__main__':
    main()
