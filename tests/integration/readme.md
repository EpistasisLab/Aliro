First pass at integration tests and a docker test integration test runner.

To run the integration tests, from the root app directory run:
`
docker-compose -f .\docker-compose-int-test.yml up --abort-on-container-exit
`

This will spin up lab, machine, and dbmongo containers as well as an integration test container that will run the test suites and exit.
The results will be in the folder `.\tests\integration\results`

todo:

- customize the initial state

## Node/Jest ##
Jest tests with the naming convention `./jest/*.test.ts` or `./jest/*.test.js` will be run automatically. 

`./jest/labApi.js` has some basic methods for testing the lab container api.

Code written in [typescript](http://www.typescriptlang.org/ "typescript") or javascript should be supported.

See [Jest](https://facebook.github.io/jest/docs/en/getting-started.htm "Jest documentation")


## Nose/Python ##
Todo
