from ai.pennai_sklearn import PennAIClassifier, PennAIRegressor
from sklearn.datasets import load_iris, load_boston
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
from ai.knowledgebase_utils import load_knowledgebase
from sklearn.ensemble import VotingClassifier, VotingRegressor
from os import path, remove



iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(iris.data.astype(np.float64),
    iris.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)

boston = load_boston()
X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(boston.data.astype(np.float64),
    boston.target.astype(np.float64), train_size=0.75, test_size=0.25, random_state=42)

classification_kb = "data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6-small.tsv.gz"
classification_metafeatures="data/knowledgebases/pmlb_classification_metafeatures.csv.gz"

regression_kb = "data/knowledgebases/pmlb_regression_results-small.tsv.gz"
regression_metafeatures="data/knowledgebases/pmlb_regression_metafeatures.csv.gz"

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
def test_PennAIClassifier_fit(recommender):
    """Test PennAIClassifier fit() with all Recommenders."""
    print("\nStart fit test for ", recommender.__name__)
    if recommender.__name__ not in ["CoClusteringRecommender"]:
        pennai = PennAIClassifier(
                                rec_class=recommender,
                                n_recs=2,
                                n_iters=2,
                                knowledgebase=classification_kb,
                                kb_metafeatures=classification_metafeatures,
                                random_state=42,
                                verbose=0
                               )
        pennai.fit(X_train, y_train)

        assert pennai.score(X_test, y_test)


@parameterized.expand(AllRecommenders)
def test_PennAIRegressor_fit(recommender):
    """Test PennAIRegressor fit() with all Recommenders."""
    print("\nStart fit test for ", recommender.__name__)
    if recommender.__name__ not in ["CoClusteringRecommender"]:
        pennai = PennAIRegressor(
                                rec_class=recommender,
                                n_recs=2,
                                n_iters=2,
                                knowledgebase=regression_kb,
                                kb_metafeatures=regression_metafeatures,
                                random_state=42,
                                verbose=0
                               )
        pennai.fit(X_train_reg, y_train_reg)

        assert pennai.score(X_test_reg, y_test_reg)


def test_verbose_0():
    """Test PennAIClassifier fit() with verbose=0."""

    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42,
                            verbose=0
                           )
    pennai.fit(X_train, y_train)
    assert pennai.score(X_train, y_train)


def test_n_jobs():
    """Test PennAIClassifier fit() with n_jobs=2."""

    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=4,
                            n_iters=3,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42,
                            verbose=0,
                            n_jobs=2,
                           )
    pennai.fit(X_train, y_train)
    assert pennai.score(X_train, y_train)


def test_verbose_1():
    """Test PennAIClassifier fit() with verbose=1."""

    pennai = PennAIClassifier(
                            rec_class=KNNMetaRecommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42,
                            verbose=1
                           )
    pennai.fit(X_train, y_train)
    assert pennai.score(X_train, y_train)



def test_verbose_2():
    """Test PennAIClassifier fit() with verbose=2."""

    pennai = PennAIClassifier(
                            rec_class=KNNMetaRecommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42,
                            verbose=2
                           )
    pennai.fit(X_train, y_train)
    assert pennai.score(X_train, y_train)


def test_reg_verbose_0():
    """Test PennAIRegressor fit() with verbose=0."""

    pennai = PennAIRegressor(
                            rec_class=RandomRecommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=regression_kb,
                            kb_metafeatures=regression_metafeatures,
                            random_state=42,
                            verbose=0
                           )
    pennai.fit(X_train_reg, y_train_reg)
    assert pennai.score(X_test_reg, y_test_reg)


def test_init():
    """Test PennAIClassifier __init__() can assign correct params"""
    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42
                           )

    assert pennai.n_recs == 2
    assert pennai.n_iters == 2
    assert pennai.rec_class == RandomRecommender
    assert pennai.knowledgebase == classification_kb
    assert pennai.kb_metafeatures == classification_metafeatures
    assert pennai.random_state == 42
    assert pennai.verbose == 0
    assert pennai.serialized_rec == None
    assert pennai.scoring == None
    assert pennai.config_dict == None
    assert pennai.ensemble == None
    assert pennai.max_time_mins == None
    assert pennai.stopping_criteria == None
    assert pennai.mode == "classification"
    assert pennai.n_jobs == 1


def test_fit_init():
    """Test PennAIClassifier fit_init_() works as expected."""
    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42
                           )
    pennai.fit_init_()
    assert pennai.scoring_ == "accuracy"
    assert pennai.metric_ == "accuracy"
    assert pennai.n_recs_ == 2


def test_load_kb():
    """Test PennAIClassifier load_kb can load correct kb."""
    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=2,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42
                           )
    pennai.dataset_mf_cache = pd.DataFrame()
    resultsData = pennai.load_kb()
    kb = load_knowledgebase(
                        resultsFiles=[classification_kb],
                        metafeaturesFiles=[classification_metafeatures]
                        )
    all_df_mf = kb['metafeaturesData'].set_index('_id', drop=False)
    df = all_df_mf.loc[kb['resultsData']["classification"]['_id'].unique()]
    assert pennai.dataset_mf_cache.equals(df)
    assert kb['resultsData'][pennai.mode].equals(resultsData)


