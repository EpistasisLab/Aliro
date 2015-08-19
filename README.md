# FGLab

FGLab is a machine learning dashboard, designed to facilitate performing experiments. It uses RESTful endpoints to pass data to a (MongoDB) database, which allows analytics to be performed on experiments after their completion.

## Installation

### Normal

Requires [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.org/).

**TODO** Detailed instructions

### Docker Image

**TODO** Image creation

### Heroku Deploy

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Objects

FGLab is based on several classes of object. One begins with a *project*, which involves adjusting variables to achieve the desired results. In machine learning, these variables are *hyperparameters*, which are set for the project. A project will then comprise of a set of *experiments* derived from adjusting hyperparameters.

### Project

A project is created online and defines a (JSON) schema for hyperparameters. Any machine that is set up for a project must then register itself with the project, specifying its own network address. Thereby one can choose hyperparameters and start an experiment, dependent on machine availability. Machines implement an endpoint that returns their capacity, allowing for automatic load balancing of experiments.

Note that machines are completely implementation-independent, and may well store their own (large) data on experiments, for example learnt parameters and logs.

### Experiments

An experiment is one complete training and testing run of a specific machine learning *model* on a specific *dataset* with a specific set of hyperparameters. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of hyperparameters will still be assigned unique IDs.

The current schema is:

```
timestamp: Int (ms since epoch)
hyperparams:
  dataset: Dataset,
  model: Model,
  ...
train:
  losses: [Number]
  freq: Int (number of iterations between logging loss)
val:
  losses: [Number]
  freq: Int
test:
  loss: Number
  score: Number (e.g. classification accuracy)
```

### Datasets

A dataset is a special hyperparameter that refers to an actual object, uniquely defined by its name as a String.

The current schema is:

```
name: String
```

The current schema has room for expansion, e.g. including information on training, validation and test sets. Rather than including information on the dataset with every experiment, the dataset information can be adjusted separately.

### Models

A model is a special hyperparameter that refers to an actual object, uniquely defined by its name as a String.

The current schema is:

```
name: String
```

The current schema has room for expansion, but this is likely to be heavily dependent on the type of model involved. Rather than including information on the model with every experiment, the model information can be adjusted separately.

## API

### Workflow

#### FGLab

1. Create a project with hyperparameter schema online
1. Register each available machine with the project by performing a POST to /api/projects/:id/register
1. Start an experiment by choosing hyperparameters

#### Machine

1. Wait for experiment ID and hyperparameters from FGLab
1. Instantiate the dataset and attempt to create new dataset entry (overwrites any existing entry)
1. Instantiate the model and attempt to create new model entry (overwrites any existing entry)
1. Update the experiment with training and validation losses
1. Update the experiment with testing loss and score

### Endpoints

| URL               | HTTP Verb | Body | Result                 |
|-------------------|-----------|------|------------------------|
| /api/:objects     | GET       |      | Returns all entries    |
| /api/:objects     | POST      | JSON | Creates new entry      |
| /api/:objects/:id | GET       |      | Returns single entry   |
| /api/:objects/:id | PUT       | JSON | Updates existing entry |
| /api/:objects/:id | DELETE    |      | Deletes existing entry |

## Future Work

Due to variability in the objects, future work should focus on creating adapters i.e. a model adapter that can parse a JSON object specifying details of a neural network.

Other work would involve specifying what machines store, and how to access this via FGLab.
