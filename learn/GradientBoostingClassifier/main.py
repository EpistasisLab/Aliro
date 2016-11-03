from sklearn.ensemble import GradientBoostingClassifier

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/GradientBoostingClassifier/GradientBoostingClassifier.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/GradientBoostingClassifier/GradientBoostingClassifier.json'
basedir = '/share/devel/Gp/learn/GradientBoostingClassifier/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/GradientBoostingClassifier/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = GradientBoostingClassifier(n_estimators=args['n_estimators'], learning_rate=args['learning_rate'], max_depth=args['max_depth'],
		min_samples_split=args['min_samples_split'], min_samples_leaf=args['min_samples_leaf'], subsample=args['subsample'], max_features=args['max_features'])
	generate_results(model, input_file, tmpdir, args['_id'])