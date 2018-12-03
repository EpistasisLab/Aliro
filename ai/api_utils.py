"""
API utility functions for Penn-AI
"""

import pandas as pd
import numpy as np
import pdb
import json
import requests
# import urllib.request, urllib.parse
import itertools as it
import logging
import sys

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

class NumpyJsonEncoder(json.JSONEncoder):
    """ Encoder for numpy in json
    """
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(NumpyJsonEncoder, self).default(obj)

class LabApi:
    """Class for communicating with the PennAI server
    """

    def __init__(self, api_path, user, api_key, extra_payload, verbose):
        """
        :param api_path: string - path to the lab api server
        :param extra_payload: dict - any additional payload that needs to be specified
        :param api_key: string - 
        :param user: string - test user
        :param verbose: Boolean
        """
        self.api_path = api_path
        self.exp_path = '/'.join([self.api_path,'api/experiments'])

        self.projects_path = '/'.join([self.api_path,'api/v1/projects'])
        self.algo_path = '/'.join([self.api_path,'api/projects'])

        self.data_path = '/'.join([self.api_path,'api/datasets'])
        self.status_path = '/'.join([self.api_path,'api/v1/datasets'])
        self.submit_path = '/'.join([self.api_path,'api/userdatasets'])
        
        self.api_key=api_key
        self.user=user
        self.verbose=False
        self.header = {'content-type': 'application/json'}
        # optional extra payloads (e.g. user id) for posting to the api
        self.extra_payload = extra_payload
        # static payload is the payload that is constant for every API post
        # with api key for this host
        self.static_payload = {'apikey':self.api_key}
        # add any extra payload
        self.static_payload.update(extra_payload)

        logger.debug("==LabApi paths:")
        logger.debug("self.api_path: " + self.api_path)

        logger.debug("self.exp_path: " + self.exp_path)

        logger.debug("self.projects_path: " + self.projects_path)
        logger.debug("self.algo_path: " + self.algo_path)
        
        logger.debug("self.data_path: " + self.data_path)
        logger.debug("self.status_path: " + self.status_path)
        logger.debug("self.submit_path: " + self.submit_path)
        


    def launch_experiment(self, algorithmId, payload):
        """Attempt to start a ml experiment.

        :param algorithmId: string - 
        :param payload: dict - dictionary describing the ml experiment parameters

        :returns: dict {value(str): status(str)} 
        """
        logger.info("launch_experiment(" + str(algorithmId) + ", " + str(payload))
        assert algorithmId

        payload.update(self.static_payload)
        experimentData = json.dumps(payload,cls=NumpyJsonEncoder)

        rec_path = '/'.join([self.projects_path, algorithmId, 'experiment'])
        
        try:
            res=requests.request("POST", rec_path, data=experimentData, headers=self.header)
        except:
            logger.error("Unexpected error in launch_experiment for path '", rec_path, "':", sys.exc_info()[0])
            raise

        submitResponses = json.loads(res.text)

        #parse json response into named array
        submitStatus={}
        if len(submitResponses) > 0:
            for submitI in submitResponses:
                submitStatus[submitI] = submitResponses[submitI]

        return submitStatus

    def get_projects(self):
        """Get the descriptions and parameters of the supported ml algorithms

        :return: dict - algorithm descriptions as returned by api/projects
        """
        logger.info("get_projects()")

        res = self.__request(path=self.projects_path)
        data = json.loads(res.text)
        return data


    def get_filtered_datasets(self, payload):
        """Get datasets with filters

        :param payload: dict - How to filter the results {'ai':['requested','finished']}

        :return: dict - datasets that pass the payload filter
        """
        logger.info("get_filtered_datasets()")

        res = self.__request(path=self.data_path, payload=payload)
        data = json.loads(res.text)
        return data

    def get_new_experiments(self, last_update):
        """Get experiments that occurred after last_update

        :param last_update: int - 

        :returns: dict - ml experiments results
        """
        logger.info("get_new_experiments(" + str(last_update)+ ")")

        payload = {'date_start':last_update,'has_scores':True}

        res = self.__request(path=self.exp_path, payload=payload)
        data = json.loads(res.text)
        return data

    def set_ai_status(self, datasetId, aiStatus):
        """set the ai status for the given dataset.
        
        :param datasetId: string - dataset to update
        :param aiStatus: string 
        """
        logger.info("set_ai_status(" + str(datasetId) +", " + str(aiStatus) + ")")

        payload = {'ai':aiStatus}
        data_submit_path = '/'.join([self.submit_path, datasetId,'ai'])
        res = self.__request(path=data_submit_path, payload=payload, method="PUT")
        return res

    # @Deprecated, used in ai.py; redundant
    def get_ml_id_dict(self):
        """Returns a dictionary for converting algorithm IDs to names.

        :return: dict {mlId(str):mlName(str)}
        """
        logger.info("get_ml_id_dict()")

        res = self.__request(path=self.algo_path)
        responses = json.loads(res.text)

        ml_id_to_name = {}
        for ml in responses:
            ml_id_to_name.update({ml['_id']:ml['name']})

        return ml_id_to_name


    # @Deprecated, used in ai.py; redundant
    def get_user_datasets(self, user):
        """Returns a dictionary for converting dataset IDs to names.  
        
        :return: dict {datasetId(str):datasetName(str)}
        """
        logger.info("get_user_datasets(" + str(user) + ")")

        payload = {'username':user}
        res = self.__request(path=self.submit_path, payload=payload)

        responses = json.loads(res.text)
        dataset_id_to_name = {}
        for dataset in responses:
            dataset_id_to_name.update({dataset['_id']:dataset['name']})
        return dataset_id_to_name


    def __request(self, path, payload = None, method = 'POST', headers = {'content-type': 'application/json'}):
        """
        Attempt to make an api request and return the result.
        Throw an exception if the request fails or if a status code >400 is returned.

        :return: Requests.response object
        """

        logger.debug("Starting LabApi.__request(" + str(path) + ", " + str(payload) + ", " + str(method) + ", ...)" )
        
        if payload: 
            assert isinstance(payload, dict)
            payload.update(self.static_payload)
        else:
            payload = self.static_payload

        res = None
        try:
            res = requests.request(method, path, data=json.dumps(payload), headers=headers)
        except:
            logger.error("Unexpected error in LabApi.__request for path '" + str(method) + ":" + str(path) + "':" + str(sys.exc_info()[0]))
            raise
        
        if res.status_code != requests.codes.ok:
            msg = "Request " + str(method) + " status_code not ok, path: '" + str(path) + "'' status code: '" + str(res.status_code) + "'' response text: " + str(res.text)
            logger.error(msg)
            raise RuntimeError(msg)


        #logger.debug("Got response LabApi.__request(" + str(path) + ", ..., " + str(method) + ", ...)" )
        """
        try:
            logger.debug("response: ", str(res.text), "\n")
        except:
            logger.debug("couldn't text parse response")
        """
        return res

    def get_metafeatures(self, d):
            """Fetches dataset metafeatures, returning dataframe.

            :param d: dataset ID/path relative to self.data_path
            :return df: a dataframe of metafeatures, sorted by mf name
            """
            # # print('fetching data for', d)
            # payload={}
            # # payload = {'metafeatures'}
            # payload.update(self.static_payload)
            # params = json.dumps(payload).encode('utf8')
            # # print('full path:', self.mf_path+'/'+d)
            try:
                res = self.__request(path=self.data_path+'/'+d, method='GET')
                data = json.loads(res.text)

