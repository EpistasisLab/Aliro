# Penn AI
Engine for reading in modeling results, updating knowledge base, and making recommendations that instantiate new runs.
## workflow
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


## Deployment
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
  - docker [step one from the official Docker website](https://docs.docker.com/engine/getstarted/step_one/), [Official Docker Installation for Windows](https://docs.docker.com/docker-for-windows/install/)
  - nodejs [https://nodejs.org/en/](https://nodejs.org/en/)

3. **Build the base image**
  - It will take several minutes for the image to be built the first time this run.
  - `docker build ./dockers/base -t pennai/base:latest`  

4. **Build the service containers**
  - It will take several minutes for the images to be built the first time this run.
  - `docker-compose build`

#### Running ####
1. **Start the network and service containers**
- `docker-compose up` to create and start containers, `docker-compose up -d` to run in the background
	- Known issue:  When starting from a fresh clone of the repo, it takes a while for the lab container to initially unzip the node_modules directory, and it takes a while for the initial datasets.  See [#46](https://github.com/EpistasisLab/pennai/issues/46)

2. **Start the AI service (optional)**
  - SSH into the lab container and start the AI service
  ```
  docker attach pennai_lab_1
  cd $PROJECT_ROOT/
  python -m ai.ai -v -n 2
  ```
  - Note: if `docker attach pennai_lab_1`, use `docker container ps` to get the name of the lab container

3. **Connect to the website**
	- Connect to <http://localhost:5080/> to access the website

4. **Stop the containers**
  - `docker-compose stop` to stop the containers
  - `docker-compose down` to stop and remove containers

#### Useful dev docker commands and info ####
- `docker-compose build` - rebuild the images for all services (lab, machine, dbmongo) if their dockerfiles or the contents of their build directories have changed. See [docs](https://docs.docker.com/compose/reference/build/)
	- **NOTE:** docker-compose will **not** rebuild the base image; if you make changes to the base image rebuild as per step 3.
- `docker-compose build lab --no-cache` - rebuild the image for the lab services without using the cache.
- `docker rm $(docker ps -a -q)` - remove all docker containers
- `docker rmi $(docker images -q)` - remove all docker images
- `docker attach pennai_lab_1` to gain ssh access to the a running container


### Container Based Install (Deprecated; node scripts in /awsm, will be removed if docker-compose is confirmed to work on multiple systems)
1. **Check out the project**

  - Clone the repository from  <b>git@github.com:EpistasisLab/pennai.git</b>
  - switch to pennai_build_test branch
  ```shell
  git clone git@github.com:EpistasisLab/pennai.git
  cd pennai
  git checkout pennai_lite
  ```

2. **Install build requirements**

  - docker [step one from the official Docker website](https://docs.docker.com/engine/getstarted/step_one/)
  - nodejs [https://nodejs.org/en/](https://nodejs.org/en/)
  - make (optional) [http://gnuwin32.sourceforge.net/packages/make.htm](http://gnuwin32.sourceforge.net/packages/make.htm),[https://developer.apple.com/] (https://developer.apple.com),[https://wiki.ubuntu.com/ubuntu-make] (https://wiki.ubuntu.com/ubuntu-make),[https://www.gnu.org/software/make/](https://www.gnu.org/software/make)

3. **Modify Makevars** (optional)

  - copy the dockers/Makevars.example file to dockers/Makevars and edit to suite your environment

4. **Copy/Edit `experiment.json`**

  ```
  cp .\experiment.example.json .\experiment.json
  #Change "IP:127.0.0.1" to your IP address in experiment.json for export ports for external access (Note: you need set up your firewalls for security on those ports)


  ```

5. **Start the network**

  - run node pennai.  This may take a very long time the first time!
  ```shell
  docker network create pennai
  # build pennai locally and start
  npm install
  node pennai rebuild -sv
  ```

  - start AI function (need refine)
  ```
  docker attach lab
  cd $PROJECT_ROOT/
  python -m ai.ai -v -n 2
  ```

6. **Test the lab**
	- Connect to:
    	- http://localhost:5080/

Fedora/Redhat/Systems with SELinux:
chcon -Rt svirt_sandbox_file_t ${SHARE_PATH}

7. **Stop the network and docker containers**
  ```
  node pennai stop
  ```

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

See [Documentation](https://github.com/EpistasisLab/pennai/blob/pennai_lite/tests/integration/readme.md) for details.

### Unit ###
**Unit tests for python codes**
  -  need install nose via `pip install nose`

      ```
      nosetests -s -v tests\learn_tests.py
      ```
     
