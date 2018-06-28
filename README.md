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



**Container Based Install**
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

7. **Log and error information**
	- Check if all the dockers container are running.
		```
		docker ps
		```
		- stdout example
		```
		CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS
              NAMES
		d4ad130c87eb        pennai/dbmongo      "/bin/bash /root/ent…"   2 hours ago         Up 2 hours          127.0.0.1:27017->27017/tcp   dbmongo
		65b8514e5f6d        515f2d36a67d        "/root/entrypoint.sh"    2 hours ago         Up 2 hours          127.0.0.1:5080->5080/tcp     lab
		91141272ac16        pennai/dbredis      "docker-entrypoint.s…"   2 hours ago         Up 2 hours          127.0.0.1:6379->6379/tcp     dbredis
		b966455ea8e0        pennai/machine      "/bin/bash /root/sta…"   2 hours ago         Up 2 hours          127.0.0.1:5081->5081/tcp     machine
		76e967cad1ab        pennai/paix01       "/bin/bash /root/ent…"   2 hours ago         Up 2 hours					paix01
		d1b4276df651        pennai/paiwww       "/bin/bash /root/sta…"   2 hours ago         Up 2 hours          127.0.0.1:443->443/tcp       paiwww
		```
	- If the machine is not working or experiments failed:
		```
		docker attach machine
		cd ~\.pm2\logs # check log files of stdout and stderr 
		```
	- If the website is not accessible and `pm2` is running
		```
		docker attach lab
		cd ~\.pm2\logs # check log files of stdout and stderr
		```
	- If the website is not accessiable and `pm2` is not running
		```
		docker attach lab
		# Check PROJECT_ROOT
		cd $PROJECT_ROOT
		# make sure there are .env file are node_modules folder
		# if not, check the commands in dockers\lab\files\entrypoint.sh for reruning initial steps for error messages.
		```

**Host Based Install (Deprecated)**
1. **Check out the project**
        - Clone the repository from  <b>git@github.com:EpistasisLab/pennai.git</b>
2. **Perform Local Install**
	- Install MongoDB
	- Change directories to <b>/share/devel/Gp/dockers/lab/files</b>
	- Extract the contents of mongodump.tgz into /share/devel/Gp/dockers/lab/files/dump
	- Run <i>mongorestore</i> to populate the mongo database
	- Change directories to <b>/share/devel/Gp/lab</b>
	- Run <i>npm install<i>
	- Create a .env file with the following contents:
    	- <b>MONGODB_URI=mongodb://127.0.0.1:27017/FGLab</b>
    	- <b>FGLAB_PORT=5080</b>
	- Change directories to <b>/share/devel/Gp/machine</b>
	- Create a file called '.env' with the following contents:
	- <b>FGLAB_URL=http://localhost:5080</b>
	- <b>FGMACHINE_URL=http://localhost:5081</b>
    - copy /share/devel/Gp/dockers/machine/files/projects.json to /share/devel/Gp/machine
	- Run <i>npm install<i>
	- Create a .env file with the following contents:
    	- <b>FGLAB_URL=http://localhost:5080</b>
    	- <b>FGMACHINE_URL=http://localhost:5081</b>

3. **Test the lab**
	- Connect to:
    	- http://localhost:5080/

**Unit tests for python codes**
  -  need install nose via `pip install nose`

      ```
      nosetests -s -v tests\learn_tests.py
      ```
