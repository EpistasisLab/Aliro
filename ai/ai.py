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
import ai.db_utils as db_utils
import os
import ai.q_utils as q_utils
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.weighted_recommender import WeightedRecommender
from ai.recommender.time_recommender import TimeRecommender
from ai.recommender.exhaustive_recommender import ExhaustiveRecommender
from collections import OrderedDict

#encoder for numpy in json
class JasonEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(JasonEncoder, self).default(obj)

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

    def __init__(self,rec=None,db_path='http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT'],
                 extra_payload=dict(),
                 user='testuser',rec_score_file='rec_state.obj',
                 verbose=True,warm_start=False, n_recs=1, datasets=False):
        """initializes AI managing agent."""
        # recommender settings
        self.rec = rec
        self.n_recs=n_recs if n_recs>0 else 1
        self.continous= n_recs<1
        # access to database
        self.db_path = db_path
        self.exp_path = '/'.join([self.db_path,'api/experiments'])
        self.data_path = '/'.join([self.db_path,'api/datasets'])
        self.projects_path = '/'.join([self.db_path,'api/v1/projects'])
        self.status_path = '/'.join([self.db_path,'api/v1/datasets'])
        self.submit_path = '/'.join([self.db_path,'api/userdatasets'])
        self.algo_path = '/'.join([self.db_path,'api/projects'])
        self.user=user
        self.verbose = verbose #False: no printouts, True: printouts on updates
        # api key for the recommender
        self.api_key=os.environ['APIKEY']
        # optional extra payloads (e.g. user id) for posting to the db
        self.extra_payload = extra_payload
        # file name of stored scores for the recommender
        self.rec_score_file = rec_score_file
        # requests queue
        self.request_queue = []
        # static payload is the payload that is constant for every API post
        # with api key for this host
        self.static_payload = {'apikey':self.api_key}#,
        # add any extra payload
        self.static_payload.update(extra_payload)
        # header info
        self.header = {'content-type': 'application/json'}
        # timestamp for updates
        # self.last_update = int(datetime.datetime.now().strftime("%s")) * 1000
        self.last_update = 0
        # if there is a file, load it as the recommender scores
        self.warm_start = warm_start
        self.load_options()
        if os.path.isfile(self.rec_score_file) and self.warm_start:
            self.load_state()
        if not rec:
            self.rec = RandomRecommender(db_path=self.db_path,api_key=self.api_key)
        # build dictionary of ml ids to names conversion
        self.ml_id_to_name = db_utils.get_ml_id_dict(self.algo_path,self.api_key)
        # build dictionary of dataset ids to names conversion
        self.user_datasets = db_utils.get_user_datasets(self.submit_path,self.api_key,self.user)
        # toggled datasets
        self.dataset_threads = {}

        # verbosity...
        print("paths:")
        print("self.db_path: ", self.db_path)
        print("self.exp_path: ", self.exp_path)
        print("self.data_path: ", self.data_path)
        print("self.projects_path: ", self.projects_path)
        print("self.status_path: ", self.status_path)
        print("self.submit_path: ", self.submit_path)
        print("self.algo_path: ", self.algo_path)

        # for comma-separated list of datasets in datasets, turn AI request on
        if datasets:
            data_usersets = dict(zip(self.user_datasets.values(),self.user_datasets.keys()))
            print(data_usersets)
            for ds in datasets.split(','):
                payload = {'ai': 'requested'}
                data_submit_path = '/'.join([self.submit_path,data_usersets[ds],'ai'])
                print('submitting ai requested to ',data_submit_path)
                tmp = requests.put(data_submit_path,data=json.dumps(payload),
                    headers=self.header)

    def load_state(self):
        """loads pickled score file."""
        if os.stat(self.rec_score_file).st_size != 0:
            filehandler = open(self.rec_score_file,'rb')
            state = pickle.load(filehandler)
            if(hasattr(self.rec, 'scores')):
              self.rec.scores = state['scores']
              self.rec.trained_dataset_models = state['trained_dataset_models']
              self.last_update = state['last_update']
              if self.verbose:
                  print('loaded previous state from ',self.last_update)

    def load_options(self):
        """Returns true if new AI request has been submitted by user."""
        print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
              ':','loading options...')
        v = requests.post(self.projects_path,data=json.dumps(self.static_payload),
                          headers=self.header)
        responses = json.loads(v.text)
        self.ui_options = responses
        if len(responses) > 0:
            self.ui_options = responses
            #if self.verbose:
                #print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                #      ':','new ai request for:',r for r in responses])
            #return True
        return False


    def check_requests(self):
        """Returns true if new AI request has been submitted by user."""

        print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
              ':','checking requests...')

        if self.continous:
            payload = {'ai':['requested','finished']}
        else:
            payload = {'ai':['requested','dummy']}

        payload.update(self.static_payload)
        r = requests.post(self.data_path,data=json.dumps(payload), headers=self.header)
        responses = json.loads(r.text)
        #print(responses);
        #pdb.set_trace()

        # if there are any requests, add them to the queue and return True
        if len(responses) > 0:
            self.request_queue = responses
            if self.verbose:
                print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                      ':','new ai request for:',[r['name'] for r in responses])
            # set AI flag to 'true' to acknowledge requests received
            payload= {'ai':'on'}
            payload.update(self.static_payload)
            for r in self.request_queue:
                data_submit_path = '/'.join([self.submit_path,r['_id'],'ai'])
                tmp = requests.put(data_submit_path,data=json.dumps(payload),
                                      headers=self.header)
                q_utils.startQ(self,r['_id'])
            return True

        return False

    def check_results(self):
        """Returns true if new results have been posted since the previous
        time step."""
        if self.verbose:
            print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                  ':','checking results...')

        # get new results
        payload = {'date_start':self.last_update,'has_scores':True}
        payload.update(self.static_payload)
        params = json.dumps(payload).encode('utf8')
        print("requesting from : ", self.exp_path)
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
            if '_options' in d.keys() and '_scores' in d.keys() and '_dataset_id' in d.keys():
                frame={
                    'dataset':d['_dataset_id'],
                    'algorithm':d['_project_id'],
                    'accuracy':d['_scores']['accuracy_score'],
                    'f1':d['_scores']['f1_score'],
                    'parameters':str(d['_options']),
                    }
                if(hasattr(d['_scores'],'balanced_accuracy')):
                    frame['balanced_accuracy'] = d['_scores']['balanced_accuracy'];
                processed_data.append(frame)
            else:
              print("new results are missing these fields:",
                      '_options' if '_options' not in d.keys() else '',
                      '_scores' if '_scores' not in d.keys() else '',
                      '_dataset_id' if '_dataset_id' not in d.keys() else '')
              #print(d)
        new_data = pd.DataFrame(processed_data)
        if(len(new_data) >= 1):
          self.new_data = new_data
        else:
          print("no new data")
          #print(self.new_data)
        # print('results:\n',results)
        # df = pd.DataFrame(response)
        # ai = pd.DataFrame(response[0]['ai'])
        # print('dataframe:\n',self.new_data.head())
        # print('ai:',ai)

    def transfer_rec(self,rec_payload):
            """performs http transfer of recommendation"""
            experimentData = json.dumps(rec_payload,cls=JasonEncoder)
            submitstatus = self.post_experiment(rec_payload['algorithm_id'], experimentData)

            while('error' in submitstatus and submitstatus['error'] == 'No machine capacity available'):
                print('slow it down pal', submitstatus['error'])
                sleep(3)
                submitstatus = self.post_experiment(rec_payload['algorithm_id'], experimentData)

            if 'error' in submitstatus:
                print('unrecoverable error during transfer_rec '  )
                print(submitstatus['error'])
                pdb.set_trace()


    def process_rec(self):
        """Sends recommendation to the API."""
        i = 0
        for r in self.request_queue:
            dataset = r['name']
            # get recommendation for dataset
            ml,p,ai_scores = self.rec.recommend(dataset_id=r['_id'],n_recs=self.n_recs)
            self.rec.last_n = 0
            for alg,params,score in zip(ml,p,ai_scores):
                # turn params into a dictionary
                modified_params = eval(params)
                #print(modified_params.max_features)
                rec_payload = {'dataset_id':r['_id'],
                        # 'dataset_name':r['name'],
                        'algorithm_id':alg,
                        # 'ml_name':alg,
                        'username':self.user,
                        'parameters':modified_params,
                        'ai_score':score,
                        }
                if self.verbose:
                    print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                        ':','recommended',self.ml_id_to_name[alg],'with',params,'for',r['name'])

                # add static payload
                rec_payload.update(self.static_payload)
                # do http transfer
                #transfer_status = self.transfer_rec(rec_payload)
                q_utils.addToQueue(self,r,rec_payload)
                #print('wait for it...')
                #sleep(1)

                #submit update to dataset to indicate ai:True
            #payload= {'ai':'finished'} # h note - re-enable this once the queuing functionaity has been moved to lab server
            payload= {'ai':'queuing'}
            data_submit_path = '/'.join([self.submit_path,r['_id'],'ai'])
            tmp = requests.put(data_submit_path,data=json.dumps(payload),
                headers=self.header)
            i += 1
        if self.verbose:
            print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                  ':','processed',i,'requests')


    #h note - this seems to be deprecated
    def send_rec(self):
        """Sends recommendation to the API."""
        i = 0
        for r in self.request_queue:
            dataset = r['name']
            # get recommendation for dataset
            ml,p,ai_scores = self.rec.recommend(dataset_id=r['_id'],n_recs=self.n_recs)

            for alg,params,score in zip(ml,p,ai_scores):
                # turn params into a dictionary
                modified_params = eval(params)
                #print(modified_params.max_features)
                rec_payload = {'dataset_id':r['_id'],
                        # 'dataset_name':r['name'],
                        'algorithm_id':alg,
                        # 'ml_name':alg,
                        'parameters':modified_params,
                        'ai_score':score,
                        }
                if self.verbose:
                    print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                        ':','recommended',self.ml_id_to_name[alg],'with',params,'for',r['name'])
                # add static payload
                rec_payload.update(self.static_payload)
                # do http transfer
                transfer_status = self.transfer_rec(rec_payload)

                #submit update to dataset to indicate ai:True
            payload= {'ai':'finished'}
            data_submit_path = '/'.join([self.submit_path,r['_id'],'ai'])
            tmp = requests.put(data_submit_path,data=json.dumps(payload),
                headers=self.header)
            i += 1
        if self.verbose:
            print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                  ':','processed',i,'requests')

    def update_recommender(self):
        """Updates recommender based on new results."""
        # update recommender
        #print(self);
        if(hasattr(self,'new_data') and len(self.new_data) >= 1):
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
        if(hasattr(self.rec, 'scores')):
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

    #################
    # Utility methods
    #################
    def post_experiment(self, algorithmId, experimentData):
        self.projects_path = '/'.join([self.db_path,'api/v1/projects'])
        rec_path = '/'.join([self.projects_path, algorithmId, 'experiment'])
        
        try:
            res=requests.post(rec_path,data=experimentData,headers=self.header)
        except:
            print("Unexpected error in post_experiment for path '", rec_path, "':", sys.exc_info()[0])
            raise

        submitresponses = json.loads(res.text)

        #parse json response into named array
        submitstatus={}
        if len(submitresponses) > 0:
            for submiti in submitresponses:
                submitstatus[submiti] = submitresponses[submiti]

        return submitstatus

    def set_ai_status(self, datasetId, aiStatus):
        """set the ai status for the given dataset"""
        payload= {'ai':aiStatus}
        data_submit_path = '/'.join([self.submit_path, datasetId,'ai'])
        try:
            tmp = requests.put(data_submit_path,data=json.dumps(payload), headers=self.header)
        except:
            print("Unexpected error in set_ai_status for path '", data_submit_path, "':", sys.exc_info()[0])
            raise

