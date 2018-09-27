"""
Databse utility functions for Penn-AI
"""

import pandas as pd
import numpy as np
import pdb
import json
import requests
import itertools as it

class LabApi:
    """Class for getting data from the PennAI server
    """

    def __init__(self, db_path, user, api_key, extra_payload, verbose):
        self.db_path = db_path
        self.exp_path = '/'.join([self.db_path,'api/experiments'])
        self.data_path = '/'.join([self.db_path,'api/datasets'])
        self.projects_path = '/'.join([self.db_path,'api/v1/projects'])
        self.status_path = '/'.join([self.db_path,'api/v1/datasets'])
        self.submit_path = '/'.join([self.db_path,'api/userdatasets'])
        self.algo_path = '/'.join([self.db_path,'api/projects'])
        self.api_key=api_key
        self.user=user
        self.verbose=verbose
        self.header = {'content-type': 'application/json'}
        # optional extra payloads (e.g. user id) for posting to the db
        self.extra_payload = extra_payload
        # static payload is the payload that is constant for every API post
        # with api key for this host
        self.static_payload = {'apikey':self.api_key}#,
        # add any extra payload
        self.static_payload.update(extra_payload)



    def post_experiment(self, algorithmId, experimentData):
        """Post an machine learning experiment

        :param algorithmId:
        :param experimentData:

        :returns: json - return status 
        """
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

    def get_projects(self):
        v = requests.post(self.projects_path,data=json.dumps(self.static_payload),
                          headers=self.header)
        responses = json.loads(v.text)
        return responses

    def get_datasets(self, payload):
        """Get datasets with filters

        :param payload: example - {'ai':['requested','finished']}
        """
        payload.update(self.static_payload)
        r = requests.post(self.data_path,data=json.dumps(payload), headers=self.header)
        responses = json.loads(r.text)
        return responses

    def get_new_experiments(self, last_update):
        """Get experiments that occurred after last_update

        :param last_update:

        :returns: json data
        """
        payload = {'date_start':last_update,'has_scores':True}
        payload.update(self.static_payload)
        params = json.dumps(payload)
        print("requesting from : ", self.exp_path)
        res = requests.post(self.exp_path, data=params, headers=self.header)
        data = json.loads(res.text)

        return data

    def set_ai_status(self, datasetId, aiStatus):
        """set the ai status for the given dataset
        
        :param datasetId:
        :param aiStatus:
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

# @Deprecated, used by recommenderss
def get_all_ml_p_from_db(path,key):
    """ Returns a list of ml and parameter options from the server.
    
    :param path:
    :param key:

    :returns stuff:
    """

    # get json from server
    # filter on username (given in dataset)
    payload = {'apikey':key,'username':'testuser'}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
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
    """Returns a dictionary for converting algorithm IDs to names."""

    # get json from server
    payload = {'apikey':key}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
    print('r:',r)
    responses = json.loads(r.text)

    ml_id_to_name = {}
    for ml in responses:
        ml_id_to_name.update({ml['_id']:ml['name']})

    return ml_id_to_name


# @Deprecated, used in ai.py
def get_user_datasets(path,key,user):
    """Returns a dictionary for converting dataset IDs to names."""
    # get json from server
    payload = {'apikey':key,'username':user}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
    responses = json.loads(r.text)
    dataset_id_to_name = {}
    for dataset in responses:
        dataset_id_to_name.update({dataset['_id']:dataset['name']})
    return dataset_id_to_name
