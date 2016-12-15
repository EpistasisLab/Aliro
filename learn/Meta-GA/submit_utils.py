#!/usr/bin/python3
import numpy as np
import json
import pycurl
import time
import argparse
import requests
import os

from datetime import datetime
#from requests_toolbelt.multipart.encoder import MultipartEncoder


from utils_lib.io_utils import Experiment

basedir='/share/devel/Gp/learn/metaga/'
tmpdir=basedir+'tmp/'

# a tmp json file for a meta-population

if not os.path.exists(tmpdir):
    os.makedirs(tmpdir)

fglab_url = os.environ['FGLAB_URL']
expbase='{}/api/v1/batches/'.format(fglab_url)

def config_exp(Chosen_ML_algorithms):
    exp = Experiment(Chosen_ML_algorithms)
    #args, input_file = exp.get_input()
    # get project id and args_list
    project_id = exp.get_project_id()
    args_list = exp.get_args_list()
    baseuri='{}/api/v1/projects/{}/batch'.format(fglab_url, project_id)

    return baseuri, args_list


def json_submit_file(population, param_batch_json, args_list, input_file = None):
    # Parse arguments
    parser = argparse.ArgumentParser("Perform lower level ML algorithms")
    parser.add_argument('--_id', dest='_id', default=None)
    # a file has all the individual (params_set)
    param_list_file = open(param_batch_json, 'w')
    param_list_file.write('[')
    # parameter name settings
    # need to get from
    num_ind = len(population)
#    params = vars(parser.parse_args())
    inpos = 1
    for individual in population:
        args = list(individual)
        param_list_file.write('{')
        for arg_name, arg in zip(args_list, args):
            param_list_file.write("\"{}\" : \"{}\", ".format(arg_name, arg))
        if input_file: # add input_file argumnet and check on lower_level algorithms
            param_list_file.write("\"{}\" : \"{}\" ".format('input_file', input_file))
        if inpos < num_ind:
            param_list_file.write('},\n')
            inpos += 1
        else:
            param_list_file.write('}')
    param_list_file.write(']\n')
    param_list_file.close()
    return num_ind

def FGlab_submit(population, Chosen_ML_algorithms, input_file = None, pid = 9999):
    """
    Population: A list of individual
    Chosen_ML_algorithms: method name (string type)
    """

    baseuri, args_list = config_exp(Chosen_ML_algorithms)
    timestamp = datetime.now().strftime("%y-%m-%d-%H-%M")
    param_batch_json = '{}batch_{}_{}.json'.format(tmpdir, pid, timestamp)
    num_ind = json_submit_file(population, param_batch_json, args_list, input_file = input_file)
    # change the problem id to different problem

    headers = {'Accept' : 'application/json', 'Content-Type' : 'application/json'}
    response = requests.post(baseuri, data=open(param_batch_json, 'rb'), headers=headers)
    # check after 5 seconds
    time.sleep(5)

    json_data = response.json()
    # get batch ID
    batch_id = json_data['_id']
    # initial status
    exp_status = 'init'
    # batch URI
    batchuri =  expbase + batch_id
    nofinished =  0

    while num_ind != nofinished:
        exp_response = requests.get(batchuri)
        exp_data = exp_response.json()
        exp_status = exp_data['_status']
        exps = exp_data['_experiments']
        # reset nofinished
        nofinished =  0
        nofail = 0 # Experiment fail maybe due to unsupprot combination
        for exp_ind in exps:
            if '_scores' in exp_ind:
                nofinished += 1
            elif exp_ind['_status'] == 'fail':
                nofail += 1
        if exp_status == 'success' or num_ind == nofinished:
            break
        if nofail + nofinished == num_ind:
            break
        if exp_status == 'running':
            time.sleep(2) # check every 2 seconds
    # rebuild population based on experiments
    fitnesses = []

    #print(exp_data['_experiments'])
    for experiment,individual in zip(exp_data['_experiments'],population):
        tmpdict = experiment['_options']
        for key in range(len(args_list)):
            individual[key] = tmpdict[args_list[key]]
        # add a exp_id to track result
        setattr(individual, 'exp_id', experiment['_id'])
        try:
            if 'accuracy_score' in experiment['_scores']:
                fitnesses.append(experiment['_scores']['accuracy_score'])
            else:
                fitnesses.append(1-experiment['_scores']['mean_squared_error'])
                # need change for different methodes
        except:
            fitnesses.append(0.0) # fail experiment may change value later
    os.system('rm -f {}'.format(param_batch_json))
    return population, fitnesses
