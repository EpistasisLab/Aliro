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

A project is created by uploading a [Protocol Buffer](https://developers.google.com/protocol-buffers/) that defines a set of hyperparameters. Protocol buffers allow a structure to be defined for a protocol buffer *message*, which can both be read and written by a variety of languages, as well as be efficiently serialized. FGLab uses the [proto3](https://developers.google.com/protocol-buffers/docs/proto3) syntax. Each field has a name, type and unique numbered tag.

The following is an example message file for a project, and should be uploaded with the name corresponding to the top-level message i.e. `Mnist.proto`:

```protobuf
syntax = "proto3";

message Mnist {
  string id = 1; // Automatically assigned by FGLab
  int32 seed = 2;
  int32 batchSize = 3;
  int32 maxEpochs = 4;

  enum Method {
    SGD = 0;
    RMSPROP = 1;
    ADAGRAD = 3;
  }

  message Solver {
    Method method = 1;
    float learningRate = 2;
    float momentum = 3;
    bool L2 = 4;
  }

  Solver solver = 5;
}
```

This is stored by FGLab, and is used to construct a form which lets one choose hyperparameters and submit an experiment to an available machine. The serialized hyperparameters are sent to 
your machine learning program via the FGMachine client. Your machine learning program then uses the same `.proto` file to deserialize the hyperparameters. The following libraries can be used to compile `.proto` files for use within your code.

- [C++/Java/Python](https://github.com/google/protobuf)
- [MATLAB/Octave](https://github.com/elap/protobuf-matlab)
- [Lua](https://github.com/Sravan2j/lua-pb)
- [JavaScript](https://github.com/dcodeIO/ProtoBuf.js)

Once finished your machine learning code then returns the experiment results (serialized using `Results.proto`) to FGLab via FGMachine.

### Experiments

An experiment is one complete training and testing run with a specific set of hyperparameters. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of hyperparameters will still be assigned unique IDs.

The current schema of `Results.proto` is:

```protobuf
syntax = "proto3";

message Results {
  repeated double trainLosses = 1 [packed = true];
  int32 trainFreq = 2; // Number of iterations between logging training loss
  repeated double valLosses = 3 [packed = true];
  int32 valFreq = 4; // Number of iterations between logging validation loss
  double testLoss = 5;
  double testScore = 6; // For example, classification accuracy
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
