import argparse
import requests
import json
import os
import time
import requests
import pandas as pd
from io import StringIO

LAB_HOST = os.environ['LAB_HOST']
LAB_PORT = os.environ['LAB_PORT']
basedir = os.environ['PROJECT_ROOT']


class Experiment:
    def __init__(self, method_name, basedir=basedir):
        """
        method_name: ML Algorithm
        basedir: basedir for this project
        """
        self.method_name = method_name
        self.basedir = basedir
        self.build_paths()

    def build_paths(self):
        self.tmpdir = '{}/machine/learn/{}/tmp/'.format(self.basedir, self.method_name)

    def get_input(self):
        return get_input(self.method_name, self.tmpdir)


def get_input(method_name, tmpdir):
    args = parse_args(get_params(method_name))
    assert args['_id']
    input_data = get_input_data(args['_id'], tmpdir)
    return (args, input_data)


def save_output(tmpdir, _id, output):
    expdir = tmpdir + _id + '/'
    with open(os.path.join(expdir, 'value.json'), 'w') as outfile:
        json.dump({'_scores': output}, outfile)


def get_params(method_name):
    params = {}
    uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/projects/'
    jsondata = json.loads(requests.get(uri).text)
    for pdict in jsondata:
        if pdict['name'] == method_name:
            params = pdict['param_type']
    return params


def parse_args(params):
    parser = argparse.ArgumentParser()

    # parse args for each parameter
    for key, val in params.items():
        arg = '--' + key
        arg_dest = key
        arg_default = val['default']
        arg_type = get_type(val['type'])
        arg_help = val['description']

        parser.add_argument(arg, action='store', dest=arg_dest,
                            default=arg_default, type=arg_type, help=arg_help)

    parser.add_argument('--_id', action='store', dest='_id',
                        default=None, type=str, help="Experiment id in database")

    args = vars(parser.parse_args())

    print('parsed args:', args)

    return args

def get_input_data(_id, tmpdir):
    expdir = tmpdir + _id + '/'
    if not os.path.exists(expdir):
        os.makedirs(expdir)
    response = requests.get('http://' + LAB_HOST +
                            ':' + LAB_PORT + '/api/v1/experiments/' + _id)
    jsondata = json.loads(response.text)

    #files = jsondata['files']
    _dataset_id = jsondata['_dataset_id']
    if (_dataset_id is None):
        raise RuntimeError("Error when running experiment '" + _id + "': Unable to get _dataset_id from lab.  Response: " + str(jsondata))

    response = requests.get('http://' + LAB_HOST +':' + LAB_PORT + '/api/v1/datasets/' + _dataset_id)
    jsondata = json.loads(response.text)
    files = jsondata['files']
    if len(files) == 1: # only 1 file
        uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/files/' + files[0]['_id']
        input_data = pd.read_csv(StringIO(requests.get(uri).text), sep='\t')
    else: # two files for cross-validation
        input_data = []
        for file in files: # need api support !!the 1st one is training dataset and 2nd one is testing datast
            uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/files/' + file['_id']
            input_data.append(pd.read_csv(StringIO(requests.get(uri).text), sep='\t'))

    return input_data


def bool_type(val):
    if(val.lower() == 'true'):
        return True
    elif(val.lower() == 'false'):
        return False
    else:
        raise argparse.ArgumentTypeError(val + ' is not a valid boolean value')

# this shouldn't be for all int types --> change later

def int_or_none(val):
    if(val.lower() == 'none'):
        return None
    try:
        int(val)
    except Exception:
        raise argparse.ArgumentTypeError(val + ' is not a valid int value')
    return int(val)

# this shouldn't be for all str types --> change later


def str_or_none(val):
    if(val.lower() == 'none'):
        return None
    try:
        str(val)
    except Exception:
        raise argparse.ArgumentTypeError(val + ' is not a valid str value')
    return str(val)

# how should this check what kind of enum type? right now, just returns a string.


def enum_type(val):
    return str(val)


def get_type(type):
    known_types = {
        'int': int_or_none,  # change this later
        'float': float,
        'string': str_or_none,  # change this later
        'bool': bool_type,
        'enum': enum_type  # change this later
        # float between 1 and 0
        # enum type
    }
    return known_types[type]
