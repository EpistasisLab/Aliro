[![Build Status](https://img.shields.io/travis/Kaixhin/FGMachine.svg)](https://travis-ci.org/Kaixhin/FGMachine)
[![Dependency Status](https://img.shields.io/david/kaixhin/fgmachine.svg)](https://david-dm.org/Kaixhin/FGMachine)
[![devDependency Status](https://img.shields.io/david/dev/kaixhin/fgmachine.svg)](https://david-dm.org/Kaixhin/FGMachine#info=devDependencies)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Kaixhin/FGMachine/blob/master/LICENSE)
[![Docker Pulls](https://img.shields.io/docker/pulls/kaixhin/fgmachine.svg)](https://hub.docker.com/r/kaixhin/fgmachine/)
[![Docker Stars](https://img.shields.io/docker/stars/kaixhin/fgmachine.svg)](https://hub.docker.com/r/kaixhin/fgmachine/)

# [FGMachine](http://kaixhin.github.io/FGLab/)

FGLab is a machine learning dashboard, designed to facilitate performing experiments. Experiment details and results are sent to a database, which allows analytics to be performed after their completion. The server is [FGLab](https://github.com/Kaixhin/FGLab), and the clients are FGMachines.

## Contents

- [Installation](https://github.com/Kaixhin/FGMachine#installation)
- [Overview](https://github.com/Kaixhin/FGMachine#overview)
- [Examples](https://github.com/Kaixhin/FGMachine#examples)

## Installation

FGMachine tries to follow the [SemVer](http://semver.org/) standard whenever possible. Releases can be found [here](https://github.com/Kaixhin/FGMachine/releases).

### Option 1: Local

1. Install [Node.js](https://nodejs.org/) from the website or your package manager.
1. Either clone this repository or download and extract a [zip](https://github.com/Kaixhin/FGMachine/zipball/master)/[tar](https://github.com/Kaixhin/FGMachine/tarball/master).
1. Move inside the FGMachine folder.
1. Run `npm install`.
1. Create `projects.json` ([projects.example.json](https://github.com/Kaixhin/FGMachine/blob/master/projects.example.json) can be used as a starting point).
1. FGMachine requires a `.env` file in this directory. For most installations, it should be possible to copy [example.env](https://github.com/Kaixhin/FGMachine/blob/master/example.env) to `.env`, but it may require customisation for non-standard FGLab or FGMachine ports. An alternative is to set the following environment variables:
  - FGLAB_URL (FGLab URL, including port if necessary)
  - FGMACHINE_URL (FGMachine URL, including port)

Run `node machine.js` (or `npm start`) to start FGMachine. On the first run it will create `specs.json` and register itself with FGLab. Please read the [overview](https://github.com/Kaixhin/FGMachine#overview) to understand how FGMachine can interface with your machine learning code.

To re-register, delete `specs.json` before running FGMachine again.

To update, use `git pull` to update the repository and run `npm install` to update any changed dependencies.

### Option 2: Docker

Start a [FGLab container](https://hub.docker.com/r/kaixhin/fglab/) and link it to the [FGMachine container](https://hub.docker.com/r/kaixhin/fgmachine/):

```sh
sudo docker run -d --name fgmachine -v /var/run/docker.sock:/var/run/docker.sock -v $(which docker):$(which docker) -e FGLAB_URL=<FGLab URL> -e FGMACHINE_URL=<FGMachine URL> -p 5081:5081 kaixhin/fgmachine
```

The `FGLab URL` will be the address of the host running FGLab, including port 5080. The `FGMachine URL` will be the address of the current host (as accessible by FGLab), including port 5081. Docker and its socket are passed to allow FGMachine to launch Docker containers itself.

## Overview

### Projects

After a project has been created on FGLab, a corresponding *project implementation* must be specified in `projects.json`. If this machine is available to run experiments for the project created on FGLab, then add the following field to `projects.json`. Note that `<project_id>` links the created project on FGLab and FGMachine's project implemetations in `projects.json`.

```json
"<project_id>": {
  "cwd": "<working directory>",
  "command": "<program>",
  "args": "<first command line options (e.g. for a file)>",
  "options": "<command line options style for options>",
  "capacity": "<machine capacity needed (as a fraction)>",
  "results": "<results directory (without experiment ID)>"
}
```

`options` processes the options in 4 different ways. For option settings: `{seed: 123, model: "cnn.v2", L2: true}`, exemplar methods would be as such:

| `options`   | Program | Command Line                                                                    |
|-------------|---------|---------------------------------------------------------------------------------|
| plain       | node    | node [args] seed 123 model cnn.v2 L2 true                                       |
| single-dash | th      | th [args] -seed 123 -model cnn.v2 -L2 true                                      |
| double-dash | caffe   | caffe [args] --seed=123 --model=cnn.v2 --L2=true                                |
| function    | matlab  | matlab [args w/o final arg] [final arg]\('seed',123,'model','cnn.v2','L2',true) |

FGMachine automatically reloads the `projects.json` file when it is changed.

### Experiments

Results and custom data must be saved as files into a subfolder in the specified results directory, where the name of the subfolder is the experiment ID, e.g. `/data/mnist/55e069f9cf4e1fe075b76b95`. For an example that uses the following features, see [rand.js](https://github.com/Kaixhin/FGMachine/blob/master/test/rand.js). 

Non-JSON files are uploaded to MongoDB [GridFS](http://docs.mongodb.org/manual/core/gridfs/) via FGLab, which allows them to be downloaded later in their native format. Images and videos are automatically displayed on the experiment page, allowing plots to be created by the machine learning code. JSON files are automatically parsed, with fields being added to the experiment object. An example, `notes.json`, may look like this:

```json
{
  "Framework": {
    "Name": "Theano",
    "Version Number": 0.7
  },
  "Notes": "Best parameters saved at epoch 55"
}
```

Multiple top-level fields can exist in the same file, but nested fields cannot be updated separately e.g. `Framework.Name`. **Note that fields preceded with `_` are reserved for processing by FGLab**. Currently supported fields are listed below:

#### _scores

The `_scores` field is a map that can be used to store multiple floats that represent the performance of the model. For example:

```json
{
  "_scores": {
    "F1": "float",
    "BLEU": "float",
    "METEOR": "float"
  }
}
```

#### _charts

The `_charts` field is a either an object or array of objects that can be used to store data that will be charted on FGLab using [C3.js](http://c3js.org/), and hence mimics its [API](http://c3js.org/examples.html). Given that FGLab renders uploaded images, this is to allow the interactivity afforded by C3.js. This means that it is possible to create different chart types and adjust plotting options, with a minor change in the API so that numeric arrays can be directly exported. Rather than prepending arrays in the `columns` array with the column names, the `columnNames` array is used to perform this on FGLab.

Charts with lots of values are downsampled for performance reasons, using the [Largest-Triangle-Three-Buckets algorithm](http://hdl.handle.net/1946/15343) for visualisation purposes. By default the following options are added to disable points and enable zoom, but these can be overriden:

```json
{
  "point": {"show": false},
  "zoom": {"enabled": true}
}
```

An example [Multiple XY Line Chart](http://c3js.org/samples/simple_xy_multiple.html) would be structured as such:

```json
{
  "_charts": {
    "columnNames": [
      "train",
      "val",
      "x1",
      "x2"
    ],
    "data": {
      "xs": {
        "train": "x1",
        "val": "x2"
      },
      "columns": [
        [1.0, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1, 0.0],
        [1.0, 0.9, 0.6, 0.4, 0.3],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        [2, 6, 8, 9, 11]
      ]
    },
    "axis": {
      "x": {
        "label": {
          "text": "Iterations"
        }
      },
      "y": {
        "label": {
          "text": "Losses"
        }
      }
    }
  }
}
```

The usage of `_charts` has an inherent tradeoff between storing numerical results in a more intuitive place in the experiment object and easily visualising data. The recommendation is to use `_charts` for visualising data where desired (which may not be necessary if plots are generated by the machine learning code), and extract the data given the `_charts`' structure. However, it is still possible to duplicate the numerical results in a separate array under a custom field in a JSON file.

## Examples

Examples utilising the range of abilities of FGLab/FGMachine can be found in the [examples folder](https://github.com/Kaixhin/FGMachine/tree/master/examples).
