from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from time import sleep
import time
import datetime
import pickle
import pdb
import ai.api_utils as api_utils
from ai.api_utils import LabApi, AI_STATUS
import ai.q_utils as q_utils
import os
import ai.knowledgebase_loader as knowledgebase_loader
import logging
import sys
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
# from ai.recommender.svd_recommender import SVDRecommender
from ai.recommender.surprise_recommenders import (CoClusteringRecommender, 
        KNNWithMeansRecommender, KNNDatasetRecommender, KNNMLRecommender,
        SlopeOneRecommender, SVDRecommender)
from collections import OrderedDict
from ai.request_manager import RequestManager

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


class AI():
    """AI managing agent for Penn AI.

    Responsible for:
    - checking for user requests for recommendations,
    - checking for new results from experiments,
    - calling the recommender system to generate experiment recommendations,
    - posting the recommendations to the API.
    - handling communication with the API.

    :param rec_class: ai.BaseRecommender - recommender to use
    :param api_path: string - path to the lab api server
    :param extra_payload: dict - any additional payload that needs to be specified
    :param user: string - test user
    :param rec_score_file: file - pickled score file to keep persistent scores
    between sessions
    :param verbose: Boolean
    :param warm_start: Boolean - if true, attempt to load the ai state from the file
    provided by rec_score_file
    :param n_recs: int - number of recommendations to make for each request
    :param datasets: str or False - if not false, a comma seperated list of datasets
    to turn the ai on for at startup
    :param use_pmlb_knowledgebase: Boolean
    
    """

    def __init__(self,
                rec_class=None,
                api_path=None,
                extra_payload=dict(),
                user='testuser',
                rec_score_file='rec_state.obj',
                verbose=True,
                warm_start=False,
                n_recs=1,
                datasets=False,
                use_knowledgebase=False,
                term_condition='n_recs',
                max_time=5):
        """Initializes AI managing agent."""

        # default supervised learning recommender settings
        self.DEFAULT_REC_CLASS = RandomRecommender
        self.DEFAULT_REC_ARGS = {'metric':'accuracy'}

        # recommendation engines for different problem types
        # will be expanded as more types of probles are supported
        # (classification, regression, unsupervised, etc.)
        self.rec_engines = {
            "classification":None
        }

        # Request manager settings
        self.n_recs=n_recs if n_recs>0 else 1
        self.continuous= n_recs<1

        # api parameters, will be removed from self once the recommenders no longer
        # call the api directly.
        # See #98 <https://github.com/EpistasisLab/pennai/issues/98>
        if api_path == None:
            api_path = ('http://' + os.environ['LAB_HOST'] + ':' +
                        os.environ['LAB_PORT'])
        self.user=user
        self.api_path=api_path
        self.api_key=os.environ['APIKEY']

        self.verbose = verbose #False: no printouts, True: printouts on updates

        # file name of stored scores for the recommender
        self.rec_score_file = rec_score_file

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

        self.initilize_recommenders(rec_class) # set self.rec_engines

        # build dictionary of ml ids to names conversion
        self.ml_id_to_name = self.labApi.get_ml_id_dict()
        # print('ml_id_to_name:',self.ml_id_to_name)

        # dictionary of dataset threads, initilized and used by q_utils.
        # Keys are datasetIds, values are q_utils.DatasetThread instances.
        #WGL: this should get moved to the request manager
        self.dataset_threads = {}

        # local dataframe of datasets and their metafeatures
        self.dataset_mf_cache = pd.DataFrame()

        # store dataset_id to hash dictionary
        self.dataset_mf_cache_id_hash_lookup = {}

        if use_knowledgebase:
            self.load_knowledgebase()


        # set termination condition
        self.term_condition = term_condition
        if self.term_condition == 'n_recs':
            self.term_value = self.n_recs
        elif self.term_condition == 'time':
            self.term_value = max_time
        else:
            self.term_value = None

        # start the request manager
        self.requestManager = RequestManager(
            ai=self,
            defaultTermConditionStr=self.term_condition,
            defaultTermParam=self.term_value)

        # if there is a pickle file, load it as the recommender scores
        assert not (warm_start), "The `warm_start` option is not yet supported"

        # for comma-separated list of datasets in datasets, turn AI request on
        assert not (datasets), "The `datasets` option is not yet supported: " + str(datasets)


    ##-----------------
    ## Init methods
    ##-----------------  
    def initilize_recommenders(self, rec_class):
        """
        Initilize classification recommender
        """

        # Create supervised learning recommenders
        if (rec_class):
            self.rec_engines["classification"] = rec_class(**self.DEFAULT_REC_ARGS)
        else:
            self.rec_engines["classification"]  = self.DEFAULT_REC_CLASS(**self.DEFAULT_REC_ARGS)

        # set the registered ml parameters in the recommenders
        ml_p = self.labApi.get_all_ml_p()
        assert ml_p is not None
        assert len(ml_p) > 0
        self.rec_engines["classification"].ml_p = ml_p
        # if hasattr(self.rec_engines["classification"],'mlp_combos'):
        #     self.rec_engines["classification"].mlp_combos = self.rec_engines["classification"].ml_p['algorithm']+'|'+self.rec_engines["classification"].ml_p['parameters']
        # ml_p.to_csv('ml_p_options.csv')


        logger.debug("recomendation engines initilized: ")
        for prob_type, rec in self.rec_engines.items():
            logger.debug(f'\tproblemType: {prob_type} - {rec}')
            logger.debug('\trec.ml_p:\n'+str(rec.ml_p.head()))
        


    def load_knowledgebase(self):
        """Bootstrap the recommenders with the knowledgebase."""
        logger.info('loading pmlb knowledgebase')
        kb = knowledgebase_loader.load_default_knowledgebases()

        # replace algorithm names with their ids
        self.ml_name_to_id = {v:k for k,v in self.ml_id_to_name.items()}
        kb['resultsData']['algorithm'] = kb['resultsData']['algorithm'].apply(
                                          lambda x: self.ml_name_to_id[x])

        all_df_mf = kb['metafeaturesData'].set_index('_id')

        # all_df_mf = pd.DataFrame.from_records(metafeatures).transpose()
        # use _id to index the metafeatures, and
        # keep only metafeatures with results
        self.dataset_mf_cache = all_df_mf.loc[kb['resultsData']['_id'].unique()]

        # self.update_dataset_mf(kb['resultsData'])
        self.rec_engines["classification"].update(kb['resultsData'], self.dataset_mf_cache, source='knowledgebase')

        logger.info('pmlb knowledgebase loaded')

    def load_options(self):
        """Loads algorithm UI parameters and sets them to self.ui_options."""

        logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
              ': loading options...')

        responses = self.labApi.get_projects()

        if len(responses) > 0:
            self.ui_options = responses
        else:
            logger.warning("no algorithms found by load_options()")


    ##-----------------
    ## Utility methods
    ##-----------------
    def get_results_metafeatures(self, results_data):
        """
        Return a pandas dataframe of metafeatures associated with the datasets
        in results_data.

        Retireves metafeatures from self.dataset_mf_cache if they exist,
        otherwise queries the api and updates the cache.
        
        :param results_data: experiment results with associated datasets
        
        """
        logger.debug('results_data:'+str(results_data.columns))
        logger.debug('results_data:'+str(results_data.head()))

        dataset_metafeatures = []
        
        dataset_indicies = results_data['dataset_id'].unique()

        # add dataset metafeatures to the cache
        for d in dataset_indicies:
            if len(self.dataset_mf_cache)==0 or d not in self.dataset_mf_cache_id_hash_lookup.keys():
                df = self.labApi.get_metafeatures(d)        
                df['dataset'] = d
                dataset_metafeatures.append(df)
                self.dataset_mf_cache_id_hash_lookup.update({d:df['_id']})
        if dataset_metafeatures:
            df_mf = pd.concat(dataset_metafeatures).set_index('dataset')
            self.dataset_mf_cache = self.dataset_mf_cache.append(df_mf)


        logger.info(f'mf count:\n {len(self.dataset_mf_cache.index.values)}')
        #logger.info(f'mf:\n {list(self.dataset_mf_cache.index.values)}')
        logger.info(f'indicies: \n\n {dataset_indicies}')

        new_mf = self.dataset_mf_cache.loc[dataset_indicies, :]
        assert len(new_mf) == len(dataset_indicies)
        logger.info(f"new_mf: {new_mf}")

        return new_mf

    ##-----------------
    ## Loop methods
    ##-----------------
    def check_results(self):
        """Checks to see if new experiment results have been posted since the 
        previous time step. If so, set them to self.new_data and return True.

        :returns: Boolean - True if new results were found
        """
        logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                  ': checking results...')

        newResults = self.labApi.get_new_experiments_as_dataframe(
                                        last_update=self.last_update)

        if len(newResults) > 0:
            logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                  ': ' + str(len(newResults)) + ' new results!')           
            self.last_update = int(time.time())*1000 # update timestamp
            self.new_data = newResults
            return True

        return False

    def update_recommender(self):
        """Update recommender models based on new experiment results in 
        self.new_data, and then clear self.new_data. 
        """
        if(hasattr(self,'new_data') and len(self.new_data) >= 1):
            new_mf = self.get_results_metafeatures(self.new_data)

            self.new_data['_id'] = self.new_data['dataset_id'].apply(
                    lambda x: self.dataset_mf_cache_id_hash_lookup[x])

            self.rec_engines["classification"].update(self.new_data, new_mf)

            logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                    ': recommender updated')
            # reset new data
            self.new_data = pd.DataFrame()

    def check_requests(self):
        """Check to see if any new AI requests have been submitted.
        If so, add them to self.request_queue.

        :returns: Boolean - True if new AI requests have been submitted
        """

        logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
              ': checking requests...')


        # get all dtasets that have an ai 'requested' status
        # and initilize a new request        
        dsFilter = {'ai':[AI_STATUS.REQUESTED.value, 'dummy']}
        aiOnRequests = self.labApi.get_filtered_datasets(dsFilter)

        if len(aiOnRequests) > 0:
            logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                      ': new ai request for:'+
                      ';'.join([r['name'] for r in aiOnRequests]))

            # set AI flag to 'on' to acknowledge requests received
            for r in aiOnRequests:
                self.labApi.set_ai_status(datasetId = r['_id'], 
                                            aiStatus = 'on')

                self.requestManager.add_request(
                        datasetId=r['_id'], 
                        datasetName=r['name']) 
        time.sleep(.1)
        # get all datasets that have a manual 'off' status
        # and terminate their ai requests
        dsFilter = {'ai':[AI_STATUS.OFF.value, 'dummy']}
        aiOffRequests = self.labApi.get_filtered_datasets(dsFilter)

        if len(aiOffRequests) > 0:
            logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                      ': ai termination request for:'+
                      ';'.join([r['name'] for r in aiOffRequests]))
            
            for r in aiOffRequests:
                self.requestManager.terminate_request(datasetId=r['_id'])

        return True

    def process_rec(self):
        self.requestManager.process_requests()

    ##-----------------
    ## Syncronous actions an AI request can take
    ##-----------------
    def generate_recommendations(self, datasetId, numOfRecs, predictionType = "classification"):
        """Generate ml recommendation payloads for the given dataset.

        :param datasetId
        :param numOfRecs

        :returns list of maps that represent request payload objects
        """
        logger.info("generate_recommendations({},{})".format(datasetId, numOfRecs))

        recommendations = []

        metafeatures = self.labApi.get_metafeatures(datasetId)


        ml, p, ai_scores = self.rec_engines[predictionType].recommend(
            dataset_id=metafeatures['_id'].values[0],
            n_recs=numOfRecs,
            dataset_mf=metafeatures)

        for alg,params,score in zip(ml,p,ai_scores):
            # TODO: just return dictionaries of parameters from rec
            # modified_params = eval(params) # turn params into a dictionary
            
            recommendations.append({'dataset_id':datasetId,
                    'algorithm_id':alg,
                    'username':self.user,
                    'parameters':params,
                    'ai_score':score,
                    })

        return recommendations


    def transfer_rec(self, rec_payload):
        """Attempt to send a recommendation to the lab server.
        If any error other then a no capacity error occurs, throw an exception.

        :param rec_payload: dictionary - the payload describing the experiment

        :return bool - true if successfully sent, false if no machine capacity available
        """
        logger.info(f"transfer_rec({rec_payload})")

        aiStatus = self.labApi.get_dataset_ai_status(rec_payload['dataset_id'])
        if not(aiStatus == AI_STATUS.ON.value):
            logger.debug("AI status is not on; not submitting experiment")
            return False

        submitstatus = self.labApi.launch_experiment(
                            algorithmId=rec_payload['algorithm_id'],
                            payload=rec_payload)

        logger.debug(f"transfer_rec() submitstatus: {submitstatus}")

        if 'error' in submitstatus:
            if ('No machine capacity available' in submitstatus['error']):
                logger.debug(f"Waiting for capacity: {submitstatus['error']}")
                return False
            else:
                msg = 'Unrecoverable error during transfer_rec : ' + str(submitstatus)
                logger.error(msg)
                raise RuntimeError(msg)

        return True


    ##-----------------
    ## Save/load ai state
    ##-----------------
    def save_state(self):
        """Save ML+P scores in pickle or to DB

        TODO: test that this still works
        """
        raise RuntimeError("save_state is not currently supported")
        out = open(self.rec_score_file,'wb')
        state={}
        if(hasattr(self.rec_engines["classification"], 'scores')):
            #TODO: make this a more generic. Maybe just save the
            # AI or rec object itself.
            # state['trained_dataset_models'] = self.rec_engines["classification"].trained_dataset_models
            state['scores'] = self.rec_engines["classification"].scores
            state['last_update'] = self.last_update
        pickle.dump(state, out)

    def load_state(self):
        """Loads pickled score file and recommender model.

        TODO: test that this still works
        """
        raise RuntimeError("load_state is not currently supported")
        if os.stat(self.rec_score_file).st_size != 0:
            filehandler = open(self.rec_score_file,'rb')
            state = pickle.load(filehandler)
            if(hasattr(self.rec_engines["classification"], 'scores')):
              self.rec_engines["classification"].scores = state['scores']
              # self.rec_engines["classification"].trained_dataset_models = state['trained_dataset_models']
              self.last_update = state['last_update']
              logger.info('loaded previous state from '+self.last_update)



