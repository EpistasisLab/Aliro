#  User Guide of PennAIpy

### Installation of AI engine as a standalone python package ###
PennAI AI engine is built on top of several existing Python libraries, including:

* [NumPy](http://www.numpy.org/)

* [SciPy](https://www.scipy.org/)

* [scikit-learn](http://www.scikit-learn.org/)

* [pandas](http://pandas.pydata.org)

* [joblib](https://joblib.readthedocs.io/en/latest/)

* [surprise](http://surpriselib.com/)

* [simplejson](https://simplejson.readthedocs.io/en/latest/)


Most of the necessary Python packages can be installed via the [Anaconda Python distribution](https://www.anaconda.com/products/individual), which we strongly recommend that you use.

You can install PennAI AI engine using `pip`.

NumPy, SciPy, scikit-learn, pandas and joblib can be installed in Anaconda via the command:

```Shell
conda install numpy scipy scikit-learn pandas joblib simplejson
```

Surprise was tweaked for the PennAI AI engine and it can be install with `pip` via the command below. **Note: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) is required for building the surprise package in Windows OS. Please download and run the installer with selecting "C++ Build tools". Additionally, the latest version of [`cython`](https://cython.org) is required and it can be installed/updated via `pip install --upgrade cython`.**

```Shell
pip install --no-cache-dir git+https://github.com/lacava/surprise.git@1.1.1.1
```

Finally to install AI engine itself, run the following command:

```Shell
pip install pennaipy
```

### Example of using PennAI AI engine ###

The following code illustrates how PennAI can be employed for performing a simple _classification task_ over the Iris dataset.

```Python
from pennai.sklearn import PennAIClassifier
from pennai.recommender import KNNMetaRecommender
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data.astype(np.float64),
    iris.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)

pennai = PennAIClassifier(
              rec_class=KNNMetaRecommender,
              n_recs=5,
              n_iters=10,
              random_state=42,
              verbose=2
              )

pennai.fit(X_train, y_train)
print(pennai.score(X_test, y_test))

```

### Default knowledgebase/metafeatures of PennAI AI engine

If you don't specify `knowledgebase` and `kb_metafeatures` in `PennAIClassifier` or `PennAIRegressor`, PennAI AI engine will use default knowledgebase based on [pmlb](https://github.com/EpistasisLab/penn-ml-benchmarks)(version0.3).

|                | Default Knowledgebase                          | Default Metafeatures                    |
|----------------|------------------------------------------------|-----------------------------------------|
| Classification | [sklearn-benchmark-data-knowledgebase-r6.tsv.gz](https://github.com/EpistasisLab/pennai/blob/master/data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6.tsv.gz) | [pmlb_classification_metafeatures.csv.gz](https://github.com/EpistasisLab/pennai/blob/master/data/knowledgebases/pmlb_classification_metafeatures.csv.gz) |
| Regression     | [pmlb_regression_results.tsv.gz](https://github.com/EpistasisLab/pennai/blob/master/data/knowledgebases/pmlb_regression_results.tsv.gz)                 | [pmlb_regression_metafeatures.csv.gz](https://github.com/EpistasisLab/pennai/blob/master/data/knowledgebases/pmlb_regression_metafeatures.csv.gz)     |


### Example of using PennAI AI engine with non-default knowledgebase/metafeature. ###


```Python
from pennai.sklearn import PennAIClassifier
from pennai.recommender import KNNMetaRecommender
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data.astype(np.float64),
    iris.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)

classification_kb = "https://github.com/EpistasisLab/pennai/raw/ai_sklearn_api/data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz"
classification_metafeatures="https://github.com/EpistasisLab/pennai/raw/ai_sklearn_api/data/knowledgebases/pmlb_classification_metafeatures.csv.gz"

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

### Example of using PennAI AI engine with pre-trained SVG recommender ###

The pre-trained SVG recommender is provided for saving computational time for initializing the recommender with default knowledgebase in PennAI. The following code illustrates how to use the pre-trained SVG recommender:

```Python
from pennai.sklearn import PennAIClassifier
from pennai.recommender import SVDRecommender
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import urllib
import numpy as np



iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data.astype(np.float64),
    iris.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)

# download pre-trained SVG recommender for pennai's github
urllib.request.urlretrieve("https://github.com/EpistasisLab/pennai/raw/ai_sklearn_api/data/recommenders/scikitlearn/SVDRecommender_classifier_accuracy_pmlb.pkl.gz", "SVDRecommender_classifier_accuracy_pmlb.pkl.gz")
serialized_rec = "SVDRecommender_classifier_accuracy_pmlb.pkl.gz"

pennai = PennAIClassifier(
              rec_class=SVDRecommender,
              n_recs=5,
              n_iters=10,
              serialized_rec=serialized_rec,
              random_state=42,
              verbose=2
              )

pennai.fit(X_train, y_train)
print(pennai.score(X_test, y_test))

```
