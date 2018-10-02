"""
Databse utility functions for Penn-AI
"""

import pandas as pd
import numpy as np
import pdb
import json
import requests
import itertools as it

class NumpyJsonEncoder(json.JSONEncoder):
    """ Encoder for numpy in json
    h-note: confirm that this is necessary
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
        self.data_path = '/'.join([self.api_path,'api/datasets'])
        self.projects_path = '/'.join([self.api_path,'api/v1/projects'])
        self.status_path = '/'.join([self.api_path,'api/v1/datasets'])
        self.submit_path = '/'.join([self.api_path,'api/userdatasets'])
        self.algo_path = '/'.join([self.api_path,'api/projects'])
        self.api_key=api_key
        self.user=user
        self.verbose=verbose
        self.header = {'content-type': 'application/json'}
        # optional extra payloads (e.g. user id) for posting to the db
        self.extra_payload = extra_payload
        # static payload is the payload that is constant for every API post
        # with api key for this host
        self.static_payload = {'apikey':self.api_key}
        # add any extra payload
        self.static_payload.update(extra_payload)

        if verbose:
            print("LabApi paths:")
            print("self.api_path: ", self.api_path)
            print("self.exp_path: ", self.exp_path)
            print("self.data_path: ", self.data_path)
            print("self.projects_path: ", self.projects_path)
            print("self.status_path: ", self.status_path)
            print("self.submit_path: ", self.submit_path)
            print("self.algo_path: ", self.algo_path)



    def launch_experiment(self, algorithmId, payload):
        """Attempt to start a ml experiment.

        :param algorithmId: string - 
        :param payload: dict - dictionary describing the ml experiment parameters

        :returns: dict  
        """
        payload.update(self.static_payload)
        experimentData = json.dumps(payload,cls=NumpyJsonEncoder)

        self.projects_path = '/'.join([self.api_path,'api/v1/projects'])
        rec_path = '/'.join([self.projects_path, algorithmId, 'experiment'])
        
        try:
            res=requests.post(rec_path,data=experimentData,headers=self.header)
        except:
            print("Unexpected error in launch_experiment for path '", rec_path, "':", sys.exc_info()[0])
            raise

        submitresponses = json.loads(res.text)

        #parse json response into named array
        submitstatus={}
        if len(submitresponses) > 0:
            for submiti in submitresponses:
                submitstatus[submiti] = submitresponses[submiti]

        return submitstatus

    def get_projects(self):
        """Get the descriptions and parameters of the supported ml algorithms

        :return: dict - algorithm descriptions as returned by api/projects
        """
        v = requests.post(self.projects_path,data=json.dumps(self.static_payload),
                          headers=self.header)
        responses = json.loads(v.text)
        return responses

    def get_filtered_datasets(self, payload):
        """Get datasets with filters

        :param payload: dict - How to filter the results {'ai':['requested','finished']}

        :return: dict - datasets that pass the payload filter
        """
        payload.update(self.static_payload)
        r = requests.post(self.data_path,data=json.dumps(payload), headers=self.header)
        responses = json.loads(r.text)
        return responses

    def get_new_experiments(self, last_update):
        """Get experiments that occurred after last_update

        :param last_update: int - 

        :returns: dict - ml experiments results
        """
        payload = {'date_start':last_update,'has_scores':True}
        payload.update(self.static_payload)
        params = json.dumps(payload)
        print("requesting from : ", self.exp_path)
        res = requests.post(self.exp_path, data=params, headers=self.header)
        data = json.loads(res.text)

        return data

    def set_ai_status(self, datasetId, aiStatus):
        """set the ai status for the given dataset.
        
        :param datasetId: string - dataset to update
        :param aiStatus: string 
        """
        payload = {'ai':aiStatus}
        payload.update(self.static_payload) #not sure if this is necessary?
        data_submit_path = '/'.join([self.submit_path, datasetId,'ai'])
        res = None
        try:
            res = requests.put(data_submit_path,data=json.dumps(payload), headers=self.header)
        except:
            print("Unexpected error in set_ai_status for path '", data_submit_path, "':", sys.exc_info()[0])
            raise
        return res


# @Deprecated, used by recommenders
def get_all_ml_p_from_db(path,key):
    """ Returns a list of ml and parameter options from the server.
    TODO - migrate to LabApi
    
    :param path: 'api/preferences'
    :param key:

    :returns: dataframe - unique ml parameter options
    """

    # get json from server
    # filter on username (given in dataset)
    payload = {'apikey':key,'username':'testuser'}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
    assert r.status_code == requests.codes.ok, "get_all_ml_p_from_db status_code not ok, path: " + str(path) + " status code: " + str(r.status_code)
    print('r:',r)
    response = json.loads(r.text)
    algorithms = response[0]['algorithms']
    result = [] # returned value
    good_def = True # checks that json for ML is in good form

    for i,x in enumerate(algorithms):
    #for i,x in enumerate(response):
        #print('ML: ',x['name'])
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
                result.append({'algorithm':x['_id'],'parameters':str(ahc)})
        else:
            print('warning: ', x['name'], 'was skipped')
        good_def = True

    # convert to dataframe, making sure there are no duplicates
    all_ml_p = pd.DataFrame(result).drop_duplicates()

    print(len(all_ml_p),' ml-parameter options loaded')

    return all_ml_p

# @Deprecated, not used
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

# @Deprecated, used in ai.py
def get_ml_id_dict(path,key):
    """Returns a dictionary for converting algorithm IDs to names.
    TODO - migrate to LabApi
    """

    # get json from server
    payload = {'apikey':key}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
    assert r.status_code == requests.codes.ok, "get_all_ml_p_from_db status_code not ok, path: " + str(path) + " status code: " + str(r.status_code)
    print('r:',r)
    responses = json.loads(r.text)

    ml_id_to_name = {}
    for ml in responses:
        ml_id_to_name.update({ml['_id']:ml['name']})

    return ml_id_to_name


# @Deprecated, used in ai.py
def get_user_datasets(path,key,user):
    """Returns a dictionary for converting dataset IDs to names.
    TODO - migrate to LabApi   
    """
    # get json from server
    payload = {'apikey':key,'username':user}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
    assert r.status_code == requests.codes.ok, "get_user_datasets status_code not ok, status code: " + str(r.status_code)
    responses = json.loads(r.text)
    dataset_id_to_name = {}
    for dataset in responses:
        dataset_id_to_name.update({dataset['_id']:dataset['name']})
    return dataset_id_to_name
