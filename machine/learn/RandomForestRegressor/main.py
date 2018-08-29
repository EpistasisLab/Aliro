from sklearn.ensemble import RandomForestRegressor
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
    exp = Experiment('RandomForestRegressor')
    args, input_data = exp.get_input()
    model = RandomForestRegressor(n_estimators=args['n_estimators'], max_features=args['max_features'],
                                  min_samples_split=args['min_samples_split'], min_samples_leaf=args['min_samples_leaf'], bootstrap=args['bootstrap'])
    generate_results(model, input_data, exp.tmpdir, args['_id'], mode='regression')
