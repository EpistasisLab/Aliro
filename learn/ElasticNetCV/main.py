from sklearn.linear_model import ElasticNetCV
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
from skl_utils import generate_results_regressor

if __name__ == "__main__":
    exp = Experiment('ElasticNetCV')
    args, input_file = exp.get_input()
    model = ElasticNetCV(l1_ratio=args['l1_ratio'], tol=args['tol'])
    generate_results_regressor(model, input_file, exp.tmpdir, args['_id'])
