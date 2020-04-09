from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from time import sleep
import time
import datetime
import pickle
import pdb
import ai.api_utils as api_utils
import ai.q_utils as q_utils
import os
from knowledgebase_loader as load_default_knowledgebases
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

logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


class PennAI(BaseEstimator):
    """Penn AI standalone sklearn wrapper.

    Responsible for:
    - checking for user requests for recommendations,
    - checking for new results from experiments,
    - calling the recommender system to generate experiment recommendations,
    - posting the recommendations to the API.
    - handling communication with the API.

    :param rec_class: ai.BaseRecommender - recommender to use
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
                rec_score_file='rec_state.obj',
                verbose=True,
                warm_start=False,
                n_recs=1,
                knowledgebase=None,
                kb_metafeatures=None,
                term_condition='n_recs',
                max_time=5):
        """Initializes AI managing agent."""

        self.rec_class = rec_class
        self.rec_score_file = rec_score_file
        self.verbose = verbose
        self.warm_start = warm_start
        self.n_recs = n_recs
        self.knowledgebase = knowledgebase
        self.kb_metafeatures = kb_metafeatures
        self.term_condition = term_condition
        self.max_time = max_time

    def fit_init_(self)

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
        self.n_recs_=self.n_recs if self.n_recs>0 else 1
        self.continuous= n_recs<1
        # timestamp of the last time new experiments were processed
        self.last_update = 0


        self.load_options() #loads algorithm parameters to self.ui_options # todo !!

        self.initilize_recommenders(self.rec_class) # set self.rec_engines

        # build dictionary of ml ids to names conversion
        # print('ml_id_to_name:',self.ml_id_to_name)

        # dictionary of dataset threads, initilized and used by q_utils.
        # Keys are datasetIds, values are q_utils.DatasetThread instances.
        #WGL: this should get moved to the request manager
        self.dataset_threads = {}

        # local dataframe of datasets and their metafeatures
        self.dataset_mf_cache = pd.DataFrame()

        if self.knowledgebase:
            self.load_kb()

        # terminate value
        if self.term_condition == 'n_recs':
            self.term_value = self.n_recs_
        elif self.term_condition == 'time':
            self.term_value = max_time
        else:
            self.term_value = None


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

        # this line also need refactor # todo !!!
        # set the registered ml parameters in the recommenders

        # ml_p = self.labApi.get_all_ml_p()
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



    def load_kb(self):
        """Bootstrap the recommenders with the knowledgebase."""
        logger.info('loading pmlb knowledgebase')

        kb = load_knowledgebase(
                            resultsFiles=[self.knowledgebase],
                            metafeaturesFiles=[self.kb_metafeatures]
                            )

        # replace algorithm names with their ids
        self.ml_name_to_id = {v:k for k,v in self.ml_id_to_name.items()}
        kb['resultsData']['algorithm'] = kb['resultsData']['algorithm'].apply(
                                          lambda x: self.ml_name_to_id[x])

        #TODO: Verify that conversion from name to id is needed....
        # WGL: yes at the moment we need this until hash is implemented.
        # we can add a check at dataset upload to prevent repeat dataset names in
        # the mean time.
        # pdb.set_trace()
        # self.user_datasets = self.labApi.get_user_datasets(self.user)
        # self.dataset_name_to_id = {v:k for k,v in self.user_datasets.items()}
        # kb['resultsData']['dataset'] = kb['resultsData']['dataset'].apply(
        #                                   lambda x: self.dataset_name_to_id[x]
        #                                   if x in self.dataset_name_to_id.keys()
        #                                   else x)
        # metafeatures = {}
        # for k,v in kb['metafeaturesData'].items():
        #     if k in self.dataset_name_to_id.keys():
        #         metafeatures[self.dataset_name_to_id[k]] = v
        #     else:
        #         metafeatures[k] = v
        all_df_mf = pd.DataFrame.from_records(kb['metafeaturesData']).transpose()
        # all_df_mf = pd.DataFrame.from_records(metafeatures).transpose()
        # keep only metafeatures with results
        self.dataset_mf_cache = all_df_mf.reindex(kb['resultsData'].dataset.unique())
        # self.update_dataset_mf(kb['resultsData'])
        self.rec_engines["classification"].update(kb['resultsData'], self.dataset_mf_cache, source='knowledgebase')

        logger.info('Knowledgebase loaded')

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
        dataset_indicies = results_data['dataset'].unique()

        # add dataset metafeatures to the cache
        for d in dataset_indicies:
            if len(self.dataset_mf_cache)==0 or d not in self.dataset_mf_cache.index:
                df = self.labApi.get_metafeatures(d)
                df['dataset'] = d
                dataset_metafeatures.append(df)
        if dataset_metafeatures:
            df_mf = pd.concat(dataset_metafeatures).set_index('dataset')
            self.dataset_mf_cache = self.dataset_mf_cache.append(df_mf)


        logger.info(f'mf:\n {list(self.dataset_mf_cache.index.values)}')
        logger.info(f'indicies: \n\n {dataset_indicies}')

        new_mf = self.dataset_mf_cache.loc[dataset_indicies, :]
        assert len(new_mf) == len(dataset_indicies)
        logger.info(f"new_mf: {new_mf}")

        return new_mf

    ##-----------------
    ## Loop
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

        time.sleep(.1)
        # get all datasets that have a manual 'off' status
        # and terminate their ai requests
        dsFilter = {'ai':[AI_STATUS.OFF.value, 'dummy']}
        aiOffRequests = self.labApi.get_filtered_datasets(dsFilter)

        if len(aiOffRequests) > 0:
            logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                      ': ai termination request for:'+
                      ';'.join([r['name'] for r in aiOffRequests]))


        return True


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

        #  metafeature need to generate from independent codes # todo

        #metafeatures = self.labApi.get_metafeatures(datasetId)

        # key code for generate recomendation need call this line or this function into fit
        ml, p, ai_scores = self.rec_engines[predictionType].recommend(
            dataset_id=datasetId,
            n_recs=numOfRecs,
            dataset_mf=metafeatures)

        for alg,params,score in zip(ml,p,ai_scores):
            # TODO: just return dictionaries of parameters from rec
            # modified_params = eval(params) # turn params into a dictionary

            recommendations.append({'dataset_id':datasetId,
                    'algorithm_id':alg,
                    'username':'testuser', # todo!!
                    'parameters':params,
                    'ai_score':score,
                    })

        return recommendations


    def fit(X,y):
        """Trains PennAI on X,y.

        initialize: train recommender or load saved recommender state
        until stop criterion is met:
            get recommendations for X,y
            fit and cross validate recommended ML configs
            update recommender based on CV scores
        finalize: store best model, or make ensemble of trained models that meet some performance threshold

        """


    def predict(X):
        """Predict using trained model."""

####################################################################### Manager
class PennAIClassifier(PennAI,BaseClassifier):
    """Sklearn-style classifier for PennAI."""
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
        logger.info("Goodbye")

if __name__ == '__main__':
    main()
