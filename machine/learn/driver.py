from io_utils import Experiment, parse_args
from skl_utils import generate_results

def main(args):
    exp = Experiment(args)
    input_data, filename, target_name = exp.get_input()
    model, method_type = exp.get_model()
    generate_results(model=model,
                    input_data=input_data,
                    tmpdir=exp.tmpdir,
                    target_name=target_name,
                    _id=args['_id'],
                    mode=method_type,
                    filename=filename
                    )

if __name__ == "__main__":
    args = parse_args()
    main(args)
