[![Build Status](https://img.shields.io/travis/Kaixhin/FGLab.svg)](https://travis-ci.org/Kaixhin/FGLab)
[![Dependency Status](https://img.shields.io/david/kaixhin/fglab.svg)](https://david-dm.org/Kaixhin/FGLab)
[![devDependency Status](https://img.shields.io/david/dev/kaixhin/fglab.svg)](https://david-dm.org/Kaixhin/FGLab#info=devDependencies)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Kaixhin/FGLab/blob/master/LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)
[![Docker Stars](https://img.shields.io/docker/stars/kaixhin/fglab.svg)](https://hub.docker.com/r/kaixhin/fglab/)

# FGLab

FGLab is a machine learning dashboard, designed to facilitate performing experiments. Experiment details and results are sent to a database, which allows analytics to be performed after their completion.

The machine client is [FGMachine](https://github.com/Kaixhin/FGMachine).

Some screenshots can be found on the [project website](http://kaixhin.github.io/FGLab/).

## Installation

FGLab tries to follow the [SemVer](http://semver.org/) standard whenever possible. Releases can be found [here](https://github.com/Kaixhin/FGLab/releases). There are 3 ways to run FGLab: Installing [locally](https://github.com/Kaixhin/FGLab#local), via [Docker](https://github.com/Kaixhin/FGLab#docker), or hosted on [Heroku](https://github.com/Kaixhin/FGLab#heroku).

### Local

1. Install [Node.js](https://nodejs.org/) from the website or your package manager.
1. Install [MongoDB](https://www.mongodb.org/) from the website or your package manager.
1. Make sure that the MongoDB daemon is running (`mongod`). For example, run `mongod --dbpath <database path>`, where `<database path>` must exist.
1. Either clone this repository or download and extract a [zip](https://github.com/Kaixhin/FGLab/zipball/master)/[tar](https://github.com/Kaixhin/FGLab/tarball/master).
1. Move inside the FGLab folder.
1. Run `npm install`. `npm install` also runs `bower install` to install additional required packages.
1. FGLab requires a `.env` file in this directory. For most installations, it should be possible to copy [example.env](https://github.com/Kaixhin/FGLab/blob/master/example.env) to `.env`, but it may require customisation for non-standard MongoDB ports, or setting a different port for FGLab. An alternative is to set the following environment variables:
  - MONGODB_URI (MongoDB database URI)
  - FGLAB_PORT (port)

Run `node index.js` to start FGLab. You can now access the user interface from a browser on the current machine at `http://localhost:<FGLAB_PORT>`, where `<FGLAB_PORT>` is 5080 by default. Please read the rest of the documentation to get an overview of FGLab and FGMachine - both are needed in order to run experiments. Afterwards, you should set up instances of [FGMachine](https://github.com/Kaixhin/FGMachine).

To update, use `git pull` to update the repository and run `npm install` to update any changed dependencies.

### Docker

Start a [MongoDB container](https://hub.docker.com/_/mongo/) and link it to the [FGLab container](https://hub.docker.com/r/kaixhin/fglab/):

```sh
sudo docker run -d --name mongodb mongo --storageEngine wiredTiger
sudo docker run -d --name fglab --link mongodb:mongo -p 5080:5080 kaixhin/fglab
```

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

This is stored by FGLab, and is used to construct a form which lets one choose options and submit an experiment to an available machine. The options are sent to your machine learning program via the FGMachine client. Your machine learning program then accepts the different fields via command-line options, the details of which are in the [FGMachine documentation](https://github.com/Kaixhin/FGMachine#projects). **Note that the `_id` field is reserved, as this will store the experiment ID as a `string`**.

FGMachine will spawn your machine learning program, which should produce output files to be sent from FGMachine to FGLab. The details of this is available in the [FGMachine documentation](https://github.com/Kaixhin/FGMachine#projects).

Grid and random search optimisers have also been implemented in FGLab, to allow searching over a range of hyperparameter space. Multiple string values are delimited by commas (`,`).

### Experiments

An experiment is one complete training and testing run with a specific set of options. Depending on the experiment it may be impossible to control for every source of randomness, so experiments with the same set of options will still be assigned unique IDs. Experiments have a unique ID, in addition to a project ID, a machine ID, the chosen options, the current status (running/success/fail), timestamps, results, and custom data; this provides a comprehensive record of the experiment as a whole.

The current format for results is documented with [FGMachine](https://github.com/Kaixhin/FGMachine).

### Machines

A [FGMachine client](https://github.com/Kaixhin/FGMachine) registers itself with FGLab, providing hardware details as well as an address for interaction between FGLab and the machine. A machine (FGMachine) stores its own details, as well as a list of supported projects. Before a new experiment is chosen to be run, FGLab queries all machines in order to determine a machine with the capacity to run the experiment.

Note that machines are implementation-independent, and may well store their own (large) data on experiments, for example learnt parameters and logs. As mentioned before, these can be uploaded to FGLab's database.

## FGLab API

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

**Register a webhook for an event**
```
POST /api/webhooks/register

e.g. curl -X POST -H "Content-Type: application/json" -d '{webhook options}' http://{FGLab address}/api/webhooks/register
```

The webhook options expects the following options

```json
{
  "url": "<URL to POST to>",
  "objects": "<object collection to listen to (currently only 'experiments')>",
  "id": "<object ID>",
  "event": "<event to listen to (currently only 'started' or 'finished')>"
}
```

If a valid URL is not provided, returns `400 {"error": "Invalid or empty URL"}`. If a valid object collection is not provided, returns `400 {"error": "Object is not 'experiments'"}`. If a valid event is not provided, returns `400 {"error": "Event is not 'started' or 'finished'"}`. If an object ID is not provided, returns `400 {"error": "No object ID provided"}`. If successful, returns `201 {"status": "Webhook registered: <webhook options>"}`. When the event occurs, the JSON data used to register the webhook is returned.
