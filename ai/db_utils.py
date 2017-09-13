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
    payload = {'apikey':key}
    r = requests.post(path,data=json.dumps(payload), headers={'content-type':'application/json'})
    print('r:',r)
    responses = json.loads(r.text)

    result = [] # returned value 
    good_def = True # checks that json for ML is in good form
    
    for i,x in enumerate(responses):
        print('ML: ',x['name'])
        hyperparams = x['schema'].keys()
        hyperparam_dict = {}
                
        # get a dictionary of hyperparameters and their values
        for h in hyperparams:
            #print('x[''schema''][h]',x['schema'][h])
            if 'ui' in x['schema'][h]:
                hyperparam_dict.update({h: x['schema'][h]['ui']['choices']})
            else:
                good_def = False
        if good_def:
            sorted_hp = sorted(hyperparam_dict)
            # enumerate all possible hyperparameter combinations
            all_hyperparam_combos = [dict(zip(sorted_hp,prod)) 
                                      for prod in it.product(*(hyperparam_dict[k] 
                                      for k in sorted_hp))]
            
            print('\thyperparams: ',hyperparam_dict)
            print(len(all_hyperparam_combos),' total hyperparameter combinations')
                             
            for ahc in all_hyperparam_combos:
                result.append({'algorithm':x['_id'],'parameters':ahc})
        else:
            print(x['name'], 'was skipped')
        good_def = True

    
    return pd.DataFrame(result)

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

