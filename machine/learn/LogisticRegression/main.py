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

exp = Experiment('LogisticRegression')
def main(args, input_data, tmpdir=exp.tmpdir):
    model = LogisticRegression(
        penalty=args['penalty'], C=args['C'], dual=args['dual'])
    generate_results(model, input_data, tmpdir, args['_id'])

if __name__ == "__main__":
    args, input_data = exp.get_input()
    main(args, input_data)
