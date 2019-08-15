import unittest
from nose.tools import nottest, raises, assert_equals
import ai.metalearning.get_metafeatures as mf
import pandas as pd
from ai.metalearning.dataset_describe import Dataset
import os

package_directory = os.path.dirname(os.path.abspath(__file__))


class Dataset_Describe(unittest.TestCase):

    def setUp(self):
        self.irisPath = os.path.join(package_directory, 'iris.csv')
        self.irisTarget = "Name"

        self.tipsPath = os.path.join(package_directory, 'tips.csv')

        #dataset that contains string values
        self.appendicitisStringPath = os.path.join(package_directory, 'appendicitis_cat_ord.csv')

        #row permutation of the iris dataset
        self.irisPermutePath = os.path.join(package_directory, 'iris_permute.csv')

        self.depColMetafeature = "dependent_col_val"

        self.expectedMetafeatureKeys = [
            "dependent_col_val",
            "metafeature_version",
            "dataset_hash",
            "n_rows",
            "n_columns",
            "ratio_rowcol",
            "n_categorical",
            "n_numerical",
            "n_classes",
            "corr_with_dependent_abs_max",
            "corr_with_dependent_abs_min",
            "corr_with_dependent_abs_mean",
            "corr_with_dependent_abs_median",
            "corr_with_dependent_abs_std",
            "corr_with_dependent_abs_25p",
            "corr_with_dependent_abs_75p",
            "corr_with_dependent_abs_kurtosis",
            "corr_with_dependent_abs_skew",
            "class_prob_min",
            "class_prob_max",
            "class_prob_std",
            "class_prob_mean",
            "class_prob_median",
            "symbols_mean",
            "symbols_std",
            "symbols_min",
            "symbols_max",
            "symbols_sum",
            "symbols_skew",
            "symbols_kurtosis",
            "kurtosis_mean",
            "kurtosis_median",
            "kurtosis_min",
            "kurtosis_max",
            "kurtosis_std",
            "kurtosis_kurtosis",
            "kurtosis_skew",
            "skew_mean",
            "skew_median",
            "skew_min",
            "skew_max",
            "skew_std",
            "skew_kurtosis",
            "skew_skew",
            "pca_fraction_95",
            "entropy_dependent",
            "diversity_fraction",
        ]

    def test_generate_metafeatures(self):
        irisPd = pd.read_csv(self.irisPath, sep=None, engine='python')
        irisDs = Dataset(irisPd, dependent_col = self.irisTarget, prediction_type='classification')

        self.assertTrue(irisDs)

        result = mf.generate_metafeatures(irisDs)
        self.assertEquals(set(result.keys()), set(self.expectedMetafeatureKeys))
        self.assertEquals(result[self.depColMetafeature], self.irisTarget)


    def test_generate_metafeatures_from_filepath(self):
        result = mf.generate_metafeatures_from_filepath(self.irisPath, self.irisTarget)
        self.assertEquals(set(result.keys()), set(self.expectedMetafeatureKeys))
        self.assertEquals(result[self.depColMetafeature], self.irisTarget)