####################################################################### Manager
import argparse

def main():
    """Handles command line arguments and runs Penn-AI."""
    parser = argparse.ArgumentParser(description='PennAI is a recommendation system for data'
                                    ' science. ', add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-rec',action='store',dest='REC',default='random',
                        choices = ['random','average','exhaustive'],
                        help='Recommender algorithm options.')
    parser.add_argument('-db_path',action='store',dest='DB_PATH',default='http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT'],
                        help='Path to the database.')
    parser.add_argument('-u',action='store',dest='USER',default='testuser',help='user name')
    parser.add_argument('-t',action='store',dest='DATASETS',help='turn on ai for these datasets')
    parser.add_argument('-n_recs',action='store',dest='N_RECS',type=int,default=1,help='Number of '
                        ' recommendations to make at a time. If zero, will send continous '
                        'recommendations until AI is turned off.')
    parser.add_argument('-v','-verbose',action='store_true',dest='VERBOSE',default=True,
                        help='Print out more messages.')
    parser.add_argument('-warm',action='store_true',dest='WARM_START',default=False,
                        help='Start from last saved session.')

    args = parser.parse_args()
    print(args)

    # dictionary of default recommenders to choose from at the command line.
    name_to_rec = {'random': RandomRecommender(db_path=args.DB_PATH,
                                                api_key=os.environ['APIKEY']),
            'average': AverageRecommender(),
            'exhaustive': ExhaustiveRecommender(db_path=args.DB_PATH,api_key=os.environ['APIKEY'])
            }
    print('=======','Penn AI','=======')#,sep='\n')

    pennai = AI(rec=name_to_rec[args.REC],db_path=args.DB_PATH, user=args.USER,
                verbose=args.VERBOSE, n_recs=args.N_RECS, warm_start=args.WARM_START,
                datasets=args.DATASETS)

    n = 0;
    try:
        while True:
            # check for new experiment results
            if pennai.check_results():
                pennai.update_recommender()
            # check for new recommendation requests
            if pennai.check_requests():
               pennai.process_rec()
                #pennai.send_rec()
            n = n + 1
            sleep(4)

    except (KeyboardInterrupt, SystemExit):
        print('Saving current AI state and closing....')
    finally:
        # tell queues to exit
        print("foo")
        q_utils.exitFlag=1
        pennai.save_state()

if __name__ == '__main__':
    main()
