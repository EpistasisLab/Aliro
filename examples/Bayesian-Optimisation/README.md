# Bayesian Optimisation (FGMachine)

## Introduction

Bayesian optimisation is a global optimisation technique, which treats the function it must optimise as a random function. It places a prior on the function, and evaluates the function to collect data points. Each evaluation is used to update the posterior distribution over the function, which in turn is used to select the next point to evaluate. This allows Bayesian optimisation to be data-efficient, and hence it is a suitable technique for optimising hyperparameters of another system. This example will utilise the Spearmint library [1-5] in order to optimise the Branin-Hoo function.

## Requirements

- [MongoDB](https://www.mongodb.org/)
- [Spearmint](https://github.com/HIPS/Spearmint)
- [Flask](http://flask.pocoo.org/)
- [Requests](http://python-requests.org/)

## Instructions

This example has been adapted from the [noisy Branin-Hoo example](https://github.com/HIPS/Spearmint/tree/master/examples/noisy). `branin_noisy.py` has been set up to take command line arguments and save its results in a JSON file, whilst `fglab.py` acts as an intermediary between Spearmint and the function to optimise by using FGLab's API.

1. Set up [FGLab](https://github.com/Kaixhin/FGLab/blob/master/examples/Bayesian-Optimisation).
1. Insert the [project](https://github.com/Kaixhin/FGMachine/blob/master/examples/Bayesian-Optimisation/project.json) into FGMachine's `projects.json` file, using the project ID from FGLab.
1. Within `fglab.py`, replace `<Project ID>` with the same project ID, `<FGLab URL>` with the address of FGLab, and `<Spearmint helper URL>` with the address of `fglab.py`'s Flask server. By default, Flask uses port 5000.
1. Change into the Spearmint directory and start a MongoDB daemon, e.g. `mongod --fork --logpath mongodb.log --dbpath db`. The database folder (in this case `db`) must exist.
1. Run Spearmint with `python main.py <Path to Bayesian-Optimisation folder>`. Spearmint will continue to submit jobs to get results to fit to a Gaussian Process, which it uses to find the optimal solution.

## Citations

[1] Snoek, J., Larochelle, H., & Adams, R. P. (2012). Practical Bayesian optimization of machine learning algorithms. In *Advances in neural information processing systems* (pp. 2951-2959).

[2] Swersky, K., Snoek, J., & Adams, R. P. (2013). Multi-task bayesian optimization. In *Advances in Neural Information Processing Systems* (pp. 2004-2012).

[3] Snoek, J., Swersky, K., Zemel, R. S., & Adams, R. P. (2014). Input warping for Bayesian optimization of non-stationary functions. *arXiv preprint* arXiv:1402.0929.

[4] Snoek, J. (2013). *Bayesian Optimization and Semiparametric Models with Applications to Assistive Technology* (Doctoral dissertation, University of Toronto).

[5] Gelbart, M. A., Snoek, J., & Adams, R. P. (2014). Bayesian optimization with unknown constraints. *arXiv preprint* arXiv:1403.5607.
