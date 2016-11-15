note: you don't need to run both step #2 <i>AND</i> step #3.  A local Install may be simplest if you are on a mac or windows.

1. **Check out the project**
	- Create the directory <b>/share/devel/Gp</b>
	- Request an account on sarlacc if you don't already have one
 	- Clone the repository from  <b>git@sarlacc.pmacs.upenn.edu:svitale/Gp.git</b> into /share/devel/Gp
 
2. **Perform local based installation**
	- Install [MongoDB] (https://www.mongodb.com/download-center#community)
	- Change directories to <b>/share/devel/Gp/dockers/lab/files</b>
	- Extract the contents of mongodump.tgz into /share/devel/Gp/dockers/lab/files/dump
	- Run <i>mongorestore</i> to populate the mongo database
	- Change directories to <b>/share/devel/Gp/lab</b>
	- Run <i>npm install<i>
	- Change directories to <b>/share/devel/Gp/machine</b>
	- Run <i>npm install<i>

3. **Perform Docker based installation**
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

