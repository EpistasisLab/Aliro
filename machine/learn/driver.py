from io_utils import Experiment, parse_args
from skl_utils import generate_results
from os import environ

# if system environments has a time limit setting for each experiment
timeout = 300 # 5 mins by default
if 'TIMEOUT' in environ:
    timeout = int(environ['TIMEOUT'])*60


def main(args, timeout=timeout):
    exp = Experiment(args)
    input_data, filename, target_name, categories, ordinals = exp.get_input()
    model, method_type = exp.get_model()
    return_val = generate_results(model=model,
                    input_data=input_data,
                    tmpdir=exp.tmpdir,
                    target_name=target_name,
                    _id=args['_id'],
                    mode=method_type,
                    filename=filename,
                    categories=categories,
                    ordinals=ordinals,
                    timeout=timeout
                    )
    if return_val == "Timeout":
        raise RuntimeError("Experiment failed due to time out!")


if __name__ == "__main__":
    args = parse_args()
    main(args)