#                 req = urllib.request.Request(self.data_path+'/'+d, data=params)
#                 r = urllib.request.urlopen(req)
                
#                 data = json.loads(r.read().decode(r.info().get_param('charset')
#                                           or 'utf-8'))[0]
            except Exception as e:
                print('exception when grabbing metafeature data for',d)
                raise e

            data = data[0] 
            mf = [data['metafeatures']]
            # print('mf:',mf)
            df = pd.DataFrame.from_records(mf,columns=mf[0].keys())
            # print('df:',df)
            # df['dataset'] = data['_id']
            df['dataset'] = data['name']
            df.sort_index(axis=1, inplace=True)

            return df

    def get_all_ml_p(self):
        """ Returns a list of ml and parameter options from the server.
        
        :param path: 'api/preferences'
        :param key:

        :returns: dataframe - unique ml parameter options
        """

        # get json from server
        r = self.__request(path=self.api_path+'/api/preferences',method='GET')
        response = json.loads(r.text)
        # print('response type:',type(response))
        # print('len response :',len(response))
        # response = json.loads(r.read().decode(r.info().get_param('charset') or 'utf-8'))
        algorithms = response[0]['algorithms']

        # print('no. of algorithms:',len(algorithms))
        result = [] # returned value
        good_def = True # checks that json for ML is in good form

        for i,x in enumerate(algorithms):
        #for i,x in enumerate(response):
            print('ML: ',x['name'])
            hyperparams = x['schema'].keys()
            hyperparam_dict = {}

            # get a dictionary of hyperparameters and their values
            for h in hyperparams:
                #print('x[''schema''][h]',x['schema'][h])
                if 'ui' in x['schema'][h]:
                    if 'values' in x['schema'][h]['ui']:
                        hyperparam_dict.update({h: x['schema'][h]['ui']['values']})
                    else:
                        hyperparam_dict.update({h: x['schema'][h]['ui']['choices']})
                else:
                    good_def = False
            if good_def:
                sorted_hp = sorted(hyperparam_dict)
                # enumerate all possible hyperparameter combinations
                all_hyperparam_combos = [dict(zip(sorted_hp,prod))
                                          for prod in it.product(*(hyperparam_dict[k]
                                          for k in sorted_hp))]

                #print('\thyperparams: ',hyperparam_dict)
                #print(len(all_hyperparam_combos),' total hyperparameter combinations')

                for ahc in all_hyperparam_combos:
                    result.append({'algorithm':x['_id'],
                                   'parameters':str(ahc),
                                   'alg_name':x['name']})
            else:
                print('warning: ', x['name'], 'was skipped')
            good_def = True

        # convert to dataframe, making sure there are no duplicates
        all_ml_p = pd.DataFrame(result).drop_duplicates()

        print(len(all_ml_p),' ml-parameter options loaded')
        print('algs:',all_ml_p.algorithm.unique())
        return all_ml_p

def get_random_ml_p_from_db(path,key):
    """ Returns a random ml+parameter option from the server."""

    # get json from server
    payload = {'apikey':key}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
    print('r:',r)
    responses = json.loads(r.text)

    result = [] # returned value

    ml = np.random.choice(responses) # random chosen ML model
    print('chosen ML:',ml)

    hyperparams = ml['schema'].keys()
    hyperparam_dict = {}

    # get a dictionary of hyperparameters and their values
    for h in hyperparams:
        hyperparam_dict.append({h: ml['schema'][h]['ui']['choices']})

    sorted_hp = sorted(hyperparam_dict)
    # enumerate all possible hyperparameter combinations
    all_hyperparam_combos = [dict(zip(sorted_hp,prod))
                              for prod in it.product(*(hyperparam_dict[k]
                              for k in sorted_hp))]

    # get random choice from all_hyperparam_combos:
    p = np.random.choice(all_hyperparam_combos)

    return ml,p
