# Penn AI
A tool to use artificial intelligence for easy and intuitive analysis of data using supervised machine learning.


## Installation
PennAI is a docker project that uses ([Docker-Compose](https://docs.docker.com/compose/)).

1. Install build requirements:

#### Required
  - Docker (Version 17.06.0+)
  	- [Official Docker Website Getting Started](https://docs.docker.com/engine/getstarted/step_one/)
	- [Official Docker Installation for Windows](https://docs.docker.com/docker-for-windows/install/)
  - Docker-Compose (Version 1.22.0+, Linux only) - Separate installation is only needed for linux, docker-compose is bundled with windows and mac docker installations
  	- [Linux Docker-Compose Installation](https://docs.docker.com/compose/install/)

#### Optional dependencies for development/testing:
  - Python and pyton test runners (needed only to run unit tests locally)
  	- [Python 3.* ](https://www.python.org/downloads/)
  	- [nose](https://pypi.org/project/nose/)
	- [coverage](https://nose.readthedocs.io/en/latest/plugins/cover.html) via `pip install nose coverage`
  - Node.js (can be helpful for local development)
  	- [https://nodejs.org/en/](https://nodejs.org/en/)

2. Clone the PennAI project using `git clone git@github.com:EpistasisLab/pennai.git`


3. Set up your local PennAI configuration. From the pennai directory, copy `config\ai.env-template` to `config\ai.env`.


4. Build the base docker image by running `docker build ./dockers/base -t pennai/base:latest` from the pennai directory.  It will take several minutes for the image to be built the first time this run.  

5. Build the production service images by running `docker-compose -f docker-compose-production.yml build` from the pennai directory.  It will take several minutes for the images to be built the first time this run.

6. (For developer) Build the development service images by running `docker-compose build` from the pennai directory.  It will take several minutes for the images to be built the first time this run.

## Usage

### Starting and Stopping (Production Branch) ###
To start PennAI, from the PennAI directory run the command `docker-compose -f docker-compose-production.yml up --force-recreate`.  To stop PennAI, kill the process with `ctrl+c` and then run the command `docker-compose -f docker-compose-production.yml down`.

### Starting and Stopping (Developer) ###
To start PennAI, from the PennAI directory run the command `docker-compose up --force-recreate`.  To stop PennAI, kill the process with `ctrl+c` and then run the command `docker-compose down`.

- Note: If `docker-compose up` was previously run but `docker-compose down` was not, when running `docker-compose up` again without flag `--force-recreate` the webserver will start but no experiments will be able to be run.  Try stopping the containers, then run `docker-compose down` followed by `docker-compose up`, or use the `--force-recreate` flag when running `docker-compose up`.  See issue [#52](https://github.com/EpistasisLab/pennai/issues/52).

### Adding Datasets ###
One can add new datasets using a UI form within the website or manually add new datasets to the project directory. 

To upload new datasets from the website, click the "Add new Datasets" button on the Datasets page to navigate to the upload form. Select a file using the form's file browser and enter the corresponding information about the dataset: the name of the dependent column, a JSON of key/value pairs of ordinal features, for example ```{"ord" : ["first", "second", "third"]}```, and a comma separated list of categorical column names without quotes, such as `cat1, cat2`. Once uploaded, the dataset should be available to use within the system.

Or 

Labeled datasets for analyzing can be added to the `data/datasets/user` directory.  Data can be placed in subfolders in this directory.  PennAI must be restarted if new datasets are added while it is running.  If errors are encountered when validating a dataset, they will appear in a log file in `target/logs/loadInitialDatasets.log` and that dataset will not be uploaded.  Datasets have the following restrictions:

* Datasets must have the extension .csv or .tsv
* Datasets can contain only numeric values and cannot have any null values
* By default, the column with the label should be named 'class'
* Datasets can optionally have a coresponding json configuration file in the same directory which can be used to specify the target column.  If the file is named `myDatafile.*sv`, the configuration file must be named `myDatafile_metadata.json`
* Example configuration file:

```
{
	"target_column":"my_custom_target_column_name"
}
```

### Analyzing Data ###
Once the webserver is up, connect to <http://localhost:5080/> to access the website.  You should see the **Datasets** page with the datasets in the `data/datasets/user` directory.  To run an experiment, from the click 'Build New Experiment', choose the desired algorithm and experiment parameters and click 'Launch Experiment'.  To start the AI, from the **Datasets** page click the AI toggle.  The AI will start issuing experiments according to the parameters in `config/ai.config`.

From the **Datasets** page, click 'completed experiments' to navigate to the **Experiments** page for that dataset filtered for the completed experiments.  If an experiment completed successfully, use the 'Actions' dropdown to download the fitted model for that experiment and a python script that can be used to run the model on other datasets.  Click elsewhere on the row to navigate to the experiment **Results** page.

### Downloading and Using Models ###
A pickled version of the fitted model and an example script for using that model can be downloded for any completed experiment from the **Experiments** page.

Please check [Demo](docs/PennAI_Demo/Demo_of_using_exported_scripts_from_PennAI.ipynb) for instructions on using the scripts and model exported from PennAI.

## Developer Info
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

# Generating and publishing production builds
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

5. Export the production images into the images directory
```
cd PROD_DIR
docker save --output pennai_lab.tar "pennai_lab:${TAG}"
docker save --output pennai_machine.tar "pennai_machine:${TAG}"
docker save --output pennai_dbmongo.tar "pennai_dbmongo:${TAG}"
```

5. Zip the production directory
6. Create a github release using the tagged production commit, and attach the zipped production directory as an archive


# Installing a production build
1. Download a production build from github
2. Unzip the archive
3. Load the images into docker with the following commands:
```
docker load --input .\images\pennai_lab.tar
docker load --input .\images\pennai_machine.tar
docker load --input .\images\pennai_dbmongo.tar
``` 

# Running from production build
1. From the pennai directory, run the command `docker-compose up` to start the PennAI server.
