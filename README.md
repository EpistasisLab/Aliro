[![Build Status](https://img.shields.io/travis/Kaixhin/FGLab.svg)](https://travis-ci.org/Kaixhin/FGLab)
[![Dependency Status](https://img.shields.io/david/kaixhin/fglab.svg)](https://david-dm.org/Kaixhin/FGLab)
[![devDependency Status](https://img.shields.io/david/dev/kaixhin/fglab.svg)](https://david-dm.org/Kaixhin/FGLab#info=devDependencies)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Docker Pulls](https://img.shields.io/docker/pulls/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)
[![Docker Stars](https://img.shields.io/docker/stars/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)

# ![FGLab](public/images/fglab-logo.png)

### **Quickstart: https://kaixhin.github.io/FGLab/**

FGLab is a machine learning dashboard, designed to make performing experiments easier. Experiment details and results are sent to a database, which allows analytics to be performed after their completion. The server is FGLab, and the clients are [FGMachines](https://github.com/Kaixhin/FGMachine).

## Contents

- [Installation](#installation)
- [Overview](#overview)
- [Examples](#examples)
- [API](#api)

## Installation

FGLab tries to follow the [SemVer](http://semver.org/) standard whenever possible. Releases can be found [here](https://github.com/Kaixhin/FGLab/releases). There are 3 ways to run FGLab: Installing [locally](#option-1-local), via [Docker](#option-2-docker), or hosted on [Heroku](#option-3-heroku).

### Option 1: Local

1. Install [Node.js](https://nodejs.org/) from the website or your package manager.
1. Install [MongoDB](https://www.mongodb.org/) from the website or your package manager.
1. Make a database directory for MongoDB. For example, `mkdir -p <working directory>/db`.
1. Run the MongoDB daemon. From the previous example, run `mongod --dbpath <working directory>/db`.
1. Either clone this repository or download and extract a [zip](https://github.com/Kaixhin/FGLab/zipball/master)/[tar](https://github.com/Kaixhin/FGLab/tarball/master).
1. Move inside the FGLab folder.
1. Run `npm install`. `npm install` also runs `bower install` to install additional required packages.
1. FGLab requires a `.env` file in this directory. For most installations, it should be possible to copy [example.env](example.env) to `.env`, but it may require customisation for non-standard MongoDB ports, or setting a different port for FGLab. An alternative is to set the following environment variables:
  - MONGODB_URI (MongoDB database URI)
  - FGLAB_PORT (port)

Run `node lab` (or `npm start`) to start FGLab. You can now access the user interface from a browser on the current machine at `http://localhost:<FGLAB_PORT>`, where `<FGLAB_PORT>` is 5080 by default. Please read the [overview](#overview) to understand how FGLab and FGMachine cooperate - both are needed in order to run experiments. Afterwards, you should set up instances of [FGMachine](https://github.com/Kaixhin/FGMachine).

To update, run `npm run update`.

### Option 2: Docker

Start a [MongoDB container](https://hub.docker.com/_/mongo/) and link it to the [FGLab container](https://hub.docker.com/r/kaixhin/fglab/):

```sh
sudo docker run -d --name mongodb mongo
sudo docker run -d --name fglab --link mongodb:mongo -p 5080:5080 kaixhin/fglab
```

### Option 3: Heroku

The deploy button provisions a free dyno running FGLab on [Heroku](https://www.heroku.com), with a free 500MB MongoDB database from [MongoLab](https://mongolab.com/).

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Overview

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

See [mnist.json](test/mnist.json) as an example schema for a project. Each schema should be uploaded with the filename corresponding to the desired name for the project e.g. `mnist.json`.

Often it is hard to specify some options in advance e.g. the type or structure of the machine learning model. Sometimes code may change, which would influence the results. The `string` type can be used to address changing options and versioning manually e.g. `cnn.v2`.

This is stored by FGLab, and is used to construct a form which lets one choose options and submit an experiment to an available machine. The options are sent to your machine learning program via the FGMachine client. Your machine learning program then accepts the different fields via command-line options, the details of which are in the [FGMachine documentation](https://github.com/Kaixhin/FGMachine#projects). **Note that the `_id` field is reserved, as this will store the experiment ID as a `string`**.

FGMachine will spawn your machine learning program, which should produce output files to be sent from FGMachine to FGLab. The details of this is available in the [FGMachine documentation](https://github.com/Kaixhin/FGMachine#projects).

Grid and random search optimisers have also been implemented in FGLab, to allow searching over a range of hyperparameter space. Multiple string values are delimited by commas (`,`).

### Experiments

An experiment is one complete training and testing run with a specific set of options. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of options will still be assigned unique IDs. Experiments have a unique ID, in addition to a project ID, a machine ID, the chosen options, the current status (running/success/fail), timestamps, results, and custom data; this provides a comprehensive record of the experiment as a whole.

The experiment page contains a "Logs" window, which uses WebSockets to display the experiment's `stdout` and `stderr` live. There is also an editable "Notes" text box that is automatically saved (at an interval of 0.5s), displaying on both the experiment page itself and the table of experiment results.

The current format for results is documented with [FGMachine](https://github.com/Kaixhin/FGMachine#experiments).

### Machines

A [FGMachine client](https://github.com/Kaixhin/FGMachine) registers itself with FGLab, providing hardware details as well as an address for interaction between FGLab and the machine. A machine (FGMachine) stores its own details, as well as a list of supported projects. Before a new experiment is chosen to be run, FGLab queries all machines in order to determine a machine with the capacity to run the experiment.

Note that machines are implementation-independent, and may well store their own (large) data on experiments, for example learnt parameters and logs. As mentioned before, these can be uploaded to FGLab's database.

## Examples

Examples utilising the range of abilities of FGLab/FGMachine can be found in the [examples folder](examples).

## API

The API is largely undocumented due to ongoing development introducing breaking changes. Ongoing documentation is available in [RAML](http://raml.org/): [api.raml](api.raml). The following are noted for convenience:

**Submit a new experiment with a set of options**
```
POST /api/v1/projects/{projectId}/experiment

e.g. curl -X POST -H "Content-Type: application/json" -d '{projectOptions}' http://{FGLab address}/api/v1/projects/{projectId}/experiment
```

If the project does not exist, returns `400 {"error": "Project ID <projectId> does not exist"}`. If the `projectOptions` are invalid, returns `400 {"error": "<validation message>"}`. If no machines are available to run the job, returns `501 {"error": "No machine capacity available"}`. If the machine fails to run the experiment for some reason, returns `500 {"error": "Experiment failed to run"}`. If successful, returns `201 {"_id": "<experimentId>"}`.

**Start a batch job with a list of option sets**
```
POST /api/v1/projects/{projectId}/batch?retry={retryTimeout (optional)}

e.g. curl -X POST -H "Content-Type: application/json" -d '[{projectOptions}]' http://{FGLab address}/api/v1/projects/{projectId}/batch?retry={retryTimeout (optional)}
```

The optional `retry` parameter specifies the maximum time in seconds to wait before trying to run a queued job again after capacity has been reached (the interval is randomly picked from a uniform distribution). If the project does not exist, returns `400 {"error": "Project ID <projectId> does not exist"}`. If any of the `projectOptions` are invalid, returns `400 {"error": "<validation message>"}` for the first set of options that are wrong. If successful, returns `201 {"status": "Started"}`. Future work aims to create a proper "optimiser" object that can be queried and have its work queue adjusted appropriately (hence differentiating it from a simple batch job queue).

**Register a webhook for an event**
```
POST /api/v1/webhooks

e.g. curl -X POST -H "Content-Type: application/json" -d '{webhookOptions}' http://{FGLab address}/api/v1/webhooks
```

`webhookOptions` expects the following options

```json
{
  "url": "<URL to POST to>",
  "objects": "<object collection to listen to (currently only 'experiments')>",
  "object_id": "<object ID>",
  "event": "<event to listen to (currently only 'started' or 'finished')>"
}
```

If a valid URL is not provided, returns `400 {"error": "Invalid or empty URL"}`. If a valid object collection is not provided, returns `400 {"error": "Object is not 'experiments'"}`. If a valid event is not provided, returns `400 {"error": "Event is not 'started' or 'finished'"}`. If an object ID is not provided, returns `400 {"error": "No object ID provided"}`. If successful, returns `201 {"status": "Registered", "options": <webhookOptions>"}`. When the event occurs, the JSON data used to register the webhook is returned.
