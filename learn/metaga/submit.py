#!/usr/bin/python3
import numpy as np
import json
import pycurl
import time
import argparse
import requests
import multiprocessing
import time
import os
from requests_toolbelt.multipart.encoder import MultipartEncoder
lab_host = os.environ['LAB_HOST']
# no need multiprocessing in submit functions
#import multiprocessing

project_id = '57ffd3c1fa76cb0022258722'
baseuri='http://'+lab_host+':5080/api/v1/projects/'+project_id+'/experiment'
expbase='http://'+lab_host+':5080/api/v1/experiments/'

url = 'http://lab:5080/api/v1/projects/'+project_id+'/batch'
headers = {'Accept' : 'application/json', 'Content-Type' : 'application/json'}




#def launch_lowerGP(population_size, generations, crossover_rate, mutation_rate, tournsize):
# launch_individual
def launch_lowerGP(individual):
    # Parse arguments
    parser = argparse.ArgumentParser("Perform lower level deapGP")
    parser.add_argument('--_id', dest='_id', default=None)
#    params = vars(parser.parse_args())
    multipart_data = MultipartEncoder(
        fields={
                'population_size': str(individual[0]),
                'generations': str(individual[1]),
                'crossover_rate': str(individual[2]),
                'mutation_rate': str(individual[3]),
                'tournsize': str(individual[4]),
                'random_state': '42',
               }
        )

    response = requests.post(baseuri, data=multipart_data,
        headers={'Content-Type': multipart_data.content_type})
    json_data = response.json()
    _id = json_data['_id']
    #print(_id)
    exp_status = 'init'
    experimenturi =  expbase + _id
    while (exp_status != 'success' or 'best_fitness_score' not in exp_data):  # This constructs an infinite loop
        exp_response = requests.get(experimenturi)
        exp_data = exp_response.json()
        exp_status = exp_data['_status']
        if exp_status == 'success' and 'best_fitness_score' in exp_data:
            #print(exp_data)
            break
        #print(exp_status)
        if exp_status == 'running':
            time.sleep(2) # check every 2 seconds
        if exp_status == 'success':
            time.sleep(2) # check every 2 seconds
        if exp_status == 'fail':
            break
    print(exp_data['best_fitness_score'])
    return exp_data['best_fitness_score'],


def SymbReg_FGlab_submit(population):
    """
    Population: A list of individual
    """
    # Parse arguments
    parser = argparse.ArgumentParser("Perform lower level deapGP")
    parser.add_argument('--_id', dest='_id', default=None)
    param_list = []
#    params = vars(parser.parse_args())
    for individual in population:
        param_set = {
                'population_size': str(individual[0]),
                'generations': str(individual[1]),
                'crossover_rate': str(individual[2]),
                'mutation_rate': str(individual[3]),
                'tournsize': str(individual[4]),
                'random_state': '42'
                }
        param_list.append(param_set)

    response = requests.post(url, data=, headers=headers)
    json_data = response.json()
    exp_status = 'init'
    experimenturi =  expbase + _id
    while (exp_status != 'success'): #or 'best_fitness_score' not in exp_data):  # This constructs an infinite loop
        exp_response = requests.get(experimenturi)
        exp_data = exp_response.json()
        exp_status = exp_data['_status']
        if exp_status == 'success': #and 'best_fitness_score' in exp_data:
            #print(exp_data)
            break
        #print(exp_status)
        if exp_status == 'running':
            time.sleep(2) # check every 2 seconds
        if exp_status == 'success':
            time.sleep(2) # check every 2 seconds
        if exp_status == 'fail':
            break
    print(exp_data['best_fitness_score'])
    return exp_data['best_fitness_score'],

if __name__ == "__main__":
    jobs = []
    # launch multiprocessing jobs
    for i in range(5):
        p = multiprocessing.Process(target=launch_lowerGP, args=(i*100, i*200))
        jobs.append(p)
        p.start()
