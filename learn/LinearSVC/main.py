from sklearn.svm import LinearSVC

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/LinearSVC/LinearSVC.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/LinearSVC/LinearSVC.json'
basedir = '/share/devel/Gp/learn/LinearSVC/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/LinearSVC/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = LinearSVC(penalty=args['penalty'], loss=args['loss'], dual=args['dual'], tol=args['tol'], C=args['C'])
	generate_results(model, input_file, tmpdir, args['_id'])