def test_max_time_mins():
    """Test PennAIClassifier fit() with verbose=2."""

    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=5,
                            n_iters=10,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42,
                            verbose=2,
                            max_time_mins=0.1
                           )
    pennai.fit(X_train, y_train)
    assert pennai.score(X_train, y_train)


def test_stopping_criteria():
    """Test PennAIClassifier fit() with stopping_criteria=0.01."""

    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=2,
                            n_iters=10,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            random_state=42,
                            verbose=0,
                            stopping_criteria=3
                           )
    pennai.fit(X_train, y_train)
    assert pennai.score(X_train, y_train)


def test_ensemble():
    """Test PennAIClassifier fit() with ensemble=5."""

    pennai = PennAIClassifier(
                            rec_class=RandomRecommender,
                            n_recs=5,
                            n_iters=2,
                            knowledgebase=classification_kb,
                            kb_metafeatures=classification_metafeatures,
                            ensemble=5,
                            random_state=42,
                            verbose=0
                           )
    pennai.fit(X_train, y_train)

    assert pennai.score(X_train, y_train)
    assert pennai.ensemble
    assert pennai.estimator.__class__ == VotingClassifier

# @parameterized.expand(AllRecommenders)
# def test_save(recommender):
#     """Test PennAIClassifier save() function."""
#     print("\nSave recommender for ", recommender.__name__)
#     if recommender.__name__ not in ["AverageRecommender", "RandomRecommender", "CoClusteringRecommender"]:
#         save_path = "data/recommenders/scikitlearn/{}_classifier_accuracy_pmlb.pkl.gz".format(recommender.__name__)
#         classification_kb_full = "data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6.tsv.gz"
#         pennai = PennAIClassifier(
#                                 rec_class=recommender,
#                                 n_recs=2,
#                                 n_iters=2,
#                                 knowledgebase=classification_kb_full,
#                                 kb_metafeatures=classification_metafeatures,
#                                 random_state=42,
#                                 verbose=1
#                               )
#         pennai.fit_init_()
#         pennai.rec_engine.save(save_path)
#         assert path.isfile(save_path)
#
#
# def test_save_reg(recommender=SVDRecommender):
#     """Test PennAIClassifier save() function."""
#     print("\nSave recommender for ", recommender.__name__)
#     save_path = "data/recommenders/scikitlearn/{}_regressor_nmse_pmlb.pkl.gz".format(recommender.__name__)
#     regression_kb_full = "data/knowledgebases/pmlb_regression_results.tsv.gz"
#     regression_metafeatures="data/knowledgebases/pmlb_regression_metafeatures.csv.gz"
#     pennai = PennAIRegressor(
#                             rec_class=recommender,
#                             n_recs=2,
#                             n_iters=2,
#                             knowledgebase=regression_kb_full,
#                             kb_metafeatures=regression_metafeatures,
#                             random_state=42,
#                             verbose=1
#                           )
#     pennai.fit_init_()
#     pennai.rec_engine.save(save_path)
#     assert path.isfile(save_path)



@parameterized.expand(AllRecommenders)
def test_warm_start(recommender):
    """Test PennAIClassifier fit() with warm_start."""
    if recommender.__name__ not in ["AverageRecommender", "RandomRecommender", "CoClusteringRecommender"]:
        serialized_rec_directory = "data/recommenders/scikitlearn"
        serialized_rec_filename = "{}_classifier_accuracy_pmlb.pkl.gz".format(recommender.__name__)
        classification_kb_full = "data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6.tsv.gz"
        serialized_rec = path.join(serialized_rec_directory, serialized_rec_filename)
        pennai = PennAIClassifier(
                                rec_class=recommender,
                                n_recs=2,
                                n_iters=2,
                                serialized_rec=serialized_rec,
                                knowledgebase=classification_kb_full,
                                kb_metafeatures=classification_metafeatures,
                                random_state=42,
                                verbose=0
                               )
        pennai.fit(X_train, y_train)

        assert pennai.score(X_train, y_train)


def test_warm_start_reg(recommender=SVDRecommender):
    """Test PennAIClassifier fit() with warm_start."""
    serialized_rec_directory = "data/recommenders/scikitlearn"
    serialized_rec_filename = "{}_regressor_nmse_pmlb.pkl.gz".format(recommender.__name__)
    regression_kb_full = "data/knowledgebases/pmlb_regression_results.tsv.gz"
    serialized_rec = path.join(serialized_rec_directory, serialized_rec_filename)
    pennai = PennAIRegressor(
                            rec_class=recommender,
                            n_recs=2,
                            n_iters=2,
                            serialized_rec=serialized_rec,
                            knowledgebase=regression_kb_full,
                            kb_metafeatures=regression_metafeatures,
                            random_state=42,
                            verbose=0
                           )
    pennai.fit(X_train, y_train)

    assert pennai.score(X_train, y_train)
