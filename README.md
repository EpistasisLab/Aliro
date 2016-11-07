#getting up and running:
*install Node.js
+create the directory - /share/devel/Gp
+request an account on sarlacc if you don't already have one
+clone the repository from  git@sarlacc.pmacs.upenn.edu:svitale/Gp.git 

You may choose to run FGLab within a docker container (easiest to get up and running) or locally (easiest for Windows users) or mixed (easiest for development)

##Local Install:
+Install Node.js
+Install MongoDB
+change directories to /share/devel/Gp/dockers/lab/files
+extract the contents of mongodump.tgz into /share/devel/Gp/dockers/lab/files/dump
+run 'mongorestore' to populate the mongo database
+change directories to /share/devel/Gp/lab
+run 'npm install'
+create a .env file with the following contents:

>MONGODB_URI=mongodb://127.0.0.1:27017/FGLab
>FGLAB_PORT=5080

+change directories to /share/devel/Gp/machine
+run 'npm install'
+create a .env file with the following contents:

>FGLAB_URL=http://localhost:5080
>GMACHINE_URL=http://localhost:5081



##Docker Install:
###Install Docker:
[Step One](https://docs.docker.com/engine/getstarted/step_one/)
+Create a network for the lab and machine to use to communicate:
>docker network create dockernet


###Install the lab:
+change directories to /share/devel/Gp/dockers/lab
+On a system with 'make' installed:
>make
>make run

Alternatively, you can manually run these steps with the following commands:

>docker build -t devel/lab`
>docker run -i -t --rm -p 5080:5080 --network dockernet -h lab --name lab devel/lab`


        
###Install the machine: 
+change directories to /share/devel/Gp/dockers/machine
+On a system with 'make' installed:
>run 'make', then 'make run' to start FGLab

Alternatively, you can manually run these steps with the following commands:
>docker build -t devel/machine
>docker run -i -t --rm -p 5081:5081 --network dockernet -h machine --name machine devel/machine`


###Test the lab:
+connect to 
>http://localhost:5080/

