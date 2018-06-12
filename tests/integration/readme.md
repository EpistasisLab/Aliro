First pass at integration tests and a docker test integration test runner.

To run the integration tests, from the root app directory run:
`
docker-compose -p integration-tests up
`

This will spin up lab, machine, and dbmongo containers as well as an integration test container that will run the test suites and exit.

todo:
 
- export results to a shared volume
- customize the initial database state
- shut down all containers when the test suite completes

## Node/Jest ##
Jest tests with the naming convention `./jest/*.test.ts` or `./jest/*.test.js` will be run automatically. 

`./jest/labApi.js` has some basic methods for testing the lab container api.

Code written in [typescript](http://www.typescriptlang.org/ "typescript") or javascript should be supported.

See [Jest](https://facebook.github.io/jest/docs/en/getting-started.htm "Jest documentation")


## Nose/Python ##
Todo