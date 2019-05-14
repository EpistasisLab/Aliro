#  User Documentation
A tool to use artificial intelligence for easy and intuitive analysis of data using supervised machine learning.


## Installation
PennAI is a multi-container docker project that uses ([Docker-Compose](https://docs.docker.com/compose/)).

### Requirements
  - Docker
    - Most recent stable release, minimum version is 17.06.0
      - [Official Docker Website Getting Started](https://docs.docker.com/engine/getstarted/step_one/)
      - [Official Docker Installation for Windows](https://docs.docker.com/docker-for-windows/install/)
    - **Runtime Memory**: We recommend docker to be configured with at least 6GB of runtime memory ([Mac configuration](https://docs.docker.com/docker-for-mac/#advanced), [Windows configuration](https://docs.docker.com/docker-for-windows/#advanced)).  By default, docker starts with 2G runtime memory.
  - Docker-Compose (Version 1.22.0 or greater, Linux only) - Separate installation is only needed for linux, docker-compose is bundled with windows and mac docker installations
  	- [Linux Docker-Compose Installation](https://docs.docker.com/compose/install/)

### Installation
1. Download the production zip from the [latest release](https://github.com/EpistasisLab/pennai/releases/latest)
2. Unzip the archive
2. From the command line, navigate to the pennai directory and load the images into docker with the following commands:

```
docker load --input .\images\pennai_lab.tar
docker load --input .\images\pennai_machine.tar
docker load --input .\images\pennai_dbmongo.tar
```

## User Guide

### Starting and Stopping
To start PennAI, from the PennAI directory run the command `docker-compose up`.  To stop PennAI, kill the process with `ctrl+c` and wait for the server to shut down.

To reset the datasets and experiments in the server, start PennAI with the command `docker-compose up --force-recreate`  or run the command `docker-compose down` after the server has stopped.

### User Interface
Once the webserver is up, connect to <http://localhost:5080/> to access the website.  You should see the **Datasets** page with the datasets in the `data/datasets/user` directory.  

### Adding Datasets
One can add new datasets using a UI form within the website or manually add new datasets to the data directory.  Datasets have the following restrictions:
* Datasets must have the extension .csv or .tsv
* Datasets cannot have any null or empty values
* Dataset features must be either numeric, categorical, or ordinal.
* Only the label column or categorical or ordinal features can contain string values.

#### Uploading Using the Website ####
To upload new datasets from the website, click the "Add new Datasets" button on the Datasets page to navigate to the upload form. Select a file using the form's file browser and enter the corresponding information about the dataset: the name of the dependent column, a JSON of key/value pairs of ordinal features, for example ```{"ord" : ["first", "second", "third"]}```, and a comma separated list of categorical column names without quotes, such as `cat1, cat2`. Once uploaded, the dataset should be available to use within the system.


#### Adding Initial Datasets to the Data Directory ####
Labeled datasets can also be loaded when PennAI starts by adding them to the `data/datasets/user` directory.  PennAI must be restarted if new datasets are added while it is running.  If errors are encountered when validating a dataset, they will appear in a log file in `target/logs/loadInitialDatasets.log` and that dataset will not be uploaded.  Data can be placed in subfolders in this directory.

By default, the column with the label should be named 'class'.  If the labeled column has a different name or if the dataset has categorical or orinal features, this can be specified in a json configuration file.  The coresponding configuration file must be in the same directory as the dataset.  If the file is named `myDatafile.*sv`, the configuration file must be named `myDatafile_metadata.json`
* Example configuration file:

```
{
	"target_column":"my_custom_target_column_name",
	"categorical_features" : ["cat1", "cat2"],
	"ordinal_features" : {"ord" : ["first", "second", "third"]}
}
```

### Analyzing Data ###
To run a classification machine learning experiment, from the click 'Build New Experiment', choose the desired algorithm and experiment parameters and click 'Launch Experiment'.  To start the AI, from the **Datasets** page click the AI toggle.  The AI will start issuing experiments according to the parameters in `config/ai.config`.

From the **Datasets** page, click 'completed experiments' to navigate to the **Experiments** page for that dataset filtered for the completed experiments.  If an experiment completed successfully, use the 'Actions' dropdown to download the fitted model for that experiment and a python script that can be used to run the model on other datasets.  Click elsewhere on the row to navigate to the experiment **Results** page.

### Downloading and Using Models ###
A pickled version of the fitted model and an example script for using that model can be downloded for any completed experiment from the **Experiments** page.

Please see [Demo](docs/PennAI_Demo/Demo_of_using_exported_scripts_from_PennAI.ipynb) for instructions on using the scripts and model exported from PennAI.

# Developer Documentation

## Developer Installation

### Requirements
Install Docker and docker-compose as per the main installation requirements.

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
- To get the cpu and memory status of the running containers use `docker stats`
- To clear out all files not checked into git, use `git clean -xdf`
- Use `docker-compose build` to rebuild the images for all services (lab, machine, dbmongo) if their dockerfiles or the contents of their build directories have changed. See [docs](https://docs.docker.com/compose/reference/build/)
	- **NOTE:** docker-compose will **not** rebuild the base image; if you make changes to the base image rebuild with `docker build ./dockers/base -t pennai/base:latest`.
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

##  Documentation
- Sphinx documentation can be rebuilt in the context of a docker container with the command `docker-compose -f .\docker-compose-doc-builder.yml up --abort-on-container-exit`.  

## Tests

### Integration
- Type: Docker, runs [Jest](https://jestjs.io/)
- Usage: `docker-compose -f .\docker-compose-int-test.yml up --abort-on-container-exit --force-recreate`
- Results:
	- The results will in xcode format be in `.\target\test-reports\int_jest_xunit.xml`
	- The results will in html format be in `.\target\test-reports\html\int_jest_test_report.html`
- Docs: See [Documentation](https://github.com/EpistasisLab/pennai/blob/pennai_lite/tests/integration/readme.md) for details.


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
