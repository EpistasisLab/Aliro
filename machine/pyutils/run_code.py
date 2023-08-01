import os
import io
import sys
import joblib
import pickle
import logging
import argparse
import requests
import traceback
import simplejson
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def run_code(code, dataset_file_id, experiment_id):
    stdout_backup = sys.stdout
    sys.stdout = io.StringIO()
    if dataset_file_id is not None:
        raw_data = get_file_from_server(dataset_file_id)
        raw_data = raw_data.decode('utf-8')
        df = pd.read_csv(io.StringIO(raw_data), sep=None, engine='python')
    if experiment_id is not None:
        pickle = get_model_from_server(experiment_id)
        # logger.info("pickle file: " + pickle_file)
        model = joblib.load(io.BytesIO(pickle))
        model = model['model']
        logger.info("model: " + str(model))
    exec(code)
    result = sys.stdout.getvalue()
    sys.stdout = stdout_backup
    if result is None:
        result = ''
    return result
    

def get_model_from_server(experiment_id):    
    '''
    Retrieve a model from the main Aliro server
    '''
    apiPath = 'http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT']
    path = apiPath + "/api/v1/experiments/" + experiment_id + "/model"
    # modelpath is not used anymore, I am able to load the model directly from the server
    # modelpath = os.path.join(os.environ["CODE_RUN_PATH"], experiment_id, "model.pkl")
    
    logger.debug("retrieving model with experiment id:" + experiment_id)
    logger.debug("api path: " + path)
    
    res = None
    try:
        res = requests.request('GET', path, timeout=15)
    except:
        logger.error("Unexpected error in get_model_from_server for path 'GET: " +
                     str(path) + "': " + str(sys.exc_info()[0]))    
        raise
    
    if res.status_code != requests.codes.ok:
        msg = "Request GET status_code not ok, path: '" + \
            str(path) + "'' status code: '" + str(res.status_code) + \
            "'' response text: " + str(res.text)
        logger.error(msg)
        raise RuntimeError(msg)
    
    logger.info("Model retrieved, experiment_id: '" + experiment_id)
    
    # sample file info:
    # {"_id":"642ee647d89a5400464abcc5","filename":"model_642ee642d89a5400464abcc2.pkl","mimetype":"application/octet-stream","timestamp":1680795207293}
    file_info = simplejson.loads(res.text)
    
    # file_content = get_file_from_server(file_info['_id'])
    # with open(modelpath, 'wb') as f:
    #     f.write(file_content)
    
    # return modelpath
    return get_file_from_server(file_info['_id'])
    
    
def get_file_from_server(file_id):
    '''
    Retrieve a file from the main Aliro server
    '''
    apiPath = 'http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT']
    path = apiPath + "/api/v1/files/" + file_id

    logger.debug("retrieving file:" + file_id)
    logger.debug("api path: " + path)

    res = None
    try:
        res = requests.request('GET', path, timeout=15)
    except:
        logger.error("Unexpected error in get_file_from_server for path 'GET: " +
                     str(path) + "': " + str(sys.exc_info()[0]))
        raise

    if res.status_code != requests.codes.ok:
        msg = "Request GET status_code not ok, path: '" + \
            str(path) + "'' status code: '" + str(res.status_code) + \
            "'' response text: " + str(res.text)
        logger.error(msg)
        raise RuntimeError(msg)

    logger.info("File retrieved, file_id: '" + file_id +
                "', path: '" + path + "', status_code: " + str(res.status_code))
    
    # return res.text
    return res.content


def upload_file_to_server(file_path, file_name):
    '''Upload a file to the server'''
    apiPath = 'http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT']
    path = apiPath + "/api/v1/files"
    
    files = {'file': (file_name, open(file_path, 'rb'), 'application/octet-stream')}
    
    res = None
    try:
        res = requests.request('POST', path, files=files, timeout=15)
    except:
        logger.error("Unexpected error in upload_file_to_server for path 'POST: " +
                        str(path) + "': " + str(sys.exc_info()[0]))
        raise
    
    if res.status_code != requests.codes.ok:
        msg = "Request POST status_code not ok, path: '" + \
            str(path) + "'' status code: '" + str(res.status_code) + \
            "'' response text: " + str(res.text)
        logger.error(msg)
        raise RuntimeError(msg)
    
    logger.info("File uploaded, file_name: '" + file_name)
    
    return res.text

def main():
    parser = argparse.ArgumentParser(description="Run python code", add_help=False)
    parser.add_argument("--code", help="python code to run")
    parser.add_argument("--dataset_file_id", help="dataset file_id")
    parser.add_argument("--experiment_id", help="experiment id")
    parser.add_argument("--execution_id", help="execution id")
    
    args = parser.parse_args()
    
    logpath = os.path.join(os.environ["PROJECT_ROOT"], "target/logs")
    if not os.path.exists(logpath):
        os.makedirs(logpath)

    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fhandler = logging.FileHandler(
        os.path.join(logpath, 'RunCode.log'))
    fhandler.setFormatter(formatter)
    logger.addHandler(fhandler)
    
    result = None
    response = {}
    
    try:
        workdir = os.path.join(os.environ["CODE_RUN_PATH"], args.execution_id)
        current_dir = os.getcwd()
        os.chdir(workdir)
        result = run_code(args.code, args.dataset_file_id, args.experiment_id)
        # save_result_to_server(result, args.execution_id)
        os.chdir(current_dir)
        response = simplejson.dumps({'ok': True, 'status': 'completed', 'result': result})
        sys.stdout.write(response)
        sys.stdout.flush()
    except Exception as e:
        logger.error(traceback.format_exc())
        response = simplejson.dumps({'ok': False, 'status': 'error', 'result': str(e)})
        sys.stderr.write(response)
        sys.stderr.flush()

if __name__ == "__main__":
    main()
                     