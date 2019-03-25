import argparse
import requests
import json
import os
import time
import requests
import pandas as pd
from io import StringIO

# get PennAI environment information
LAB_HOST = os.environ.get('LAB_HOST', 'lab')
LAB_PORT = os.environ.get('LAB_PORT', '5080')
basedir = os.environ.get('PROJECT_ROOT', '.')


class Experiment:
    def __init__(self, args, basedir=basedir):
        """ Experiment class for PennAI.

        Parameters
        ----------
        args: dict
            Arguments of a experiment from PennAI API
        basedir: string
            base directory for this project

        Returns
        -------
        None
        """
        self.args = args
        self.method_name = self.args['method']
        self.basedir = basedir
        # temporary directory
        self.tmpdir = '{}/machine/learn/tmp/{}/'.format(self.basedir, self.method_name)
        if not os.path.isdir(self.tmpdir):
            os.makedirs(self.tmpdir)


    def get_input(self):
        """Get input data based on experiment ID (_id) from PennAI API.

        Returns
        -------
        input_data: pandas.Dataframe or list of two pandas.Dataframe
            pandas.DataFrame: PennAI will use train_test_split to make train/test splits
            list of two pandas.DataFrame: The 1st pandas.DataFrame is training dataset,
                while the 2nd one is testing dataset
        """
        return get_input_data(self.args['_id'], self.tmpdir)

    def get_model(self):
        """Build scikit learn method based on arguments from PennAI API.

        Returns
        -------
        model: scikit-learn Estimator
            a machine learning model with scikit-learn API
        method_type: string
            'classification': classification model
            'regression': regression model
        """
        projects = get_projects()
        pdict = next(item for item in projects if item["name"] == self.method_name)
        params = pdict['schema']
        import_path = pdict['path']
        method_type = pdict['category']
        encoding_strategy = pdict['categorical_encoding_strategy']
        method_args = {k:self.args[k] for k in params.keys()}
        exec('from {} import {}'.format(import_path, self.method_name))
        method = eval(self.method_name)
        model = method(**method_args)
        return model, method_type, encoding_strategy


def get_projects():
    """Get all machine learning algorithm's information from PennAI API
    This information should be the same with projects.json.

    Returns
    -------
    projects: dict
        a dict of all machine learning algorithm's information

    """
    uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/projects'
    projects = json.loads(requests.get(uri).text)
    return projects


