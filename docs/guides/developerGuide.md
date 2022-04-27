# Developer Guide

## Developer Installation

### Requirements
Install Docker and docker-compose as per the main installation requirements (see :ref:`user-guide`).
- Docker setup
  - Shared Drive: (Windows only)  Share the drive that will have the Aliro source code with the Docker desktop [Docker Shared Drives](https://docs.docker.com/docker-for-windows/#shared-drives)

#### Optional dependencies for development/testing:
  - Python and pyton test runners (in most cases unnecessary. needed only to run unit tests locally outside of docker)
    - [Python 3.* ](https://www.python.org/downloads/)
    - [nose](https://pypi.org/project/nose/)
  - [coverage](https://nose.readthedocs.io/en/latest/plugins/cover.html) via `pip install nose coverage`
  - Node.js (can be helpful for local development)
    - [https://nodejs.org/en/](https://nodejs.org/en/)

### Building Docker Images
1. Clone the Aliro project using `git clone git@github.com:EpistasisLab/Aliro.git`


2. Set up your local Aliro configuration file. From the Aliro directory, copy `config\ai.env-template` to `config\ai.env`.


3. Build the development service images by running `docker-compose build` from the Aliro directory.  It will take several minutes for the images to be built the first time this is run.

### Starting and Stopping ###
To start Aliro, from the Aliro directory run the command `docker-compose up`.  To stop Aliro, kill the process with `ctrl+c` and wait for the process to exit.

Aliro can be run with multiple machine instances using the `docker-compose-multi-machine.yml` docker compose file, as per: `docker-compose up -f ./docker-compose-multi-machine.yml`

To reset the docker volumes, restart using the `--force-recreate` flag or run `docker-compose down` after the server has been stopped.

## Development Notes
-  After any code changes are pulled, **ALWAYS** rerun `docker-compose build` and when you first reload the webpage first do a hard refresh with ctrl+F5 instead of just F5 to clear any deprecated code out of the browser cache.
- Whenever there are updates to any of the npm libraries as configured with `package.json` files, the images should be rebuilt and the renew-anon-volumes flag should be used when starting Aliro `docker-compose up --renew-anon-volumes` or `docker-compose up -V`.
- Use `docker-compose build` to rebuild the images for all services (lab, machine, dbmongo) if their dockerfiles or the contents of their build directories have changed. See [docker build docs,](https://docs.docker.com/compose/reference/build/)
- To get the cpu and memory status of the running containers use `docker stats`
- To clear out all files not checked into git, use `git clean -xdf`
- Use `docker-compose build --no-cache lab` to rebuild the image for the lab services without using the cache (meaning the image will be rebuilt regardless of any changes being detected)
- Use `docker rm $(docker ps -a -q)` to remove all docker containers
- Use `docker rmi $(docker images -q)` to remove all docker images
- Use `docker exec -it "container_name" /bin/bash` to attach to a running container with a bash prompt
- To manually start the AI service, attach to the lab container with bash and start the AI service:

  ```
  docker exec -it "aliro_lab_1" /bin/bash
  cd $PROJECT_ROOT/
  python -m ai.ai -v -n 2
  ```
	- Note: If `docker exec -it "aliro_lab_1" /bin/bash ` returns 'Error: no such container', use `docker container ps` to get the name of the lab container
	- Note: `docker attach aliro_lab_1` will attach to the lab container, but if the last command run by the startup script was not bash it will appear to hang.

### Web Development
The frontend UI source is in `\lab\webapp` and is managed using [webpack](https://webpack.js.org/).  When developing the UI, webpack can be configured to run in [watch mode](https://webpack.js.org/configuration/watch/) to cause bundle.js to be automatically be recompiled when new changes to the web code are detected.  After the code has been recompiled users will need to [hard refresh](https://en.wikipedia.org/wiki/Wikipedia:Bypass_your_cache) with ctrl+F5 for the changes to be seen in the browser.  

There are two ways to enable watch mode:

* To enable watch mode after Aliro has been started, do the following:
    ```
    docker exec -it "aliro_lab_1" /bin/bash
    cd $PROJECT_ROOT/lab/webapp
    npm run build-dev
    ```

* To automatically start in watch mode, add the line `WEBDEV=1` to the configuration file `config\ai.env`

### NPM Package Management
To update or add NPM package dependencies:
* Update the appropriate `package.json` file
* Rebuild the images (`docker-compose build`, `docker-compose -f .\docker-compose-int-test.yml build` etc.)
* Refresh anonymous volumes when restarting Aliro with `docker-compose up --renew-anon-volumes` or `docker-compose up -V`

---

Package management for node is configured in three places: the main backend API (`lab\package.json`), the frontend UI (`lab\webapp\package.json`), and the machine container API (`machine\package.json`).

Node package installation (`npm install`) takes palace as part of the `docker build` process.  If there are changes to a `package.json` file, then during the build those changes will be detected and the updated npm packages will be installed.  

When not using the production docker-compose file, node packages are installed in docker anonymous volumes `lab/node_modules`, `lab/webapp/node_modules`, `machine/node_modules`.  When starting Aliro after the packages have been rebuilt, the `--renew-anon-volumes` flag should be used.


##  Architecture Overview
Aliro is designed as a multi-component docker architecture that uses a variety of technologies including Docker, Python, Node.js, scikit-learn and MongoDb.  The project contains multiple docker containers that are orchestrated by a docker-compose file.  

![Aliro Architecture Diagram](https://raw.githubusercontent.com/EpistasisLab/Aliro/master/docs/source/_static/pennai_architecture.png?raw=true "Aliro Architecture Diagram")

##### Controller Engine (aka _The Server_)
The central component is the controller engine, a server written in Node.js.  This component is responsible for managing communication between the other components using a rest API.  
##### Database
A MongoDb database is used for persistent storage.  
##### UI Component (aka _The Client_)
The UI component (_Vizualization / UI Engine_ in the diagram above) is a web application written in javascript that uses the React library to create the user interface and the Redux library to manage server state.  It allows users to upload datasets for analysis, request AI recommendations for a dataset, manually run machine learning experiments, and displays experiment results in an intuitive way.  The AI engine is written in Python.  As users make requests to perform analysis on datasets, the AI engine will generate new machine learning experiment recommendations and communicate them to the controller engine.  The AI engine contains a knowledgebase of previously run experiments, results and dataset metafeatures that it uses to inform the recommendations it makes.  Knowledgable users can write their own custom recommendation system.  The machine learning component is responsible for running machine learning experiments on datasets. It has a node.js server that is used to communicate with the controller engine, and uses python to execute scikit learn algorithms on datasets and communicate results back to the central server.  A Aliro instance can support multiple instances of machine learning engines, enabling multiple experiments to be run in parallel.

##  Code Documentation
- Sphinx documentation can be built in the context of a docker container with the command `docker-compose -f .\docker-compose-doc-builder.yml up --abort-on-container-exit`.  

## Tests

### Local Test Instructions
The unit and integration tests can be run locally using the followng commands:
- Unit (both javascript and python): `docker-compose -f .\docker-compose-unit-test.yml up --abort-on-container-exit -V`
  - Run only webapp/javascript unit tests: `docker-compose --env-file ./config/unit-test-js-only.env -f .\docker-compose-unit-test.yml up --abort-on-container-exit`
  - Run only python unit tests: `docker-compose --env-file ./config/unit-test-py-only.env -f .\docker-compose-unit-test.yml up --abort-on-container-exit`
- Integration: `docker-compose -f .\docker-compose-int-test.yml up --abort-on-container-exit --force-recreate`

*NOTE* It is best to run local unit tests using the above command. An optional way is to attach a shell to a running container instance via `docker exec -it Aliro-dev_lab_1 /bin/bash` and then manually run the unit test runner `.\tests\unit\unit_test_runner.sh`. This is faster than running via `docker-compose` and a new container instance. *However*, this method can produce different react component snapshots, and possibly other differences, so if you use this method for rapid development of tests, always follow up with running via the `docker-compose` commands above to assure compatibility with how the tests are run for CI tests.

The test results in html format can be found in the directory `.\target\test-reports\html`

Note: If the npm packages have been updated, the unit tests docker image need to be rebuild with `docker-compose -f .\docker-compose-unit-test.yml build`

### Integration
- Type: Docker, runs [Jest](https://jestjs.io/)
- Usage: `docker-compose -f .\docker-compose-int-test.yml up --abort-on-container-exit --force-recreate`
- Results:
	- The results will in xcode format be in `.\target\test-reports\int_jest_xunit.xml`
	- The results will in html format be in `.\target\test-reports\html\int_jest_test_report.html`
- Docs: See [Documentation](https://github.com/EpistasisLab/Aliro/blob/master/tests/integration/readme.md) for details.


### Unit
There are several unit test suites for the various components of Aliro.  The unit test suites can be run together in the context of a docker environment or directly on the host system, or an individual test suite can be run by itself.

The default location of the test output is the `.\target\test-reports\` directory.

#### Docker unit test runner
- Type: Runs all the unit tests in the context of a docker container and puts the test results and code coverage reports in the `.\target` directory
- Dependencies: Docker-compose
- Usage: `docker-compose -f .\docker-compose-unit-test.yml up --abort-on-container-exit`
  - To run only javascript or python tests, see the [further details above](#local-test-instructions)
- Results:
	- The results will in xcode format be in `.\target\test-reports\nose_xunit.xml`
	- The xml cobertura coverage report will be in `.\target\test-reports\cobertura\nose_cover.xml`

#### Host unit test runner
- Type: Bash script that runs all the python unit tests on the host system and puts the test results and code coverage reports in the `.\target` directory
- Dependencies: `pip install nose coverage`
	- Python [nose](https://pypi.org/project/nose/)
	- [coverage](https://nose.readthedocs.io/en/latest/plugins/cover.html)
- Usage: `sh .\tests\unit_test_runner.sh`
- Results:
	- The results will in xcode format be in `.\target\test-reports\nose_xunit.xml`
	- The xml cobertura coverage report will be in `.\target\test-reports\cobertura\nose_cover.xml`


#### Unit test suite details
##### AI Recommnender
- Type: Python [nose](https://pypi.org/project/nose/)
- Prereqs: install nose `pip install nose`
- Usage:

    ```
	nosetests -s -v ai/tests/test_recommender.py
	```

##### AI Controller
- Type: Python [nose](https://pypi.org/project/nose/)
- Prereqs: install nose `pip install nose`
- Usage:

    ```
	nosetests -s -v ai/tests/test_ai.py
	```

##### Metafeature Generation
- Type: Python
- Usage:

    ```
	cd .\ai\metalearning
	python tests_dataset_describe.py
	```

##### Machine
- Type: Python via [nose](https://pypi.org/project/nose/) and Javascript via [mocha](https://mochajs.org/)
- Prereqs:
    - install nose `pip install nose`
    - install mocha `npm install -g mocha`
- Usage:
    ```
    # test Python codes
    nosetests -s -v machine/test/learn_tests.py
    # test Javascript codes
    cd machine
    npm install
    # note the path of test.js need to be updated in Windows environment
    mocha ./test/test.js # or `npm test`
    ```

## Production Builds

### Generating and publishing production builds
To create a production release:
- the source should be added to the `production` branch with a tagged commit
- the production docker images should be added to DockerHub with appropriate tags
- a github release should be created
- a user production .zip should be addded as an asset to the github release

Release procedure:

0. **Test production build.** In the master branch with all changes applied, run `docker-compose -f ./docker-compose-production.yml build` followed by `docker-compose -f ./docker-compose-production.yml up -V`.  This should start an instance of Aliro using the production build environment.  Test that it works as expected.

1. **Update the `.env` file with a new version number.** In the master branch, update the TAG environment variable in `.env` to the current production version as per [semantic versioning](https://semver.org/) and the python package version specification [PEP440](https://www.python.org/dev/peps/pep-0440).  Development images should have a tag indicating it is a [pre-release](https://www.python.org/dev/peps/pep-0440/#pre-releases) (for example, `a0`).

2. **Push changes to github.**  Merge the master branch into the `production` branch and push the changes to github.

3. **Build production docker images with `bash release/generate_production_release.sh`.** While in the prodution branch, build the production images and generate the user production .zip by running `bash release/generate_production_release.sh`.  This will:
* Create local lab, machine, and dbmongo production docker images with the tag defined in the .env file  
* Create the production .zip named `target/production/Aliro-${VERSION}.zip`
```
git checkout production
bash release/generate_production_release.sh
```

4. **Push docker images to DockerHub and tag the production git branch by running `deploy_production_release.sh`.**  While in the produciton branch, run `bash release/deploy_production_release.sh`.  This will:
* Push the production lab, machine and dbmongo production docker images to dockerHub
* Tag the production git branch with the version defined in `.env`
```
git checkout production
bash release/deploy_production_release.sh
```

5. **Test DockerHub images and production code.**  Test that the production release works with the newly uploaded DockerHub images by navigating to the directory `target/production/Aliro-${VERSION}` and running `docker-compose up`.  This should start an instance of Aliro that loads the newest images from DockerHub.  Test that this works as expected.  Check that in the enviromental variables section of the admin page, 'TAG' matches the current version. 

6. **Create Github Release.**  If the test is successful, create a github release using the github web interface.  Base the release on the tagged production commit.  Attach the file `target/production/Aliro-${VERSION}.zip` as an archive asset.

7.  **Update the .env file in the master branch with the new dev version.**  Update the `.env` file in the master branch with the next version number and the `a0` suffix (see [Pre-release versioning conventions](https://www.python.org/dev/peps/pep-0440/#pre-releases) and push the changes to git.  For example, `0.14` was just released, the new dev tag should be `0.15a0`. 

### Installing a production build
1. Download a production build from github

2. Unzip the archive

### Running from production build
1. From the Aliro directory, run the command `docker-compose up` to start the Aliro server.
