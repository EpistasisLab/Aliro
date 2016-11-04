import argparse
import urllib3
import json
import os
import time

http = urllib3.PoolManager()

class Experiment:

	def __init__(self, method_name):
		self.build_paths(method_name)

	def build_paths(self, method_name):
		#self.schema = '/share/devel/Gp/lab/examples/' + method_name + '/' + method_name + '.json'
		self.schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/' + method_name + '/' + method_name + '.json'
		#self.basedir = '/share/devel/Gp/learn/' + method_name + '/'
		self.basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/' + method_name + '/'
		self.tmpdir = self.basedir + 'tmp/'

	def get_input(self):
		return get_input(self.schema, self.tmpdir)

def get_input(schema, tmpdir):
	args = parse_args(get_params(schema))
	input_file = get_input_file(args['_id'], tmpdir)

	return (args, input_file)

def save_output(tmpdir, _id, output):
	expdir = tmpdir + _id + '/'
	with open(os.path.join(expdir, 'value.json'), 'w') as outfile:
		json.dump({ '_scores': output }, outfile)

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

		parser.add_argument(arg, action='store', dest=arg_dest, default=arg_default, type=arg_type, help=arg_help)

	parser.add_argument('--_id', action='store', dest='_id', default=None, type=str, help="Experiment id in database")

	args = vars(parser.parse_args())

	print('parsed args:', args)

	return args	

def get_input_file(_id, tmpdir):
	expdir = tmpdir + _id + '/'

	if not os.path.exists(expdir):
		os.makedirs(expdir)

	# response = http.request('GET', 'http://lab:5080/api/v1/experiments/' + _id)
	response = http.request('GET', 'http://localhost:5080/api/v1/experiments/' + _id)
	jsondata = json.loads(response.data.decode('utf-8'))
	files = jsondata['_files']
	input_file = ''

	numfiles = 0;
	for file in files:
		# time.sleep(5) # do we need this?
		# response = http.request('GET', 'http://lab:5080/api/v1/files/' + file['_id'])
		response = http.request('GET', 'http://localhost:5080/api/v1/files/' + file['_id'])
		input_file = expdir + file['filename']
		with open(input_file, 'w') as f:
			f.write(response.data.decode('utf-8'))
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
		'int': int_or_none, # change this later
		'float': float,
		'string': str_or_none, # change this later
		'bool': bool_type,
		'enum': enum_type # change this later
		# float between 1 and 0
		# enum type
	}

	return known_types[type]