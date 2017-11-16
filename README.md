**Container Based Install**
1. **Check out the project**
        - Clone the repository from  <b>git@github.com:EpistasisLab/Gp.git</b>

2. **Install build requirements**
        - docker [step one from the official Docker website](https://docs.docker.com/engine/getstarted/step_one/)
        - nodejs [https://nodejs.org/en/](https://nodejs.org/en/)
        - make (optional) [http://gnuwin32.sourceforge.net/packages/make.htm](http://gnuwin32.sourceforge.net/packages/make.htm),[https://developer.apple.com/] (https://developer.apple.com),[https://wiki.ubuntu.com/ubuntu-make] (https://wiki.ubuntu.com/ubuntu-make),[https://www.gnu.org/software/make/](https://www.gnu.org/software/make)
3. **Modify Makevars**
        - copy the dockers/Makevars.example file to dockers/Makevars and edit to suite your environment

4. **Start the network**
        - run node dockers/make.js.  This may take a very long time the first time!

Fedora/Redhat/Systems with SELinux:
chcon -Rt svirt_sandbox_file_t ${SHARE_PATH}

**Host Based Install**
1. **Check out the project**
        - Clone the repository from  <b>git@github.com:EpistasisLab/Gp.git</b>
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

