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
  - switch to awsm branch
  ```shell
  git clone git@github.com:EpistasisLab/pennai.git
  cd pennai
  ```

2. **Install build requirements**

  - docker [step one from the official Docker website](https://docs.docker.com/engine/getstarted/step_one/)
  - nodejs [https://nodejs.org/en/](https://nodejs.org/en/)
  - make (optional) [http://gnuwin32.sourceforge.net/packages/make.htm](http://gnuwin32.sourceforge.net/packages/make.htm),[https://developer.apple.com/] (https://developer.apple.com),[https://wiki.ubuntu.com/ubuntu-make] (https://wiki.ubuntu.com/ubuntu-make),[https://www.gnu.org/software/make/](https://www.gnu.org/software/make)

3. **Modify Makevars** (optional)

  - copy the dockers/Makevars.example file to dockers/Makevars and edit to suite your environment
 
4. **Modify `experiment.json`**

  - edit "SHARE_PATH" and "IP" in `experiment.json`
    - "SHARE_PATH" to directory of pennai repository  

5. **Start the network**

  - run node pennai.  This may take a very long time the first time!
  ```shell
  docker network create pennai
  # build pennai locally
  npm install
  node pennai build
  # start pennai
  node pennai start
  ```
        

Fedora/Redhat/Systems with SELinux:
chcon -Rt svirt_sandbox_file_t ${SHARE_PATH}

**Host Based Install**
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
