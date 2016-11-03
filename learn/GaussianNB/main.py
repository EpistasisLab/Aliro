from sklearn.naive_bayes import GaussianNB

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/GaussianNB/GaussianNB.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/GaussianNB/GaussianNB.json'
basedir = '/share/devel/Gp/learn/GaussianNB/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/GaussianNB/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = GaussianNB()
	generate_results(model, input_file, tmpdir, args['_id'])