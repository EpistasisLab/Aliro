from sklearn.svm import SVC
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
exp = Experiment('SVC')
def main(args, input_data, tmpdir=exp.tmpdir):
    model = SVC(kernel=args['kernel'], tol=args['tol'], C=args['C'])
    generate_results(model, input_data, tmpdir, args['_id'])

if __name__ == "__main__":

    args, input_data = exp.get_input()
    main(args, input_data)
