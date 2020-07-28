#  User Guide
PennAI is a platform to help researchers leverage supervised machine learning techniques to analyze data without needing an extensive data science background, and can also assist more experienced users with tasks such as choosing appropriate models for data.  Users interact with PennAI via a web interface that allows them to execute machine learning experiments and explore generated models, and has an AI recommendation engine that will automatically choose appropriate models and parameters.  Dataset profiles are generated and added to a knowledgebase as experiments are run, and the recommendation engine learns from this to give more informed recommendations as it is used.  This allows the AI recommender to become tailored to specific data environments.  PennAI comes with an initial knowledgebase generated from the PMLB benchmark suite.


## Installation
PennAI is a multi-container docker project that uses ([Docker-Compose](https://docs.docker.com/compose/)).

### Requirements
  - Docker
    - Most recent stable release, minimum version is 17.06.0
      - [Official Docker Website Getting Started](https://docs.docker.com/engine/getstarted/step_one/)
      - [Official Docker Installation for Windows](https://docs.docker.com/docker-for-windows/install/)
    - **Runtime Memory**: (Mac and Windows only) If using **Windows** or **Mac**, we recommend docker VM to be configured with at least 6GB of runtime memory ([Mac configuration](https://docs.docker.com/docker-for-mac/#advanced), [Windows configuration](https://docs.docker.com/docker-for-windows/#advanced)).  By default, docker VM on Windows or Mac starts with 2G runtime memory.
    - **File Sharing**: (Windows only)  Share the drive that will contain the PennAI directory with Docker by opening Docker Desktop, navigating to Resources->File Sharing and sharing the drive. [Docker Desktop File Sharing](https://docs.docker.com/docker-for-windows/#file-sharing)
  - Docker-Compose (Version 1.22.0 or greater, Linux only) - Separate installation is only needed for linux, docker-compose is bundled with windows and mac docker installations
  	- [Linux Docker-Compose Installation](https://docs.docker.com/compose/install/)

### Installation
1. Download the production zip `pennai-0_13.zip` from the asset section of the [latest release](https://github.com/EpistasisLab/pennai/releases/latest) (note that this is different from the source code zip file).
2. Unzip the archive

## Using PennAI

### Starting and Stopping
To start PennAI, from the command line, navigate to the PennAI directory run the command `docker-compose up`.  To stop PennAI, kill the process with `ctrl+c` and wait for the server to shut down.  It may take a few minutes to build the first time PennAI is run.

To reset the datasets and experiments in the server, start PennAI with the command `docker-compose up --force-recreate`  or run the command `docker-compose down` after the server has stopped.

### User Interface
Once the webserver is up, connect to <http://localhost:5080/> to access the website.  You should see the **Datasets** page.  If it is your first time starting PennAI, there should be a message instructing one to add new datasets.

### Adding Datasets
One can add new datasets using a UI form within the website or manually add new datasets to the data directory.  Datasets have the following restrictions:
* Datasets must have the extension .csv or .tsv
* Datasets cannot have any null or empty values
* Dataset features must be either numeric, categorical, or ordinal.
* Only the label column or categorical or ordinal features can contain string values.
* Files must be smaller then 8mb

Some example datasets can be found in the classification section of the [Penn Machine Learning Benchmarks](https://github.com/EpistasisLab/penn-ml-benchmarks/tree/master/datasets/classification) github repository.

#### Uploading Using the Website ####
To upload new datasets from the website, click the "Add new Datasets" button on the Datasets page to navigate to the upload form. Select a file using the form's file browser and enter the corresponding information about the dataset: the name of the dependent column, a JSON of key/value pairs of ordinal features, for example ```{"ord" : ["first", "second", "third"]}```, and a comma separated list of categorical column names without quotes, such as `cat1, cat2`. Once uploaded, the dataset should be available to use within the system.


#### Adding Initial Datasets to the Data Directory ####
Labeled datasets can also be loaded when PennAI starts by adding them to the `data/datasets/user` directory.  PennAI must be restarted if new datasets are added while it is running.  If errors are encountered when validating a dataset, they will appear in a log file in `target/logs/loadInitialDatasets.log` and that dataset will not be uploaded.  Data can be placed in subfolders in this directory.



An optional json configuration file can be provided with each dataset to specify the column that contains the label, the prediction type (classification or regression), and any categorical or ordinal features.  By default, the label column is assumed to be 'class', the prediction type for the dataset is assumed to be classification, and all fields are numeric.


The coresponding configuration file must be in the same directory as the dataset.  If the file is named `myDatafile.*sv`, the configuration file must be named `myDatafile_metadata.json`
* Example configuration file:

```
{
	"target_column":"my_custom_target_column_name",
  "prediction_type":"classification",
	"categorical_features" : ["cat1", "cat2"],
	"ordinal_features" : {"ord" : ["first", "second", "third"]}
}
```

### Analyzing Data ###
To run a classification machine learning experiment, from the click 'Build New Experiment', choose the desired algorithm and experiment parameters and click 'Launch Experiment'.  To start the AI, from the **Datasets** page click the AI toggle.  The AI will start issuing experiments according to the parameters in `config/ai.config`.  This file can be modified to change the recommendation engine being used and how may recommendations the AI will give.  By default, the AI will make 10 recommendations.

From the **Datasets** page, click 'completed experiments' to navigate to the **Experiments** page for that dataset filtered for the completed experiments.  If an experiment completed successfully, use the 'Actions' dropdown to download the fitted model for that experiment and a python script that can be used to run the model on other datasets.  Click elsewhere on the row to navigate to the experiment **Results** page.

### Downloading and Using Models ###
A pickled version of the fitted model and an example script for using that model can be downloded for any completed experiment from the **Experiments** page.

Please see the [jupiter notebook script demo](https://github.com/EpistasisLab/pennai/blob/production/docs/PennAI_Demo/Demo_of_using_exported_scripts_from_PennAI.ipynb) for instructions on using the scripts and model exported from PennAI to reproduce the findings on the results page and classify new datasets.

### Installation of AI engine as a standalone python package ###
PennAI AI engine is built on top of several existing Python libraries, including:

* [NumPy](http://www.numpy.org/)

* [SciPy](https://www.scipy.org/)

* [scikit-learn](http://www.scikit-learn.org/)

* [update_checker](https://github.com/bboe/update_checker)

* [pandas](http://pandas.pydata.org)

* [joblib](https://joblib.readthedocs.io/en/latest/)

* [surprise](http://surpriselib.com/)


Most of the necessary Python packages can be installed via the [Anaconda Python distribution](https://www.continuum.io/downloads), which we strongly recommend that you use.

You can install PennAI AI engine using `pip`. # todo
## pip

NumPy, SciPy, scikit-learn, pandas and joblib can be installed in Anaconda via the command:

```Shell
conda install numpy scipy scikit-learn pandas joblib
```

update_checker can be installed with `pip` via the command:

```Shell
pip install update_checker
```

Surprise was tweaked by William La Cava for PennAI AI engine and it can be install with `pip` via the command:

```Shell
pip install --no-cache-dir git+https://github.com/lacava/surprise.git@master
```

Finally to install AI engine itself, run the following command:

```Shell
# todo
pip install pennai-ai-engine
```

### Example of using PennAI AI engine ###

The following code illustrates how PennAI can be employed for performing a simple _classification task_ over the Iris dataset.

```Python
from ai.pennai_sklearn import PennAIClassifier
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data.astype(np.float64),
    iris.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)

classification_kb = "data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6-small.tsv.gz"
classification_metafeatures="data/knowledgebases/pmlb_classification_metafeatures.csv.gz"

pennai = PennAIClassifier(
              rec_class=KNNMetaRecommender,
              n_recs=5,
              n_iters=10,
              knowledgebase=classification_kb,
              kb_metafeatures=classification_metafeatures,
              random_state=42,
              verbose=2
              )

pennai.fit(X_train, y_train)
print(pennai.score(X_test, y_test))

```

### Example of using PennAI AI engine with pre-trained SVG recommender###

The pre-trained SVG recommender is provided for saving computational time for initializing the recommender with default knowledgebase in PennAI. The following code illustrates how to use the pre-trained SVG recommender:

```Python
from ai.pennai_sklearn import PennAIClassifier
from ai.recommender.surprise_recommenders import SVDRecommender
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np



iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data.astype(np.float64),
    iris.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)


classification_metafeatures="data/knowledgebases/pmlb_classification_metafeatures.csv.gz"
serialized_rec_directory = "data/recommenders"
serialized_rec_filename = "SVDRecommender_classifier_accuracy_pmlb.pkl.gz"
classification_kb_full = "data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6.tsv.gz"

pennai = PennAIClassifier(
              rec_class=SVDRecommender,
              n_recs=5,
              n_iters=10,
              serialized_rec_directory=serialized_rec_directory,
              serialized_rec_filename=serialized_rec_filename,
              knowledgebase=classification_kb_full,
              kb_metafeatures=classification_metafeatures,
              random_state=42,
              verbose=2
              )

pennai.fit(X_train, y_train)
print(pennai.score(X_test, y_test))

```
