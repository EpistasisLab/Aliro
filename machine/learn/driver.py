import matplotlib as mpl
mpl.use('Agg')
from io_utils import Experiment, parse_args
from skl_utils import generate_results

def main(args, mode='classification'):
    exp = Experiment(args)
    tmpdir=exp.tmpdir
    input_data = exp.get_input()
    model, method_type = exp.get_model()
    generate_results(model, input_data, tmpdir, args['_id'], mode=mode)

if __name__ == "__main__":
    parse_args()
    args = vars(parser.parse_args())
    print('parsed args:', args)
    main(args, mode=method_type)
