#
# AI agent for Penn AI.
#
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from time import sleep
import time
import datetime
import json
import pickle
import pdb
import ai.api_utils as api_utils
from ai.api_utils import LabApi
import os
import ai.q_utils as q_utils
import ai.knowledgebase_loader as knowledgebase_loader
import logging
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.weighted_recommender import WeightedRecommender
from ai.recommender.time_recommender import TimeRecommender
from ai.recommender.exhaustive_recommender import ExhaustiveRecommender
from ai.recommender.meta_recommender import MetaRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
from ai.recommender.svd_recommender import SVDRecommender
from collections import OrderedDict

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class AI():
    """AI managing agent for Penn AI.

    Responsible for:
    - checking for user requests for recommendations,
    - checking for new results from experiments,
    - calling the recommender system to generate experiment recommendations,
    - posting the recommendations to the API.
    - handling communication with the API.

    :param rec: ai.BaseRecommender - recommender to use
    :param api_path: string - path to the lab api server
    :param extra_payload: dict - any additional payload that needs to be specified
    :param user: string - test user
    :param rec_score_file: file - pickled score file to keep persistent scores between sessions
    :param verbose: Boolean
    :param warm_start: Boolean - if true, attempt to load the ai state from the file provided by rec_score_file
    :param n_recs: int - number of recommendations to make for each request
    :param datasets: str or False - if not false, a comma seperated list of datasets to turn the ai on for at startup 
    :param use_pmlb_knowledgebase: Boolean

    """

    def __init__(self,
                rec=None,
                api_path=None,
                extra_payload=dict(),
                user='testuser', 
                rec_score_file='rec_state.obj',
                verbose=True,
                warm_start=False, 
                n_recs=1, 
                datasets=False,
                use_knowledgebase=False):
        """initializes AI managing agent."""
        # recommender settings
        if api_path == None:
            api_path = 'http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT']
        self.rec = rec
        self.n_recs=n_recs if n_recs>0 else 1
        self.continous= n_recs<1

        # api parameters, will be removed from self once the recommenders no longer call the api directly.
        # See #98 <https://github.com/EpistasisLab/pennai/issues/98>
        self.user=user
        self.api_path=api_path
        self.api_key=os.environ['APIKEY']

        self.verbose = verbose #False: no printouts, True: printouts on updates

        # file name of stored scores for the recommender
        self.rec_score_file = rec_score_file

        # queue of datasets requesting ai recommendations
        self.request_queue = []
        # timestamp of the last time new experiments were processed
        self.last_update = 0

        # api
        self.labApi = api_utils.LabApi(
            api_path=self.api_path, 
            user=self.user, 
            api_key=self.api_key, 
            extra_payload=extra_payload,
            verbose=self.verbose)

        self.load_options() #loads algorithm parameters to self.ui_options 

        # if there is a pickle file, load it as the recommender scores
        self.warm_start = warm_start
        if os.path.isfile(self.rec_score_file) and self.warm_start:
            self.load_state()
        
        if rec:
            if hasattr(rec,'ml_p'):
                self.rec.ml_p = self.labApi.get_all_ml_p()
            if hasattr(rec,'mlp_combos'):
                self.rec.mlp_combos = self.rec.ml_p['algorithm']+'|'+self.rec.ml_p['parameters']
        else: # default to random recommender
            self.rec = RandomRecommender(ml_p = self.labApi.get_all_ml_p())
        # tmp = self.labApi.get_all_ml_p()
        # tmp.to_csv('ml_p_options.csv') 
        # build dictionary of ml ids to names conversion
        self.ml_id_to_name = self.labApi.get_ml_id_dict()
        # print('ml_id_to_name:',self.ml_id_to_name)
        # build dictionary of dataset ids to names conversion
        self.user_datasets = self.labApi.get_user_datasets(self.user)
        # dictionary of dataset threads, initilized and used by q_utils.  Keys are datasetIds, values are q_utils.DatasetThread instances.
        self.dataset_threads = {}

        # for comma-separated list of datasets in datasets, turn AI request on
        if datasets:
            data_usersets = dict(zip(self.user_datasets.values(),self.user_datasets.keys()))
            print(data_usersets)
            for ds in datasets.split(','):
                tmp = self.labApi.set_ai_status(datasetId = data_usersets[ds], 
                                                aiStatus = 'requested')
        
        # local dataframe of datasets and their metafeatures
        self.dataset_mf = pd.DataFrame()

        if use_knowledgebase:
            self.load_knowledgebase()

        
    def load_knowledgebase(self):
        """ Bootstrap the recommenders with the knowledgebase
        """
        print('loading pmlb knowledgebase')

        kb = knowledgebase_loader.load_pmlb_knowledgebase()
        # replace algorithm names with their ids
        self.ml_name_to_id = {v:k for k,v in self.ml_id_to_name.items()}
        kb['resultsData']['algorithm'] = kb['resultsData']['algorithm'].apply(
                                          lambda x: self.ml_name_to_id[x])
        all_df_mf = pd.DataFrame.from_records(kb['metafeaturesData']).transpose()
        # keep only metafeatures with results
        self.dataset_mf = all_df_mf.reindex(kb['resultsData'].dataset.unique()) 
        # self.update_dataset_mf(kb['resultsData'])
        self.rec.update(kb['resultsData'], self.dataset_mf)
        
        print('pmlb knowledgebase loaded')

    def load_options(self):
        """Loads algorithm UI parameters and sets them to self.ui_options."""

        print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
              ':','loading options...')

        responses = self.labApi.get_projects()

        if len(responses) > 0:
            self.ui_options = responses
        else:
            print("WARNING: no algorithms found by load_options()")


    def check_requests(self):
        """Check to see if any new AI requests have been submitted.  If so, add them to self.request_queue.

        :returns: Boolean - True if new AI requests have been submitted
        """

        print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
              ':','checking requests...')

        if self.continous:
            dsFilter = {'ai':['requested','finished']}
        else:
            dsFilter = {'ai':['requested', 'dummy']}

        responses = self.labApi.get_filtered_datasets(dsFilter)

        # if there are any requests, add them to the queue and return True
        if len(responses) > 0:
            self.request_queue = responses
            if self.verbose:
                print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                      ':','new ai request for:',[r['name'] for r in responses])
            
            # set AI flag to 'on' to acknowledge requests received
            for r in self.request_queue:
                tmp = self.labApi.set_ai_status(datasetId = r['_id'], aiStatus = 'on')
                q_utils.startQ(ai=self, datasetId=r['_id'])
            return True

        return False


    def check_results(self):
        """Checks to see if new experiment results have been posted since the previous
        time step. If so, set them to self.new_data and return True.

        :returns: Boolean - True if new results were found
        """
        if self.verbose:
            print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                  ':','checking results...')

        newResultsDict = self.labApi.get_new_experiments(last_update=self.last_update)

        if len(newResultsDict) > 0:
            if self.verbose:
                print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                      ':',len(newResultsDict),' new results!')
            
            self.process_new_results(newResultsDict) # process new results as a dataframe and set them to self.new_data
            self.last_update = int(time.time())*1000 # update timestamp
            return True

        return False
    
    def process_new_results(self, data):
        """Transforms a dictionary of data representing new experiment results into a dataframe and
        sets them to self.new_data

        :param data: dictionary - results from labApi.get_new_experiments()
        """

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
        # TODO - grab and add metafeatures to dataframe
        new_data = pd.DataFrame(processed_data)

        if(len(new_data) >= 1):
          self.new_data = new_data
        else:
          print("no new data")

    def transfer_rec(self, rec_payload):
            """Attempt to send a recommendation to the lab server.
            Continues until recommendation is successfully submitted or an unexpected error occurs.

            :param rec_payload: dictionary - the payload describing the experiment
            """
            logger.info("transfer_rec(" + str(rec_payload) + ")")
            submitstatus = self.labApi.launch_experiment(algorithmId=rec_payload['algorithm_id'], 
                                                         payload=rec_payload)

            logger.debug("transfer_rec() starting loop, submitstatus: " + str(submitstatus))
            while('error' in submitstatus and submitstatus['error'] == 'No machine capacity available'):
                print('slow it down pal', submitstatus['error'])
                sleep(3)
                submitstatus = self.labApi.launch_experiment(rec_payload['algorithm_id'], rec_payload)

            logger.debug("transfer_rec() exiting loop, submitstatus: " + str(submitstatus))

            if 'error' in submitstatus:
                msg = 'Unrecoverable error during transfer_rec : ' + str(submitstatus)
                logger.error(msg)
                print(msg)
                raise RuntimeError(msg)
                #pdb.set_trace()


    def process_rec(self):
        """Generates requested experiment recommendations and adds them to the queue."""

        # get recommendation for dataset
        for r in self.request_queue:
            ml,p,ai_scores = self.rec.recommend(dataset_id=r['_id'], n_recs=self.n_recs,
                                                dataset_mf=self.labApi.get_metafeatures(r['_id']))
            self.rec.last_n = 0
            for alg,params,score in zip(ml,p,ai_scores):
                modified_params = eval(params) # turn params into a dictionary
                
                rec_payload = {'dataset_id':r['_id'],
                        'algorithm_id':alg,
                        'username':self.user,
                        'parameters':modified_params,
                        'ai_score':score,
                        }
                if self.verbose:
                    print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                        ':','recommended',self.ml_id_to_name[alg],'with',params,'for',r['name'])
                # TODO: check termination conditions 
                q_utils.addExperimentToQueue(ai=self, datasetId=r['_id'], experimentPayload=rec_payload)

            #tmp = self.labApi.set_ai_status(datasetId = r['_id'], aiStatus = 'finished') # h note - re-enable this once the queuing functionaity has been moved to lab server
            tmp = self.labApi.set_ai_status(datasetId = r['_id'], aiStatus = 'queuing')


    def update_recommender(self):
        """Update recommender models based on new experiment results in self.new_data, 
            and then clear self.new_data. 
        """

        if(hasattr(self,'new_data') and len(self.new_data) >= 1):
            self.update_dataset_mf(self.new_data)
            self.rec.update(self.new_data,self.dataset_mf)
            if self.verbose:
                print(time.strftime("%Y %I:%M:%S %p %Z",time.localtime()),
                     'recommender updated')
            # reset new data
            self.new_data = pd.DataFrame()

    def save_state(self):
        """Save ML+P scores in pickle or to DB

        TODO: test that this still works
        """
        out = open(self.rec_score_file,'wb')
        state={}
        if(hasattr(self.rec, 'scores')):
            state['scores'] = self.rec.scores #TODO: make this a more generic. Maybe just save the 
                                              # AI or rec object itself. 
        # state['trained_dataset_models'] = self.rec.trained_dataset_models
        state['last_update'] = self.last_update
        pickle.dump(state, out)

    def load_state(self):
        """Loads pickled score file and recommender model.

        TODO: test that this still works
        """
        if os.stat(self.rec_score_file).st_size != 0:
            filehandler = open(self.rec_score_file,'rb')
            state = pickle.load(filehandler)
            if(hasattr(self.rec, 'scores')):
              self.rec.scores = state['scores']
              # self.rec.trained_dataset_models = state['trained_dataset_models']
              self.last_update = state['last_update']
              if self.verbose:
                  print('loaded previous state from ',self.last_update)

    def update_dataset_mf(self,results_data):
        """Grabs metafeatures of datasets in results_data
        
        :param results_data: experiment results with associated datasets
        
        """
        print('in AI::update_dataset_mf')
        print('results_data:',results_data.columns)
        print('results_data:',results_data.head())
        dataset_metafeatures = []
        for d in results_data['dataset'].unique():
            if len(self.dataset_mf)==0 or d not in self.dataset_mf.index:
                # fetch metafeatures from server for dataset and append
                df = self.labApi.get_metafeatures(d)        
                df['dataset'] = d
                # print('metafeatures:',df)
                dataset_metafeatures.append(df)
        if dataset_metafeatures:
            df_mf = pd.concat(dataset_metafeatures).set_index('dataset')
            # print('df_mf:',df_mf['dataset'], df_mf) 
            self.dataset_mf = self.dataset_mf.append(df_mf)
            # print('self.dataset_mf:\n',self.dataset_mf)
         

