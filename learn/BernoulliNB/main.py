from sklearn.naive_bayes import BernoulliNB

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/BernoulliNB/BernoulliNB.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/BernoulliNB/BernoulliNB.json'
basedir = '/share/devel/Gp/learn/BernoulliNB/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/BernoulliNB/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = BernoulliNB(alpha=args['alpha'], binarize=args['binarize'], fit_prior=args['fit_prior'])
	generate_results(model, input_file, tmpdir, args['_id'])