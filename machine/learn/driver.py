import matplotlib as mpl
mpl.use('Agg')
from io_utils import Experiment, parse_args
from skl_utils import generate_results

def main(args):
    exp = Experiment(args)
    tmpdir=exp.tmpdir
    input_data = exp.get_input()
    model, method_type = exp.get_model()
    generate_results(model, input_data, tmpdir, args['_id'], mode=method_type)

if __name__ == "__main__":
    args = parse_args()
    print('parsed args:', args)
    main(args)
