PennAI is an easy-to-use data science assistant. It allows researchers without machine learning or coding expertise to run supervised machine learning analysis through a clean web interface. It provides results visualization and reproducible scripts so that the analysis can be taken anywhere. And, it has an AI assistant that can choose the analysis to run for you.


Starting and Stopping
---------------------
PennAI requires that Docker version 17.06.0 or greater be installed.

To start PennAI, from the command line navigate to the PennAI directory and run the command `docker-compose up`. To stop PennAI, kill the process with ctrl+c and wait for the server to shut down. It may take a few minutes to build the first time PennAI is run.

Once the webserver is up, connect to http://localhost:5080/ to access the website. You should see the Datasets page. If it is your first time starting PennAI, there should be a message instructing one to add new datasets.


More Information
----------------
For instructions to get started with performing machine learning analysis, please refer to the Analysis Quickstart Guide:
https://epistasislab.github.io/pennai/quickstart.html

For general usage information, please refer to the User Guide:
https://epistasislab.github.io/pennai/userguide.html#using-pennai
