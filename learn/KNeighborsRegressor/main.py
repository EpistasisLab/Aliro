from sklearn.neighbors import KNeighborsRegressor
#run without X
import matplotlib as mpl
mpl.use('Agg')

# will eventually do this in the correct way -- install a library/package
import os, sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import Experiment
from skl_utils import generate_results_regressor

if __name__ == "__main__":
	exp = Experiment('KNeighborsRegressor')
	args, input_file = exp.get_input()
	model = KNeighborsRegressor(n_neighbors=args['n_neighbors'], weights=args['weights'], p=args['p'])
	generate_results_regressor(model, input_file, exp.tmpdir, args['_id'])