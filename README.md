[![Build Status](https://img.shields.io/travis/Kaixhin/FGMachine.svg)](https://travis-ci.org/Kaixhin/FGMachine)
[![Dependency Status](https://img.shields.io/david/kaixhin/fgmachine.svg)](https://david-dm.org/Kaixhin/FGMachine)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/Kaixhin/FGMachine/master/LICENSE)

# FGMachine

The machine client for [FGLab](https://github.com/Kaixhin/FGLab).

FGMachine currently only reads GPU information on Linux.

## Installation

1. Install [Node.js](https://nodejs.org/).
1. Clone this repository (or download a [zip](https://github.com/Kaixhin/FGMachine/zipball/master)/[tar](https://github.com/Kaixhin/FGMachine/tarball/master)) and move inside.
1. Run `npm install`.
1. Create `projects.json` ([projects.example.json](https://github.com/Kaixhin/FGMachine/blob/master/projects.example.json) can be used as a starting point).
1. Set the following environment variables:
  - FGLAB_URL (FGLab URL)
  - FGMACHINE_URL (FGMachine URL, including port)

The final instruction can be performed by either exporting the variables to the environment or creating a `.env` file ([example.env](https://github.com/Kaixhin/FGMachine/blob/master/example.env) can be used as a starting point).

Run `node index.js` to start FGMachine. On the first run it will create `specs.json` and register itself with FGLab.

To re-register, delete `specs.json` before running FGMachine again.

To update, use `git pull` to update the repository and run `npm install` to update any changed dependencies.

## Objects

### Projects

After a project has been created on FGLab, if this machine is available to run experiments for the project then add the following field to `projects.json`.


```json
"<project_id>": {
  "cwd": "<working directory>",
  "command": "<binary>",
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

### Experiments

Results and custom data must be saved as JSON files into a subfolder in the specified results directory, where the name of the subfolder is the experiment ID, e.g. `/data/mnist/55e069f9cf4e1fe075b76b95`. The current format for results, where the `indices` field contains the iterations for logging losses, and `score` represents the performance of the model, is:

```json
{
  "_train": {
    "indices": "int[]",
    "losses": "float[]",
  },
  "_val": {
    "indices": "int[]",
    "losses": "float[]",
    "score": "float"
  },
  "_test": {
    "loss": "float",
    "score": "float"
  }
}
```

Each field should be updated separately on FGLab by writing a new file e.g. creating a new file `val.json` with `{"_val": {"indices": [1, 2, 3], "losses": [0.962, 0.629, 0.488], "score": 8}}` will update the `_val` field for the experiment. Nested fields cannot be updated separately e.g. `_test.score`. FGLab expects `_train`, `_val` and `_test` - other JSON files can be used to upload custom data. Non-JSON files are also uploaded so that they can be downloaded in their native format from FGLab. For a simple example, see [rand.js](https://github.com/Kaixhin/FGMachine/blob/master/tests/rand.js). **Note that fields preceded with `_` are reserved for processing by FGLab**.
