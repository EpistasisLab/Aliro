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
    def __init__(self, args, basedir=basedir):
        """
        method_name: ML Algorithm
        basedir: basedir for this project
        """
        self.args = args
        self.method_name = self.args['method']
        self.basedir = basedir
        self.build_paths()

    def build_paths(self):
        """Build temporary directory."""
        self.tmpdir = '{}/machine/learn/{}/tmp/'.format(self.basedir, self.method_name)

    def get_input(self):
        """Get input data based on _id from API."""
        input_data = get_input_data(self.args['_id'], self.tmpdir)
        return input_data

    def get_model(self):
        """Get scikit learn method."""
        projects = get_projects()
        for pdict in projects:
            if pdict['name'] == self.method_name:
                params = pdict['schema']
                import_path = pdict['path']
                method_type = pdict['category']
        method_args = {k:self.args[k] for k in params.keys()}
        exec('from {} import {}'.format(import_path, self.method_name))
        method = eval(self.method_name)
        model = method(**method_args)
        return model, method_type


def get_projects():
    """get all machine learning algorithm's information from API
    (the information should be the same with projects.json).
    """
    uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/projects'
    projects = json.loads(requests.get(uri).text)
    return projects


def parse_args():
    """Parse arguments for machine learning algorithm.
    """
    projects = get_projects()
    parser = argparse.ArgumentParser(description='Driver for all machine learning algorithms in PennAI')
    subparsers = parser.add_subparsers(dest='method',help="ML Learning Algorithm")

    for pdict in projects:
        method = pdict['name']
        params = pdict['schema']
        subparser = subparsers.add_parser(method)
        subparser.add_argument('--_id', action='store', dest='_id',
                        default=None, type=str, help="Experiment id in database")

        # parse args for each parameter
        for key, val in params.items():
            arg = '--' + key
            arg_dest = key
            arg_default = val['default']
            arg_type = get_type(val['type'])

            subparser.add_argument(arg, action='store', dest=arg_dest,
                                default=arg_default, type=arg_type)
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


def str_or_none(val):
    if(val.lower() == 'none'):
        return None
    try:
        str(val)
    except Exception:
        raise argparse.ArgumentTypeError(val + ' is not a valid str value')
    return str(val)


def enum_type(val):
    return str(val)


def get_type(type):
    known_types = {
        'int': int,  # change this later
        'float': float,
        'string': str_or_none,  # change this later
        'bool': bool_type,
        'enum': enum_type  # change this later
        # float between 1 and 0
        # enum type
    }
    return known_types[type]
