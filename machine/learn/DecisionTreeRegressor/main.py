from sklearn.tree import DecisionTreeRegressor
# run without X
import matplotlib as mpl
mpl.use('Agg')

# will eventually do this in the correct way -- install a library/package
import os
import sys
parentPath = os.path.abspath("..")
if parentPath not in sys.path:
    sys.path.insert(0, parentPath)

from io_utils import Experiment
from skl_utils import generate_results

if __name__ == "__main__":
    exp = Experiment('DecisionTreeRegressor')
    args, input_file = exp.get_input()
    model = DecisionTreeRegressor(max_depth=args['max_depth'], min_samples_split=args['min_samples_split'],
                                  min_samples_leaf=args['min_samples_leaf'])
    generate_results(model, input_file, exp.tmpdir, args['_id'], mode='regression')
