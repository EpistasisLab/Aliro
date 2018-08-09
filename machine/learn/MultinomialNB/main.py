from sklearn.naive_bayes import MultinomialNB
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
    exp = Experiment('MultinomialNB')
    args, input_data = exp.get_input()
    model = MultinomialNB(alpha=args['alpha'], fit_prior=args['fit_prior'])
    generate_results(model, input_data, exp.tmpdir, args['_id'])