def parse_args():
    """Parse arguments for machine learning algorithm.

    Returns
    -------
    args: dict
        Arguments of a experiment from PennAI API
    param_grid: dict
        Dictionary with parameters names (string) as keys and lists
        of parameter settings to try as values, or a list of such dictionaries,
        in which case the grids spanned by each dictionary in the list are explored.
        This enables searching over any sequence of parameter settings.

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
        subparser.add_argument('--grid_search', action='store', dest='grid_search',
                        default=False, type=bool, help=('If grid_search is True, then '
                        'the experiment will perform GridSearchCV'))
        param_grid = {}
        # parse args for each parameter
        for key, val in params.items():
            arg = '--' + key
            arg_dest = key
            arg_default = val['default']
            arg_type = get_type(val['type'])

            subparser.add_argument(arg, action='store', dest=arg_dest,
                                default=arg_default, type=arg_type)
            if "grid_search" in val['ui']:
                values = val['ui']["grid_search"]
            elif "values" in val['ui']:
                values = val['ui']["values"]
            else:
                values = val['ui']["choices"]
            param_grid[key] = [arg_type(v) for v in values]


    args = vars(parser.parse_args())
    print('parsed args:', args)
    return args, param_grid


def get_input_data(_id, tmpdir):
    """ Get input dataset information from PennAI API.
    Parameters
    ----------
    _id: string
        Experiment ID in PennAI API
    tmpdir: string
        Path of temporary directory

    Returns
    -------
    input_data: pandas.Dataframe or list of two pandas.Dataframe
        pandas.DataFrame: PennAI will use train_test_split to make train/test splits
        list of two pandas.DataFrame: The 1st pandas.DataFrame is training dataset,
            while the 2nd one is testing dataset
    data_info: dict
        target_name: string, target column name
        filename: list, filename(s)
        categories: list, categorical feature name(s)
        ordinals: dict
            keys: categorical feature name(s)
            values: categorical values
    """
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
    filename = [file['filename'] for file in files]
    target_name = ''
    categories = None
    ordinals = None
    for file in files:
        if 'dependent_col' not in file:
            raise RuntimeError("Target column is missing in {}.".format(" or ".join(filename)))
        if target_name and target_name != file['dependent_col']:
            raise RuntimeError("Files in one experiment should has the same target column name. Related files: {}.".format(','.join(filename)))
        else:
            target_name = file['dependent_col']
        if 'categorical_features' in file:
            categories = file['categorical_features']
        if 'ordinal_features' in file:
            ordinals = file['ordinal_features']

    if len(files) == 1: # only 1 file
        input_data = pd.read_csv(StringIO(get_file_data(files[0]['_id'])), sep=None, engine='python')
        check_column(target_name, input_data)
    else: # two files for cross-validation
        input_data = []
        for file in files: # need api support !!the 1st one is training dataset and 2nd one is testing datast
            indata = pd.read_csv(StringIO(get_file_data(file['_id'])), sep=None, engine='python')
            check_column(target_name, indata)
            input_data.append(indata)
    data_info = {
                'target_name': target_name,
                'filename': filename,
                'categories': categories,
                'ordinals': ordinals
                }
    return input_data, data_info

def get_file_data(file_id):
    """
    Attempt to retrieve dataset file.
    If the file is corrupt or an error response is returned, it will rasie an ValueError.

    Parameters
    ----------
    file_id: string
        id of the file to retrieve from the server

    Return: string
        dataset strings

    """
    uri = 'http://' + LAB_HOST + ':' + LAB_PORT + '/api/v1/files/' + file_id
    res = requests.get(uri)

    if res.status_code != requests.codes.ok:
        msg = ('Unable to retrieve file {file_id}.  '
                'Status code: {status_code}. '
                'Response text: {res_text}'.format(file_id=file_id,
                                                    status_code=status_code,
                                                    res_text=res.text))
        raise ValueError(msg)

    return res.text


def check_column(column_name, dataframe):
    """ check if a column exists in Pandas DataFrame.
    Parameters
    ----------
    column_name: string
        column name
    dataframe: pandas.DataFrame
        input dataset DataFrame

    Returns
    -------
    None
    """
    if column_name not in dataframe.columns.values:
        raise ValueError(
                        'The provided data file does '
                        'not seem to have target column {}.'.format(column_name)
                        )


def bool_type(val):
    """Convert argument to boolean type.
    Parameters
    ----------
    val: string
        value of a parameter

    Returns
    -------
    _: boolean
        converted value
    """
    if(val.lower() == 'true'):
        return True
    elif(val.lower() == 'false'):
        return False
    else:
        raise argparse.ArgumentTypeError(val + ' is not a valid boolean value')


def str_or_none(val):
    """Convert argument to str type or None.
    Parameters
    ----------
    val: string
        value of a parameter

    Returns
    -------
    _: string or None
        if input value if "none", then the function will return None
        otherwise it will retune string
    """
    if(val.lower() == 'none'):
        return None
    try:
        str(val)
    except Exception:
        raise argparse.ArgumentTypeError(val + ' is not a valid str value')
    return str(val)


def get_type(type):
    """Return convertion function for input type.
    Parameters
    ----------
    type: string
        type of a parameter which is defined in projects.json

    Returns
    -------
    known_types[type]: function
        function for converting argument from PennAI UI before assigning to scikit-learn estimator
    """
    known_types = {
        'int': int,  # change this later
        'float': float,
        'string': str_or_none,  # change this later
        'bool': bool_type,
        'enum': str
    }
    return known_types[type]
