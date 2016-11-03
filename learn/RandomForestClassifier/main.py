from sklearn.ensemble import RandomForestClassifier

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/RandomForestClassifier/RandomForestClassifier.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/RandomForestClassifier/RandomForestClassifier.json'
basedir = '/share/devel/Gp/learn/RandomForestClassifier/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/RandomForestClassifier/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = RandomForestClassifier(n_estimators=args['n_estimators'], criterion=args['criterion'], max_features=args['max_features'],
	min_samples_split=args['min_samples_split'], min_samples_leaf=args['min_samples_leaf'], bootstrap=args['bootstrap'])
	generate_results(model, input_file, tmpdir, args['_id'])