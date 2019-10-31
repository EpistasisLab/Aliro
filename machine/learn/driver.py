from io_utils import Experiment, parse_args
from skl_utils import generate_results


def main(args, param_grid={}):
    """Main Driver for PennAI experiment.
    Parameters
    ----------
    args: dict
        arguments for PennAI experiment
    param_grid: dict
        If grid_search is non-empty dictionary, then the experiment will
        do parameter tuning via GridSearchCV. It should report best result to UI
        and save all results to knowlegde base.
    timeout: int
        maximum seconds for running the experiment

    Returns
    -------
    None

    """
    exp = Experiment(args)
    input_data, data_info = exp.get_input()
    model, method_type, encoding_strategy = exp.get_model()
    if not args['grid_search']:
        param_grid = {}
    if method_type != data_info["prediction_type"]:
        raise RuntimeError(
            "Experiment failed! "
            "Dataset type is {} "
            "but method type is {}".format(
                data_info["prediction_type"],
                method_type))
    generate_results(model=model,
                     input_data=input_data,
                     tmpdir=exp.tmpdir,
                     target_name=data_info['target_name'],
                     _id=args['_id'],
                     mode=method_type,
                     filename=data_info['filename'],
                     categories=data_info['categories'],
                     ordinals=data_info['ordinals'],
                     encoding_strategy=encoding_strategy,
                     param_grid=param_grid
                     )


if __name__ == "__main__":
    args, param_grid = parse_args()
    main(args, param_grid)
