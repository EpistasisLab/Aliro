"""
Databse utility functions for Penn-AI
"""

import pandas as pd
import numpy as np
import pdb
import json
import requests
import itertools as it

def get_all_ml_p_from_db(path,key):
    """ Returns a list of ml and parameter options from the server."""

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


def get_toggled_dataset_ids(dataset_names,datasets):
    print(dataset_names);
    return 'foo'


def validate_ml_p():
    """(WIP) Catch any invalid parameter combinations that might arise"""
