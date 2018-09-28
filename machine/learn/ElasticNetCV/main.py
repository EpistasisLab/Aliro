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
from skl_utils import generate_results

exp = Experiment('ElasticNetCV')
def main(args, input_data, tmpdir=exp.tmpdir):
    model = ElasticNetCV(l1_ratio=args['l1_ratio'], tol=args['tol'])
    generate_results(model, input_data, tmpdir, args['_id'], mode='regression')


if __name__ == "__main__":
    args, input_data = exp.get_input()
    main(args, input_data)
