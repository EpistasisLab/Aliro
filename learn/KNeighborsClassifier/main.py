from sklearn.neighbors import KNeighborsClassifier

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import get_input
from skl_utils import generate_results

schema = '/share/devel/Gp/lab/examples/KNeighborsClassifier/KNeighborsClassifier.json'
#schema = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/lab/examples/KNeighborsClassifier/KNeighborsClassifier.json'
basedir = '/share/devel/Gp/learn/KNeighborsClassifier/'
#basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/KNeighborsClassifier/'
tmpdir = basedir + 'tmp/'

if __name__ == "__main__":
	args, input_file = get_input(schema, tmpdir)
	model = KNeighborsClassifier(n_neighbors=args['n_neighbors'], weights=args['weights'], p=args['p'])
	generate_results(model, input_file, tmpdir, args['_id'])