from sklearn.linear_model import LogisticRegression
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
    exp = Experiment('LogisticRegression')
    args, input_data = exp.get_input()
    if args['dual'] == 'false':
        dual = False
    else:
        dual = True
    model = LogisticRegression(
        penalty=args['penalty'], C=args['C'], dual=dual, solver='saga')
    generate_results(model, input_data, exp.tmpdir, args['_id'])
