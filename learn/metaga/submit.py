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

basedir='/share/devel/Gp/learn/metaga/'
tmpdir=basedir+'tmp/'


#def launch_lowerGP(population_size, generations, crossover_rate, mutation_rate, tournsize):
# launch_individual
def launch_lowerGP(individual):
    """
    A deap individual
    """
    # Parse arguments
    lab_host = os.environ['LAB_HOST']
    project_id = '57ffd3c1fa76cb0022258722'
    baseuri='http://'+lab_host+':5080/api/v1/projects/'+project_id+'/experiment'
    expbase='http://'+lab_host+':5080/api/v1/experiments/'

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
    exp_status = 'init'
    experimenturi =  expbase + _id
    while (exp_status != 'success' or 'best_fitness_score' not in exp_data):
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
    #lab_host = os.environ['LAB_HOST']
    project_id = '57ffd3c1fa76cb0022258722'
    baseuri='http://lab:5080/api/v1/projects/'+project_id+'/batch'
    expbase='http://lab:5080/api/v1/batches/'
    if not os.path.exists(tmpdir):
        os.makedirs(tmpdir)
    # Parse arguments
    parser = argparse.ArgumentParser("Perform lower level deapGP")
    parser.add_argument('--_id', dest='_id', default=None)
    # a file has all the individual (params_set)
    param_batch_json = tmpdir + 'batch.json'
    param_list_file = open(param_batch_json, 'w')
    param_list_file.write('[')
    keylist = ["population_size", "generations", "crossover_rate", "mutation_rate", "tournsize"]
    noind = len(population)
#    params = vars(parser.parse_args())
    inpos = 1
    for individual in population:
        param_list_file.write('{')
        for key in range(len(keylist)):
            param_list_file.write("\"{}\" : \"{}\", ".format(keylist[key], str(individual[key])))
        param_list_file.write("\"{}\" : \"{}\" ".format('random_state', '42'))
        if inpos < noind:
            param_list_file.write('},\n')
            inpos += 1
        else:
            param_list_file.write('}')
    param_list_file.write(']\n')
    param_list_file.close()
    headers = {'Accept' : 'application/json', 'Content-Type' : 'application/json'}
    response = requests.post(baseuri, data=open(param_batch_json, 'rb'), headers=headers)
    # check after 5 seconds
    time.sleep(5)

    json_data = response.json()
    # get batch ID
    batch_id = json_data['_id']
    # initial status
    exp_status = 'init'
    # batchuri
    batchuri =  expbase + batch_id
    nofinished =  0
    while (exp_status != 'success' and noind != nofinished):
        exp_response = requests.get(batchuri)
        exp_data = exp_response.json()
        exp_status = exp_data['_status']
        exps = exp_data['_experiments']
        nofinished =  0
        for exp_ind in exps:
            if 'best_fitness_score' in exp_ind:
                nofinished += 1
            else:
                print(exp_ind)
        print('Jobs# with results',nofinished)
        if exp_status == 'success' or noind == nofinished:
            break
        if exp_status == 'running':
            time.sleep(2) # check every 2 seconds
        if exp_status == 'fail':
            break
    #print(exp_data['best_fitness_score'])
    #return exp_data['best_fitness_score'],
    fitnesses = []
    for experiment,individual in zip(exp_data['_experiments'],population):
        tmpdict = experiment['_options']
        for key in range(len(keylist)):
            individual[key] = tmpdict[keylist[key]]
        fitnesses.append(experiment['best_fitness_score'])
    os.system('rm -rf '+tmpdir)
    return population, fitnesses



if __name__ == "__main__":
    jobs = []
    # launch multiprocessing jobs
    for i in range(5):
        p = multiprocessing.Process(target=launch_lowerGP, args=(i*100, i*200))
        jobs.append(p)
        p.start()
