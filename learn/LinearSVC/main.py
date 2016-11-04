from sklearn.svm import LinearSVC

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import Experiment
from skl_utils import generate_results

if __name__ == "__main__":
	exp = Experiment('LinearSVC')
	args, input_file = exp.get_input()
	model = LinearSVC(penalty=args['penalty'], loss=args['loss'], dual=args['dual'], tol=args['tol'], C=args['C'])
	generate_results(model, input_file, exp.tmpdir, args['_id'])