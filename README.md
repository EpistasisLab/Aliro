[![Build Status](https://img.shields.io/travis/Kaixhin/FGLab.svg)](https://travis-ci.org/Kaixhin/FGLab)
[![Dependency Status](https://img.shields.io/david/kaixhin/fglab.svg)](https://david-dm.org/Kaixhin/FGLab)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Kaixhin/FGLab/master/LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)
[![Docker Stars](https://img.shields.io/docker/stars/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)

# FGLab

FGLab is a machine learning dashboard, designed to facilitate performing experiments. Experiment details and results are sent to a database, which allows analytics to be performed after their completion.

The machine client is [FGMachine](https://github.com/Kaixhin/FGMachine).

## Installation

### Local

1. Install Node.js from the [website](https://nodejs.org/) or your package manager.
1. Install MongoDB from the [website](https://www.mongodb.org/) or your package manager.
1. Make sure that the MongoDB daemon is running (`mongod`).
1. Clone this repository and move inside.
1. Run `npm install`.
1. Set the following environment variables:
  - MONGODB_URI (MongoDB database URI)
  - PORT (port)

The final instruction can be performed by either exporting the variables to the environment or creating a `.env` file ([example.env](https://github.com/Kaixhin/FGLab/blob/master/example.env) can be used as a starting point).

Run `node index.js` to start FGLab.

To update, use `git pull` to update the repository and run `npm install` to update any changed dependencies.

### Docker

Start a [MongoDB container](https://hub.docker.com/_/mongo/) and link it to the [FGLab container](https://hub.docker.com/r/kaixhin/fglab/):

```sh
sudo docker run --name mongodb -d mongo --storageEngine wiredTiger
sudo docker run --name fglab --link mongodb:mongo -dP kaixhin/fglab
```

The FGLab client port can be retrieved by running `sudo docker port fglab`.

### Heroku

The deploy button provisions a free dyno running FGLab on [Heroku](https://www.heroku.com), with a free 500MB MongoDB database from [MongoLab](https://mongolab.com/).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Objects

FGLab is based on several classes of object. One begins with a *project*, which involves adjusting variables to achieve the desired results. In machine learning, these variables are *hyperparameters*, which are set for the project. A project will then comprise of a set of *experiments* derived from adjusting hyperparameters.

### Projects

A project is created by uploading a [JSON](http://json.org/) schema. JSON is a human-readable data-interchange format that is widely used and has mature libraries available for most programming languages.

The JSON schema represents a map/associative array (without nesting), where the values are an object comprising of several fields:

- **type**:
  - `int`
  - `float`
  - `bool`
  - `string`
  - `enum`
- **default**: Default value
- **values**: An array of strings comprising the `enum`

See [mnist.json](https://github.com/Kaixhin/FGLab/blob/master/tests/mnist.json) as an example schema for a project. Each schema should be uploaded with the filename corresponding to the desired name for the project e.g. `mnist.json`.

Often it is hard to specify some hyperparameters in advance e.g. the type or structure of the machine learning model. Sometimes code may change, which would influence the results. The `string` type can be used to address changing hyperparameters and versioning manually e.g. `cnn.v2`.

This is stored by FGLab, and is used to construct a form which lets one choose hyperparameters and submit an experiment to an available machine. The hyperparameters are sent to your machine learning program via the FGMachine client. Your machine learning program then uses its native JSON library to deserialize the hyperparameters from a JSON string. **Note that the `_id` field is reserved, as this will store the experiment ID as a `string`**.

The machine learning program may log to stdout, so results must be stored as JSON files in a folder that is watched by FGLab and sent to FGMachine as JSON data is added. Details can be found in the [FGMachine documentation](https://github.com/Kaixhin/FGMachine).

### Experiments

An experiment is one complete training and testing run with a specific set of hyperparameters. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of hyperparameters will still be assigned unique IDs. Experiments contain an ID, a project ID, a machine ID, the chosen hyperparameters, the current status (running/success/fail), timestamps, results, and custom data; this provides a comprehensive record of the experiment as a whole.

The current format for results is documented with [FGMachine](https://github.com/Kaixhin/FGMachine).

### Machines

A [machine](https://github.com/Kaixhin/FGMachine) registers itself with FGLab, providing hardware details as well as an address for interaction between FGLab and the machine. A machine stores its own details, as well as a list of supported projects. Before a new experiment is chosen to be run, FGLab queries all machines in order to determine a machine with the capacity to run the experiment.

Note that machines are implementation-independent, and may well store their own (large) data on experiments, for example learnt parameters and logs.

## API

The API is largely undocumented due to ongoing development introducing breaking changes. The following are noted for convenience:

```
POST /api/experiments/submit?project={project ID}

e.g. curl -X POST -H "Content-Type: application/json" -d '{project hyperparameters}' http://{FGLab address}/api/experiments/submit?project={project ID}
```

If the project does not exist, returns `400 {"error": "Project ID <project ID> does not exist"}`. If the hyperparameters, returns `400 {"error": "<validation message>"}`. If no machines are available to run the job, returns `501 {"error": "No machine capacity available"}`. If the machine fails to run the experiment for some reason, returns `501 {"error": "Experiment failed to run"}`. If successful, returns `200 {"_id": "<experiment ID>"}`.


## Future Work

- Add query params to collection GET to expand API.
- Convert form validation into a proper API (can be used to check schema defaults as well).
- Using WebSockets to enable live querying of experiment logs.
- Creating adapters i.e. a model adapter that can parse a JSON object specifying details of a neural network.
- Specifying what other data machines store, and how to access this via FGLab.
- Implement [random search for hyperparameter optimisation](http://www.jmlr.org/papers/v13/bergstra12a.html) on validation score.
- Test suite.
