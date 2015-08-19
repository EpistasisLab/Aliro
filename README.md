# FGMachine

The machine client for [FGLab](https://github.com/Kaixhin/FGLab).

## Requirements

- Linux (for getting GPUs with `lspci`)

## Installation

1. Install [Node.js](https://nodejs.org/) >= 0.12
1. Clone this repository
1. Move inside and run `npm install`
1. Create `.env` with the following schema:

```
ADDRESS=<address accessible by FGLab instance, including "http://">
PORT=<port>
FGLAB_URL=<address of FGLab instance, including port if necessary>
```

Run `node index.js` to start FGMachine.

## TODO

- Enable Mac OS X GPU support via `system_profiler`
