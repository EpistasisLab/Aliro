from sklearn.linear_model import LogisticRegression

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/LogisticRegression/LogisticRegression.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/LogisticRegression/LogisticRegression.json'
basedir = '/share/devel/Gp/learn/LogisticRegression/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/LogisticRegression/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = LogisticRegression(penalty=args['penalty'], C=args['C'], dual=args['dual'])
	generate_results(model, input_file, tmpdir, args['_id'])