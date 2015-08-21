# FGMachine

The machine client for [FGLab](https://github.com/Kaixhin/FGLab).

FGMachine currently only reads GPU information on Linux.

## Installation

1. Install [Node.js](https://nodejs.org/) >= 0.12.
1. Clone this repository.
1. Move inside and run `npm install`.
1. Create `projects.json`.
1. Create `.env` with the following schema:

```
FGMACHINE_URL=<FGMachine URL (must include port)>
FGLAB_URL=<FGLab URL>
```

For example:

```
FGMACHINE_URL=http://localhost:5080
FGLAB_URL=http://localhost:8000
```

Run `node index.js` to start FGMachine. On the first run it will create `specs.json` and register itself with FGLab. `specs.json` follows the following format:

```json
{
  "address": "String",
  "hostname": "String",
  "os": {
    "type": "String",
    "platform": "String",
    "arch": "String",
    "release": "String"
  },
  "cpus": ["String"],
  "mem": "String",
  "gpus": ["String"]
}
```

After a project has been created on FGLab, if this machine is available to run experiments for the project then add the following field to `projects.json`.

```json
"<id>": {
  "command": "<binary>",
  "file": "<file>",
  "option": "<command line option flag>",
  "capacity": "<machine capacity needed / 1>"
}
```

For example:

```json
"55d716ff269de6a02af9be4b": {
  "command": "th",
  "file": "/projects/mnist/main.lua",
  "option": "-params",
  "capacity": "0.3"
}
```

## Future Work

Enable Mac OS X GPU support via `system_profiler`.
