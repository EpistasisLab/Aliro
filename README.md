[![Build Status](https://img.shields.io/travis/Kaixhin/FGLab.svg)](https://travis-ci.org/Kaixhin/FGLab)
[![Dependency Status](https://img.shields.io/david/kaixhin/fglab.svg)](https://david-dm.org/Kaixhin/FGLab)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Kaixhin/FGLab/master/LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)
[![Docker Stars](https://img.shields.io/docker/stars/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)

# FGLab

FGLab is a machine learning dashboard, designed to facilitate performing experiments. Experiment details and results are sent to a database, which allows analytics to be performed after their completion.

The machine client is [FGMachine](https://github.com/Kaixhin/FGMachine).

Some screenshots can be found on the [project website](http://kaixhin.github.io/FGLab/).

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

FGLab is based on several classes of object. One begins with a *project*, which involves adjusting variables to achieve the desired results. In machine learning, these variables are *hyperparameters*, which are set for the project. In a more general setting, the variables are simply options, which may therefore include implementation-dependent details. A project will then comprise of a set of *experiments* derived from adjusting options.

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

See [mnist.json](https://github.com/Kaixhin/FGLab/blob/master/test/mnist.json) as an example schema for a project. Each schema should be uploaded with the filename corresponding to the desired name for the project e.g. `mnist.json`.

Often it is hard to specify some options in advance e.g. the type or structure of the machine learning model. Sometimes code may change, which would influence the results. The `string` type can be used to address changing options and versioning manually e.g. `cnn.v2`.

This is stored by FGLab, and is used to construct a form which lets one choose options and submit an experiment to an available machine. The options are sent to your machine learning program via the FGMachine client. Your machine learning program then uses its native JSON library to deserialize the options from a JSON string. **Note that the `_id` field is reserved, as this will store the experiment ID as a `string`**.

The machine learning program may log to stdout, so results must be stored as JSON files in a folder that is watched by FGLab and sent to FGMachine as JSON data is added. Details can be found in the [FGMachine documentation](https://github.com/Kaixhin/FGMachine).

Grid and random search optimisers have also been implemented, to allow searching over a range of hyperparameter space. Multiple string values are delimited by commas (`,`).

### Experiments

An experiment is one complete training and testing run with a specific set of options. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of options will still be assigned unique IDs. Experiments contain an ID, a project ID, a machine ID, the chosen options, the current status (running/success/fail), timestamps, results, and custom data; this provides a comprehensive record of the experiment as a whole.

The current format for results is documented with [FGMachine](https://github.com/Kaixhin/FGMachine).

### Machines

A [machine](https://github.com/Kaixhin/FGMachine) registers itself with FGLab, providing hardware details as well as an address for interaction between FGLab and the machine. A machine stores its own details, as well as a list of supported projects. Before a new experiment is chosen to be run, FGLab queries all machines in order to determine a machine with the capacity to run the experiment.

Note that machines are implementation-independent, and may well store their own (large) data on experiments, for example learnt parameters and logs.

## API

The API is largely undocumented due to ongoing development introducing breaking changes. The following are noted for convenience:

**Submit a new experiment with a set of options**
```
POST /api/experiments/submit?project={project ID}

e.g. curl -X POST -H "Content-Type: application/json" -d '{project options}' http://{FGLab address}/api/experiments/submit?project={project ID}
```

If the project does not exist, returns `400 {"error": "Project ID <project ID> does not exist"}`. If the options are invalid, returns `400 {"error": "<validation message>"}`. If no machines are available to run the job, returns `501 {"error": "No machine capacity available"}`. If the machine fails to run the experiment for some reason, returns `501 {"error": "Experiment failed to run"}`. If successful, returns `200 {"_id": "<experiment ID>"}`.

**Start a batch job with a list of option sets**
```
POST /api/projects/optimisation?project={project ID}&retry={(optional) retry timeout}

e.g. curl -X POST -H "Content-Type: application/json" -d '[{project options}]' http://{FGLab address}/api/projects/optimisation?project={project ID}
```

The optional `retry` parameter specifies the maximum time in seconds to wait before trying to run a queued job again after capacity has been reached (the interval is randomly picked from a uniform distribution). If the project does not exist, returns `400 {"error": "Project ID <project ID> does not exist"}`. If any of the options are invalid, returns `400 {"error": "<validation message>"}` for the first set of options that are wrong. If successful, returns `200 {"status": "Started"}`. Future work aims to create a proper "optimiser" object that can be queried and have its work queue adjusted appropriately (hence differentiating it from a simple batch job queue).
