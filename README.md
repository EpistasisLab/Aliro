note: you don't need to run both step #2 <i>AND</i> step #3.  A local Install may be simplest if you are on a mac or windows.

1. **Check out the project**
	- Create the directory <b>/share/devel/Gp</b>
	- Request an account on sarlacc if you don't already have one
 	- Clone the repository from  <b>git@sarlacc.pmacs.upenn.edu:svitale/Gp.git</b>
 
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

3. **Perform Docker Install**
	- Follow [step one from the official Docker website](https://docs.docker.com/engine/getstarted/step_one/) to install Docker
	- Create a network for the lab and machine to use to communicate:
	    - <i>docker network create dockernet</i>
	- Install the lab
    	- Change directories to <b>/share/devel/Gp/dockers/lab</b>
    	- On a system with 'make' installed:
        	- <i>make && make run</i>
    	- Alternatively, you can manually run these steps with the following commands:
        	- <i>docker build -t devel/lab</i>
        	- <i>docker run -i -t --rm -p 5080:5080 --network dockernet -h lab --name lab devel/lab</i>
    - Install the machine: 
	    - Change directories to <b>/share/devel/Gp/dockers/machine</b>
      	- On a system with 'make' installed:
    	    - <i>make && make run</i>
    	- Alternatively, you can manually run these steps with the following commands:
        	- <i>docker build -t devel/machine</i>
        	- <i>docker run -i -t --rm -p 5081:5081 --network dockernet -h machine --name machine devel/machine</i>


3. **Test the lab**
	- Connect to:
    	- http://localhost:5080/

