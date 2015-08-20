# FGMachine

The machine client for [FGLab](https://github.com/Kaixhin/FGLab).

FGMachine currently only reads GPU information on Linux.

## Installation

1. Install [Node.js](https://nodejs.org/) >= 0.12.
1. Clone this repository.
1. Move inside and run `npm install`.
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

Run `node index.js` to start FGMachine.

## Future Work

Enable Mac OS X GPU support via `system_profiler`.
