from ai.pennai_sklearn import PennAIClassifier
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd
from parameterized import parameterized
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
from ai.recommender.surprise_recommenders import (CoClusteringRecommender,
        KNNWithMeansRecommender, KNNDatasetRecommender, KNNMLRecommender,
        SlopeOneRecommender, SVDRecommender)

TEST_OUTPUT_PATH = "target/test_output/test_sklearn_api"

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data.astype(np.float64),
    iris.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)

classification_kb = "data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6-small.tsv.gz"
classification_metafeatures="data/knowledgebases/pmlb_classification_metafeatures.csv.gz"

def AllRecommenders():
    return [
            (AverageRecommender,),
            (RandomRecommender,),
            (KNNMetaRecommender,),
            (CoClusteringRecommender,),
            (KNNWithMeansRecommender,),
            (KNNDatasetRecommender,),
            (KNNMLRecommender,),
            (SlopeOneRecommender,),
            (SVDRecommender,)
            ]

@parameterized.expand(AllRecommenders)
def test_fit_RandomRecommender(recommender):
    """Test PennAIClassifier fit() with all Recommenders."""
    print("\nStart fit test for ", recommender.__name__)
    pennai = PennAIClassifier(
                            rec_class=recommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42
                           )
    pennai.fit(X_train, y_train)
    assert pennai.score(X_train, y_train)
