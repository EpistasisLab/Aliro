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

5. Build the service images by running `docker-compose build` from the pennai directory.  It will take several minutes for the images to be built the first time this run.

## Usage
### Starting and Stopping ###
To start PennAI, from the PennAI directory run the command `docker-compose up --force-recreate`.  To stop PennAI, kill the process with `ctrl+c` and then run the command `docker-compose down`.

- Note: If `docker-compose up` was previously run but `docker-compose down` was not, when running `docker-compose up` again without flag `--force-recreate` the webserver will start but no experiments will be able to be run.  Try stopping the containers, then run `docker-compose down` followed by `docker-compose up`, or use the `--force-recreate` flag when running `docker-compose up`.  See issue [#52](https://github.com/EpistasisLab/pennai/issues/52).

### Analyzing Data ###
Once the webserver is up, connect to <http://localhost:5080/> to access the website.  You should see the **Datasets** page with ~50 test datasets, starting with 'Allbp'.  To run an experiment, from the click 'Build New Experiment', choose the desired algorithm and experiment parameters and click 'Launch Experiment'.  To start the AI, from the **Datasets** page click the AI toggle.  The AI will start issuing experiments according to the parameters in `config/ai.config`.

From the **Datasets** page, click 'completed experiments' to navigate to the **Experiments** page for that dataset filtered for the completed experiments.  If an experiment completed successfully, use the 'Actions' dropdown to download the fitted model for that experiment and a python script that can be used to run the model on other datasets.  Click elsewhere on the row to navigate to the experiment **Results** page.


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
