[![Build Status](https://img.shields.io/travis/Kaixhin/FGMachine.svg)](https://travis-ci.org/Kaixhin/FGMachine)
[![Dependency Status](https://img.shields.io/david/kaixhin/fgmachine.svg)](https://david-dm.org/Kaixhin/FGMachine)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Kaixhin/FGMachine/master/LICENSE)

# FGMachine

The machine client for [FGLab](https://github.com/Kaixhin/FGLab).

FGMachine currently only reads GPU information on Linux.

## Installation

1. Install [Node.js](https://nodejs.org/).
1. Clone this repository.
1. Move inside and run `npm install`.
1. Create `projects.json`.
1. Set the following environment variables:
  - FGLAB_URL (FGLab URL)
  - FGMACHINE_URL (FGMachine URL, including port)

The final instruction can be performed by either exporting the variables to the environment or creating a `.env` file (`example.env` can be used as a starting point).

Run `node index.js` to start FGMachine. On the first run it will create `specs.json` and register itself with FGLab. `specs.json` follows the following format:

```json
{
  "_id": "String",
  "address": "String",
  "hostname": "String",
  "os": {
    "type": "String",
    "platform": "String",
    "arch": "String",
    "release": "String"
  },
  "cpus": "String[]",
  "mem": "String",
  "gpus": "String[]"
}
```

After a project has been created on FGLab, if this machine is available to run experiments for the project then add the following field to `projects.json`.

```json
"<project_id>": {
  "cwd": "<working directory>",
  "command": "<binary>",
  "file": "<file>",
  "option": "<command line option flag>",
  "capacity": "<machine capacity needed / 1>",
  "results": "<results directory (without experiment ID)>"
}
```

For example:

```json
"55d716ff269de6a02af9be4b": {
  "cwd": "/projects/mnist",
  "command": "th",
  "file": "main.lua",
  "option": "-params",
  "capacity": "0.3",
  "results": "/data/mnist"
}
```

Results must be saved as JSON files into a subfolder in the specified results directory, where the name of the subfolder is the experiment ID, e.g. `/data/mnist/55e069f9cf4e1fe075b76b95`, containing `results-pt1.json` and `results2.json`.

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

## Future Work

- Sort out capacity properly.
- Live logging from stdout.
- Enable Mac OS X GPU support via `system_profiler`.
- Find a way to enable Windows GPU support.
