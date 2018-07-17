import argparse
import requests
import json
import os
import time

LAB_HOST = os.environ['LAB_HOST']
LAB_PORT = os.environ['LAB_PORT']
basedir = os.environ['PROJECT_ROOT']
cacheinputfiles = True
cachedir = basedir + '/tmp/'


class Experiment:

    def __init__(self, method_name):
        self.build_paths(method_name)

    def build_paths(self, method_name):
        self.schema = basedir + '/lab/examples/Algorithms/' + \
            method_name + '/' + method_name + '.json'
        self.basedir = basedir + '/machine/learn/' + method_name + '/'
        self.tmpdir = self.basedir + 'tmp/'

    def get_input(self):
        return get_input(self.schema, self.tmpdir)


def get_input(schema, tmpdir):
    args = parse_args(get_params(schema))
    assert args['_id']
    input_file = get_input_file(args['_id'], tmpdir)
    if 'input_file' in args and input_file == 0:
        input_file = args['input_file']
    return (args, input_file)


def save_output(tmpdir, _id, output):
    expdir = tmpdir + _id + '/'
    with open(os.path.join(expdir, 'value.json'), 'w') as outfile:
        json.dump({'_scores': output}, outfile)


def get_params(schema):
    params = {}
    with open(schema, 'rb') as f:
        params = json.loads(f.read().decode('utf-8'))

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

    parser.add_argument('--input_file', action='store', dest='input_file',
                        default=None, type=str, help="input file from command line")
    parser.add_argument('--_id', action='store', dest='_id',
                        default=None, type=str, help="Experiment id in database")

    args = vars(parser.parse_args())

    print('parsed args:', args)

    return args

def get_input_file(_id, tmpdir):
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
    if cacheinputfiles:
        for file in files:
            cached_file = cachedir + file['_id']
            if not os.path.exists(cached_file):
                uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/files/' + file['_id']
                response = requests.get(uri)
                with open(cached_file, 'w') as f:
                    f.write(response.text)
        if len(files) == 1:
            input_file = expdir + files[0]['filename']
            cached_file = cachedir + files[0]['_id']
            os.symlink(cached_file,input_file)
        else:
            input_file = []
            for file in files:
                input_f = expdir + file['filename']
                cached_file = cachedir + file['_id']
                os.symlink(cached_file,input_f)
                input_file.append(input_f)
        return input_file
    else:
        input_file = ''
        numfiles = 0
        for file in files:
            uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/files/' + file['_id']
            response = requests.get(uri)
            input_file = expdir + file['filename']
            with open(input_file, 'w') as f:
                f.write(response.text)
                numfiles += 1

        if numfiles == 1:
            return input_file
        else:
            return 0


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
