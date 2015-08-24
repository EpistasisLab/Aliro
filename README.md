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
1. Create `.env` with the following schema:

```
MONGOLAB_URI=<MongoDB database URI>
PORT=<port>
```

Run `node index.js` to start FGLab.

### Docker

**TODO** Image creation

### Heroku

The deploy button provisions a free dyno running FGLab on [Heroku](https://www.heroku.com), with a free 500MB MongoDB database from [MongoLab](https://mongolab.com/).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Objects

FGLab is based on several classes of object. One begins with a *project*, which involves adjusting variables to achieve the desired results. In machine learning, these variables are *hyperparameters*, which are set for the project. A project will then comprise of a set of *experiments* derived from adjusting hyperparameters.

### Project

A project is created by uploading a JSON schema, which abides by [MessagePack](http://msgpack.org/)'s [type system](https://github.com/msgpack/msgpack/blob/master/spec.md#types). JSON is a widely-used, human-readable data exchange format. MessagePack provides an efficient binary serialization format, with implementations for [many languages](http://msgpack.org).

The JSON schema represents a map/associative array (without nesting), where the values are an object comprising of several fields:

- **type**: One out of "int"/"float"/"bool"/"string"/"enum".
- **default**: Set a default value.
- **values** (only with type: enum): An array of strings comprising an enum.

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

This is stored by FGLab, and is used to construct a form which lets one choose hyperparameters and submit an experiment to an available machine. The MessagePack-serialized hyperparameters are sent to your machine learning program via the FGMachine client. Your machine learning program then uses its native MessagePack library to deserialize the hyperparameters.

Once finished your machine learning code then returns serialized experiment results to FGLab via FGMachine.

### Experiments

An experiment is one complete training and testing run with a specific set of hyperparameters. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of hyperparameters will still be assigned unique IDs.

The current "schema", where the "freq" fields represent the number of iterations between logging losses, is:

```json
{
  "trainLosses": ["float"],
  "trainFreq": "int",
  "valLosses": ["float"],
  "valFreq": "int",
  "testLoss": "float",
  "testScore": "float"
}
```

Serialised results should be sent to FGLab via FGMachine, where it will then be concatenated with the machine ID and the chosen hyperparameters; this provides a comprehensive record of the experiment as a whole.

**TODO** Graphing results and comparing results across experiments

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

Using WebSockets to enable live querying of experiment logs.

Due to variability in the objects, future work should focus on creating adapters i.e. a model adapter that can parse a JSON object specifying details of a neural network.

Other work would involve specifying what machines store, and how to access this via FGLab.
