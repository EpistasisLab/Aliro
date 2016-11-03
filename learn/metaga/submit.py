#!/usr/bin/python3
import numpy as np
import json
import pycurl
import time
import argparse
import requests
import time
from requests_toolbelt.multipart.encoder import MultipartEncoder
import multiprocessing

project_id = '57ffd3c1fa76cb0022258722'
baseuri='http://lab:5080/api/v1/projects/'+project_id+'/experiment'
expbase='http://lab:5080/api/v1/experiments/'


def launch(population_size,generations):
    # Parse arguments
    parser = argparse.ArgumentParser("Perform Logistic Regression")
    parser.add_argument('--_id', dest='_id', default=None)
    params = vars(parser.parse_args())
    multipart_data = MultipartEncoder(
        fields={
                'population_size': str(population_size),
                'generations': str(generations),
                'crossover_rate': '0.1',
                'mutation_rate': '0.05',
                'tournsize': '3',
                'random_state': '42',
               }
        )

    response = requests.post(baseuri, data=multipart_data,
        headers={'Content-Type': multipart_data.content_type})
    json_data = response.json()
    _id = json_data['_id']
    print(_id)
    exp_status = 'init'
    experimenturi =  expbase + _id
    while (exp_status != 'success') :  # This constructs an infinite loop
        exp_response = requests.get(experimenturi)
        exp_data = exp_response.json()
        exp_status = exp_data['_status']
        if exp_status == 'success':
            print(exp_data)
        print(exp_status)
        if exp_status == 'running':
            time.sleep(5)
        if exp_status == 'fail':
            break


if __name__ == "__main__":
    jobs = []
    for i in range(5):
        p = multiprocessing.Process(target=launch, args=(i*100, i*200))
        jobs.append(p)
        p.start()

