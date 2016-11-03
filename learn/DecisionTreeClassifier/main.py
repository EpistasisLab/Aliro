from sklearn.tree import DecisionTreeClassifier

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/DecisionTreeClassifier/DecisionTreeClassifier.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/DecisionTreeClassifier/DecisionTreeClassifier.json'
basedir = '/share/devel/Gp/learn/DecisionTreeClassifier/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/DecisionTreeClassifier/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = DecisionTreeClassifier(criterion=args['criterion'], max_depth=args['max_depth'], 
		min_samples_split=args['min_samples_split'], min_samples_leaf=args['min_samples_leaf'])
	generate_results(model, input_file, tmpdir, args['_id'])