import os
import io
import sys
import logging
import argparse
import requests
import traceback
import simplejson
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)

def run_code(code, file_id, experiment_id):
    stdout_backup = sys.stdout
    sys.stdout = io.StringIO()
    if file_id is not None:
        raw_data = get_file_from_server(file_id)
        df = pd.read_csv(io.StringIO(raw_data), sep=None, engine='python')
    exec(code)
    result = sys.stdout.getvalue()
    sys.stdout = stdout_backup
    if result is None:
        result = ''
    return result
    
    
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
    return res.text

def main():
    parser = argparse.ArgumentParser(description="Run python code", add_help=False)
    parser.add_argument("--code", help="python code to run")
    parser.add_argument("--file_id", help="dataset file_id")
    parser.add_argument("--experiment", help="experiment id")
    
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
        result = run_code(args.code, args.file_id, args.experiment)
        response = simplejson.dumps({'ok': True, 'result': result})
        sys.stdout.write(response)
        sys.stdout.flush()
    except Exception as e:
        logger.error(traceback.format_exc())
        response = simplejson.dumps({'ok': False, 'error': str(e)})
        sys.stderr.write(response)
        sys.stderr.flush()

if __name__ == "__main__":
    main()
                     