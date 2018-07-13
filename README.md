# Penn AI
A data science assistant for generating useful results from large and complex data problems.


## Setup and Deployment
### Container Based Install ([Docker-Compose](https://docs.docker.com/compose/))
#### Installation ####
1. **Check out the project**

  - Clone the repository from  <b>git@github.com:EpistasisLab/pennai.git</b>
  - Switch to pennai_lite branch
  ```shell
  git clone git@github.com:EpistasisLab/pennai.git
  cd pennai
  git checkout pennai_lite
  ```

2. **Install build requirements**
  - Docker 
  	- [Official Docker Website Getting Started](https://docs.docker.com/engine/getstarted/step_one/)
	- [Official Docker Installation for Windows](https://docs.docker.com/docker-for-windows/install/)
  - Python and nose test runner (optional, needed to run unit tests) 
  	- [Python 3.* ](https://www.python.org/downloads/)
  	- install [nose](https://pypi.org/project/nose/) via `pip install nose`
  - nodejs (optional, can be helpful for local development)
  	- [https://nodejs.org/en/](https://nodejs.org/en/)

3. **Build the base image**
  - It will take several minutes for the image to be built the first time this run.
  - `docker build ./dockers/base -t pennai/base:latest`  

4. **Build the service containers**
  - It will take several minutes for the images to be built the first time this run.
  - `docker-compose build`

#### Running ####
1. **Start the network and service containers**
- `docker-compose up` to create and start containers, `docker-compose up -d` to run in the background
	- Known issue:  If docker-compose was previously running and `docker-compose down` was not run, the machine state will be out of sync with the database and experiments will not be able to be run.

2. **Connect to the lab container and start the AI service (optional, and this will soon be unnecessary as the AI will be started automatically)**
  - Attach to the lab container with bash and start the AI service
  ```
  docker exec -it "pennai_lab_1" /bin/bash 
  cd $PROJECT_ROOT/
  python -m ai.ai -v -n 2
  ```
  - Note: If `docker exec -it "pennai_lab_1" /bin/bash ` returns 'Error: no such container', use `docker container ps` to get the name of the lab container
  - Note: `docker attach pennai_lab_1` will attach to the lab container, but if the last command run by the startup script was not bash it will appear to hang.

3. **Connect to the website**
	- Connect to <http://localhost:5080/> to access the website

4. **Stop the containers**
  - `docker-compose stop` to stop the containers
  - `docker-compose down` to stop and remove containers and network

#### Useful dev docker commands and info ####
- `docker-compose build` - rebuild the images for all services (lab, machine, dbmongo) if their dockerfiles or the contents of their build directories have changed. See [docs](https://docs.docker.com/compose/reference/build/)
	- **NOTE:** docker-compose will **not** rebuild the base image; if you make changes to the base image rebuild as per step 3.
- `docker-compose build lab --no-cache` - rebuild the image for the lab services without using the cache.
- `docker rm $(docker ps -a -q)` - remove all docker containers
- `docker rmi $(docker images -q)` - remove all docker images
- `docker exec -it "container_name" /bin/bash` to attach to a running container with a bash prompt


### Host Based Install (Deprecated)
1. **Check out the project**
        - Clone the repository from  <b>git@github.com:EpistasisLab/pennai.git</b>
2. **Perform Local Install**
	- Install MongoDB
	- Change directories to <b>/share/devel/Gp/dockers/lab/files</b>
	- Extract the contents of mongodump.tgz into /share/devel/Gp/dockers/lab/files/dump
	- Run <i>mongorestore</i> to populate the mongo database
	- Change directories to <b>/share/devel/Gp/lab</b>
	- Run <i>npm install</i>
	- Create a .env file with the following contents:
    	- <b>MONGODB_URI=mongodb://127.0.0.1:27017/FGLab</b>
    	- <b>FGLAB_PORT=5080</b>
	- Change directories to <b>/share/devel/Gp/machine</b>
	- Create a file called '.env' with the following contents:
	- <b>FGLAB_URL=http://localhost:5080</b>
	- <b>FGMACHINE_URL=http://localhost:5081</b>
    - copy /share/devel/Gp/dockers/machine/files/projects.json to /share/devel/Gp/machine
	- Run <i>npm install</i>
	- Create a .env file with the following contents:
    	- <b>FGLAB_URL=http://localhost:5080</b>
    	- <b>FGMACHINE_URL=http://localhost:5081</b>

3. **Test the lab**
	- Connect to:
    	- http://localhost:5080/

## Testing ##

### Integration ###
To run the integration tests, from the root app directory run: `docker-compose -f .\docker-compose-int-test.yml up --abort-on-container-exit`

This will spin up lab, machine, and dbmongo containers as well as an integration test container that will run the Jest test suites and exit.

The results will be in the folder `.\tests\integration\results`

See [Documentation](https://github.com/EpistasisLab/pennai/blob/pennai_lite/tests/integration/readme.md) for details.


### Unit ###
#### AI ####
**Unit tests for python codes**
  -  need install nose via `pip install nose`

      ```
      nosetests -s -v ai/tests/test_recommender.py # tests recommender
      ```

#### Machine ####
  -  need install nose via `pip install nose`

      ```
      # run under dir of machine
      nosetests -s -v test\learn_tests.py
      ```
      
See [Documentation](https://github.com/EpistasisLab/pennai/blob/pennai_lite/machine/README.md) for details.

#### Lab ####
Coming soon.



## AI Recommender Details
Engine for reading in modeling results, updating knowledge base, and making recommendations that instantiate new runs.

### Workflow
 - The Penn AI agent looks for new requests for recommendations and new experimental results every 5 seconds.
 - when a new experiment is found, it is used to update the recommender.
 - when a new request is received, the AI retreives a recommendation from the recommender and pushes it to the user.
 
### Recommender
```python
pennai = Recommender(method='ml_p',ml_type='classifier')
# data: a dataframe of results from database
pennai.update(results_data)
```
 - given a new modeling task, the AI recommends an ML method with parameter values (P)
```python
# dataset_metafeatures: an optional set of metafeatures of the dataset to assist in recommendations
ml,p = pennai.recommend(dataset_metafeatures=None)
```
 - the ML+P recommendation is run on the dataset using the AI system

```python
ai.send_rec()
```
 - the results are used to update the recommender
```python
pennai.update(new_results_data)
```
## overall tasks
 - [x] build dataframe `results_data` from MongoDB results.
 - [x] make method to post job submissions
 - [ ] recommendation shows up in launch page

## recommender tasks
- [x] filter recommendations for what has already been run
- [x] direct acess to MongDB results for checking what has been run

recommendations using:
 - [x] ml + p
 - [ ] ml + p + mf
 - [ ] ml + p + mf, per model basis
 - [ ] incorporating expert knowledge rules
 - [ ] analyze which metafeatures are important
 - [x] make method to submit jobs (`submit(dataset,ml,p)`)
