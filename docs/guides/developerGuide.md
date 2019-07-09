# Developer Guide

## Developer Installation

### Requirements
Install Docker and docker-compose as per the main installation requirements (see :ref:`user-guide`).

#### Optional dependencies for development/testing:
  - Python and pyton test runners (needed only to run unit tests locally)
    - [Python 3.* ](https://www.python.org/downloads/)
    - [nose](https://pypi.org/project/nose/)
  - [coverage](https://nose.readthedocs.io/en/latest/plugins/cover.html) via `pip install nose coverage`
  - Node.js (can be helpful for local development)
    - [https://nodejs.org/en/](https://nodejs.org/en/)

### Building Docker Images
1. Clone the PennAI project using `git clone git@github.com:EpistasisLab/pennai.git`


2. Set up your local PennAI configuration file. From the pennai directory, copy `config\ai.env-template` to `config\ai.env`.


3. Build the base docker image by running `docker build ./dockers/base -t pennai/base:latest` from the pennai directory.  It will take several minutes for the image to be built the first time this run.  


4. Build the development service images by running `docker-compose build` from the pennai directory.  It will take several minutes for the images to be built the first time this run.

### Starting and Stopping ###
To start PennAI, from the PennAI directory run the command `docker-compose up`.  To stop PennAI, kill the process with `ctrl+c` and wait for the process to exit.

PennAI can be run with multiple machine instances using the `docker-compose-multi-machine.yml` docker compose file, as per: `docker-compose up -f ./docker-compose-multi-machine.yml`

To reset the docker volumes, restart using the `--force-recreate` flag or run `docker-compose down` after the server has been stopped.

## Development Notes
-  After any code changes are pulled, **ALWAYS** rerun `docker-compose build` and when you first reload the webpage first do a hard refresh with ctrl+f5 instead of just f5 to clear any deprecated code out of the browser cache.  If the code changes modified the base container, run `docker build ./dockers/base -t pennai/base:latest` before running `docker-compose build`.
- Use `docker-compose build` to rebuild the images for all services (lab, machine, dbmongo) if their dockerfiles or the contents of their build directories have changed. See [docs](https://docs.docker.com/compose/reference/build/)
	- **NOTE:** docker-compose will **not** rebuild the base image; if you make changes to the base image rebuild with `docker build ./dockers/base -t pennai/base:latest`.
- To get the cpu and memory status of the running containers use `docker stats`
- To clear out all files not checked into git, use `git clean -xdf`
- Use `docker-compose build --no-cache lab` to rebuild the image for the lab services without using the cache (meaning the image will be rebuilt regardless of any changes being detected)
- Use `docker rm $(docker ps -a -q)` to remove all docker containers
- Use `docker rmi $(docker images -q)` to remove all docker images
- Use `docker exec -it "container_name" /bin/bash` to attach to a running container with a bash prompt
- To manually start the AI service, attach to the lab container with bash and start the AI service:

  ```
  docker exec -it "pennai_lab_1" /bin/bash
  cd $PROJECT_ROOT/
  python -m ai.ai -v -n 2
  ```
	- Note: If `docker exec -it "pennai_lab_1" /bin/bash ` returns 'Error: no such container', use `docker container ps` to get the name of the lab container
	- Note: `docker attach pennai_lab_1` will attach to the lab container, but if the last command run by the startup script was not bash it will appear to hang.
- When developing the UI, webpack can be run in dev mode so that bundle.js will be automatically be rebuilt when changes to the web code are detected.  User will need to refresh with ctrl+5f for the changes to be seen in the browser.  To do so, after PennAi is up, do the following:

    ```
    docker exec -it "pennai_lab_1" /bin/bash
    cd $PROJECT_ROOT/lab/webapp
    npm run build-dev
    ```

##  Architecture Overview
PennAI is designed as a multi-component docker architecture that uses a variety of technologies including Docker, Python, Node.js, scikit-learn and MongoDb.  The project contains multiple docker containers that are orchestrated by a docker-compose file.  

![PennAI Architecture Diagram](https://raw.githubusercontent.com/EpistasisLab/pennai/master/docs/source/_static/pennai_architecture.png?raw=true "PennAI Architecture Diagram")

The central component is the controller engine, a server written in Node.js.  This component is responsible for managing communication between the other components using a rest API.  A MongoDb database is used for persistent storage.  The UI component is a web application written in javascript that uses the React library to create the user interface and the Redux library to manage server state.  It allows users to upload datasets for analysis, request AI recommendations for a dataset, manually run machine learning experiments, and displays experiment results in an intuitive way.  The AI engine is written in Python.  As users make requests to perform analysis on datasets, the AI engine will generate new machine learning experiment recommendations and communicate them to the controller engine.  The AI engine contains a knowledgebase of previously run experiments, results and dataset metafeatures that it uses to inform the recommendations it makes.  Knowledgable users can write their own custom recommendation system.  The machine learning component is responsible for running machine learning experiments on datasets. It has a node.js server that is used to communicate with the controller engine, and uses python to execute scikit learn algorithms on datasets and communicate results back to the central server.  A PennAI instance can support multiple instances of machine learning engines, enabling multiple experiments to be run in parallel.

##  Code Documentation
- Sphinx documentation can be built in the context of a docker container with the command `docker-compose -f .\docker-compose-doc-builder.yml up --abort-on-container-exit`.  

## Tests

### Integration
- Type: Docker, runs [Jest](https://jestjs.io/)
- Usage: `docker-compose -f .\docker-compose-int-test.yml up --abort-on-container-exit --force-recreate`
- Results:
	- The results will in xcode format be in `.\target\test-reports\int_jest_xunit.xml`
	- The results will in html format be in `.\target\test-reports\html\int_jest_test_report.html`
- Docs: See [Documentation](https://github.com/EpistasisLab/pennai/blob/master/tests/integration/readme.md) for details.


### Unit
There are several unit test suites for the various components of PennAI.  The unit test suites can be run together in the context of a docker environment or directly on the host system, or an individual test suite can be run by itself.

The default location of the test output is the `.\target\test-reports\` directory.

#### Docker unit test runner
- Type: Runs all the unit tests in the context of a docker container and puts the test results and code coverage reports in the `.\target` directory
- Dependencies: Docker-compose
- Usage: `docker-compose -f .\docker-compose-unit-test.yml up --abort-on-container-exit`
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
To create production builds merge the code into the production branch and create a github release, create a local production directory, add .tar files of the production docker images to the directory, zip it, and add the zipped directory as an asset to the github release:

1. Update the TAG environment variable in `.env` to the current production version as per [semantic versioning](https://semver.org/)

2. Push the code to github, merge it to the production branch using github create a release using the same version as the .env file

3. Build the production images using `docker-compose -f docker-compose-production.yml build`.  This will create local lab, machine, and dbmongo images with the tag defined in the .env file.

4. Create a production directory and copy the config files, the .env file, and the production docker compose file, and make an images directory:
  ```
  #!/bin/bash

  PROD_DIR = "pennai-${TAG}"

  mkdir -p $PROD_DIR
  mkdir -p "$PROD_DIR/images"

  cp -R config "${PROD_DIR}/config"
  cp config/ai.env-template "${PROD_DIR}/config/ai.env-template"
  cp .env "${PROD_DIR}/.env"
  cp docker-compose-production.yml "${PROD_DIR}/docker-compose.yml"
  ```

5. Export the production images into the images directory:
  ```
  cd PROD_DIR
  docker save --output pennai_lab.tar "pennai_lab:${TAG}"
  docker save --output pennai_machine.tar "pennai_machine:${TAG}"
  docker save --output pennai_dbmongo.tar "pennai_dbmongo:${TAG}"
  ```

6. Zip the production directory

7. Create a github release using the tagged production commit, and attach the zipped production directory as an archive


### Installing a production build
1. Download a production build from github

2. Unzip the archive

3. Load the images into docker with the following commands:
  ```
  docker load --input .\images\pennai_lab.tar
  docker load --input .\images\pennai_machine.tar
  docker load --input .\images\pennai_dbmongo.tar
  ```

### Running from production build
1. From the pennai directory, run the command `docker-compose up` to start the PennAI server.
