# FGLab

[![Build Status](https://travis-ci.org/Kaixhin/FGLab.svg?branch=master)](https://travis-ci.org/Kaixhin/FGLab)

FGLab is a machine learning dashboard, designed to facilitate performing experiments. Experiment details and results are sent to a database, which allows analytics to be performed after their completion.

The machine client is [FGMachine](https://github.com/Kaixhin/FGMachine).

## Installation

### Local

1. Install [Node.js](https://nodejs.org/).
1. Install [MongoDB](https://www.mongodb.org/).
1. Make sure that the MongoDB daemon is running (`mongod`).
1. Clone this repository.
1. Move inside and run `npm install`.
1. Export the following environment variables or create `.env` with the following format:

```
MONGOLAB_URI=<MongoDB database URI>
PORT=<port>
```

Run `node index.js` to start FGLab.

### Docker

Start a MongoDB container and link it to the FGLab container:

```
sudo docker run --name mongodb -d mongo --storageEngine wiredTiger
sudo docker run --name fglab --link mongodb:mongo -dP kaixhin/fglab
```

The FGLab client port can be retrieved by running `sudo docker port fglab`.

### Heroku

The deploy button provisions a free dyno running FGLab on [Heroku](https://www.heroku.com), with a free 500MB MongoDB database from [MongoLab](https://mongolab.com/).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Objects

FGLab is based on several classes of object. One begins with a *project*, which involves adjusting variables to achieve the desired results. In machine learning, these variables are *hyperparameters*, which are set for the project. A project will then comprise of a set of *experiments* derived from adjusting hyperparameters.

### Project

A project is created by uploading a [JSON](http://json.org/) schema. JSON is a human-readable data-interchange format that is widely used and has mature libraries available for most programming languages.

The JSON schema represents a map/associative array (without nesting), where the values are an object comprising of several fields:

- **type**: One out of "int"/"float"/"bool"/"string"/"enum".
- **default**: Default value.
- **values (only with type: enum)**: An array of strings comprising the enum.

The following is an example schema for a project, and should be uploaded with the filename corresponding to the desired name for the project i.e. `mnist.json`:

```json
{
  "seed": {
    "type": "int",
    "default": 123
  },
  "batchSize": {
    "type": "int",
    "default": 8
  },
  "maxEpochs": {
    "type": "int",
    "default": 100
  },
  "optimiser": {
    "type": "enum",
    "default": "ADAGRAD",
    "values": ["SGD", "RMSPROP", "ADAGRAD"]
  },
  "learningRate": {
    "type": "float",
    "default": 0.0001
  },
  "L2": {
    "type": "bool",
    "default": true
  }
}
```

This is stored by FGLab, and is used to construct a form which lets one choose hyperparameters and submit an experiment to an available machine. The hyperparameters are sent to your machine learning program via the FGMachine client. Your machine learning program then uses its native JSON library to deserialize the hyperparameters from a JSON string. **Note that the "id" field is reserved, as this will store the experiment ID as a string**.

The machine learning program may log to stdout, so results must be stored as JSON files in a folder that is watched by FGLab and sent to FGMachine as JSON data is added. Details can be found in the [FGMachine documentation](https://github.com/Kaixhin/FGMachine).

**TODO:** Live logging from stdout.

### Experiments

An experiment is one complete training and testing run with a specific set of hyperparameters. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of hyperparameters will still be assigned unique IDs. Experiments contain results (discussed below), an ID, a project ID, a machine ID, the chosen hyperparameters and the current status (running/succeeded/failed); this provides a comprehensive record of the experiment as a whole.

The current format for results, where the "freq" fields represent the number of iterations between logging losses, is:

```json
{
  "train": {
    "losses": "float[]",
    "freq": "int",
  },
  "val": {
    "losses": "float[]",
    "freq": "int"
  },
  "test": {
    "loss": "float",
    "score": "float"
  }
}
```

Each field can be updated separately on FGLab by writing a new file e.g. creating a new file `results23.json` with `{"test": {"loss": 0.962871, "score": 85}}` will update the `test` field for the experiment. Nested fields cannot be updated separately e.g. `test.score`.

### Machine

A [machine](https://github.com/Kaixhin/FGMachine) registers itself with FGLab, providing hardware details as well as an address for interaction between FGLab and the machine. A machine stores its own details, as well as a list of supported projects. Before a new experiment is chosen to be run, FGLab queries all machines in order to determine a machine with the capacity to run the experiment.

Note that machines are implementation-independent, and may well store their own (large) data on experiments, for example learnt parameters and logs.

## API

The following endpoints allow programmatic access to projects, experiments and machines. HTTP GETs return their results as JSON.

| URL               | HTTP Verb | Body | Result                 |
|-------------------|-----------|------|------------------------|
| /api/:objects     | GET       |      | Returns all entries    |
| /api/:objects     | POST      | JSON | Creates new entry      |
| /api/:objects/:id | GET       |      | Returns single entry   |
| /api/:objects/:id | PUT       | JSON | Updates existing entry |
| /api/:objects/:id | DELETE    |      | Deletes existing entry |

## Future Work

- Using WebSockets to enable live querying of experiment logs.
- Due to variability in the objects, future work should focus on creating adapters i.e. a model adapter that can parse a JSON object specifying details of a neural network.
- Other work would involve specifying what machines store, and how to access this via FGLab.
