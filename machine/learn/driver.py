from io_utils import Experiment, parse_args
from skl_utils import generate_results
from os import environ

# if system environments has a time limit setting for each experiment
timeout = 300 # 5 mins by default
if 'EXP_TIMEOUT' in environ:
    timeout = int(environ['EXP_TIMEOUT'])*60

def main(args, param_grid={}, timeout=timeout):
    exp = Experiment(args)
    input_data, data_info = exp.get_input()
    model, method_type, encoding_strategy = exp.get_model()
    if not args['grid_search']:
        param_grid = {}
    return_val = generate_results(model=model,
                    input_data=input_data,
                    tmpdir=exp.tmpdir,
                    target_name=data_info['target_name'],
                    _id=args['_id'],
                    mode=method_type,
                    filename=data_info['filename'],
                    categories=data_info['categories'],
                    ordinals=data_info['ordinals'],
                    encoding_strategy=encoding_strategy,
                    param_grid=param_grid,
                    timeout=timeout
                    )
    if return_val == "Timeout":
        raise RuntimeError("Experiment failed due to time out!")


if __name__ == "__main__":
    args, param_grid = parse_args()
    main(args, param_grid)