####################################################################### Manager
import argparse

def main():
    """Handles command line arguments and runs Penn-AI."""
    parser = argparse.ArgumentParser(
            description='PennAI is a recommendation system for data science. ',
            add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-rec',action='store',dest='REC',default='random',
            choices = ['random','average','knnmeta','svd','cocluster','knnmeans',
                       'knnml','knndata','slopeone'],
            help='Recommender algorithm options.')
    parser.add_argument('-api_path',action='store',dest='API_PATH',
            default='http://' + os.environ['LAB_HOST'] +':'+ os.environ['LAB_PORT'],
                        help='Path to the database.')
    parser.add_argument('-u',action='store',dest='USER',default='testuser',
            help='user name')
    parser.add_argument('-t',action='store',dest='DATASETS',
            help='turn on ai for these datasets')
    parser.add_argument('-n_recs',action='store',dest='N_RECS',type=int,default=1,
            help=('Number of recommendations to make at a time. '
                'If zero, will send continuous recommendations.'))
    parser.add_argument('-max_time',action='store',dest='MAX_TIME',type=int,
            default=60, help=('Amount of time to allow recs in seconds. '
                'Only works when term_condition set to "time".'))
    parser.add_argument('-term_condition',action='store',dest='TERM_COND',
            type=str, default='n_recs', choices=['n_recs','time','continuous'],
            help=('Termination condition for the AI.'))
    parser.add_argument('-v','-verbose',action='store_true',dest='VERBOSE',
            default=True, help='Print out more messages.')
    parser.add_argument('-warm',action='store_true',dest='WARM_START',default=False,
            help='Start from last saved session.')
    parser.add_argument('-sleep',action='store',dest='SLEEP_TIME',default=4,
            type=float, help='Time between pinging the server for updates')
    parser.add_argument('--knowledgebase','-k', action='store_true',
            dest='USE_KNOWLEDGEBASE', default=True, 
            help='Load a knowledgebase for the recommender')

    args = parser.parse_args()

    # set logging level
    if args.VERBOSE:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    logger.debug(str(args))

    # dictionary of default recommenders to choose from at the command line.
    name_to_rec = {'random': RandomRecommender,
            'average': AverageRecommender,
            'knnmeta': KNNMetaRecommender,
            'svd': SVDRecommender,
            'cocluster': CoClusteringRecommender,
            'knnmeans': KNNWithMeansRecommender,
            'knndata': KNNDatasetRecommender,
            'knnml': KNNMLRecommender,
            'slopeone': SlopeOneRecommender
            }

    print('=======','Penn AI','=======')#,sep='\n')

    pennai = AI(rec_class=name_to_rec[args.REC],
            api_path=args.API_PATH, user=args.USER,
            verbose=args.VERBOSE, n_recs=args.N_RECS, warm_start=args.WARM_START,
            datasets=args.DATASETS, use_knowledgebase=args.USE_KNOWLEDGEBASE,
            term_condition=args.TERM_COND, max_time=args.MAX_TIME)

    n = 0;
    try:
        while True:
            # check for new experiment results
            if pennai.check_results():
                pennai.update_recommender()

            # check for user updates to request states
            pennai.check_requests()

            # process any active requests 
            pennai.process_rec()

            n = n + 1
            time.sleep(args.SLEEP_TIME)

    except (KeyboardInterrupt, SystemExit):
        logger.info('Exit command recieved')
    except:
        logger.error("Unhanded exception caught: "+ str(sys.exc_info()[0]))
        raise
    finally:
        # shut down gracefully
        logger.info("Shutting down AI engine...")
        logger.info("...Shutting down Request Manager...")
        pennai.requestManager.shutdown()
        logger.info("Goodbye")

if __name__ == '__main__':
    main()