####################################################################### Manager
import argparse

def main():
    """Handles command line arguments and runs Penn-AI."""
    parser = argparse.ArgumentParser(description='PennAI is a recommendation system for data'
                                    ' science. ', add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-rec',action='store',dest='REC',default='random',
                        choices = ['random','average','exhaustive','meta','knn','svd'],
                        help='Recommender algorithm options.')
    parser.add_argument('-api_path',action='store',dest='API_PATH',default='http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT'],
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
    parser.add_argument('-sleep',action='store',dest='SLEEP_TIME',default=4, 
                        help='Time to wait for pinging the server for results/ recommendation requests')
    parser.add_argument('--knowledgebase','-k', action='store_true',dest='USE_KNOWLEDGEBASE',
                        default=False, 
                        help='Load a knowledgebase for the recommender')

    args = parser.parse_args()
    print(args)
    rec_args={}

    # dictionary of default recommenders to choose from at the command line.
    name_to_rec = {'random': RandomRecommender,
            'average': AverageRecommender,
            'exhaustive': ExhaustiveRecommender,
            'meta': MetaRecommender,
            'knn': KNNMetaRecommender,
            'svd': SVDRecommender
            }
    
    # if args.REC in ['random','exhaustive','meta']:
    #     ml_p = api_utils.get_all_ml_p_from_db(args.API_PATH+'/api/preferences',os.environ['APIKEY'])
    #     rec_args = {'ml_p':ml_p}
        # rec_args = {'db_path':args.API_PATH,'api_key':os.environ['APIKEY']}
    rec_args['metric'] = 'accuracy'

    print('=======','Penn AI','=======')#,sep='\n')

    pennai = AI(rec=name_to_rec[args.REC](**rec_args),api_path=args.API_PATH, user=args.USER,
                verbose=args.VERBOSE, n_recs=args.N_RECS, warm_start=args.WARM_START,
                datasets=args.DATASETS, use_knowledgebase=args.USE_KNOWLEDGEBASE)

    n = 0;
    try:
        while True:
            # check for new experiment results
            if pennai.check_results():
                pennai.update_recommender()
            # check for new recommendation requests
            if pennai.check_requests():
               pennai.process_rec()
            n = n + 1
            time.sleep(args.SLEEP_TIME)
    except (KeyboardInterrupt, SystemExit):
        print('Saving current AI state and closing....')
    except:
        #print("Unhanded exception caught:", sys.exc_info()[0])
        print("Unhanded exception caught:")
        raise
    finally:
        # tell queues to exit
        print("foo")
        logger.info("Exiting queue")
        q_utils.exitFlag=1
        pennai.save_state()

if __name__ == '__main__':
    main()
