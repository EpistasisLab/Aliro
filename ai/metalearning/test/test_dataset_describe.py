import unittest
import pandas as pd
import numpy as np
import math
from dataset_describe import Dataset
 
class Dataset_Describe(unittest.TestCase):
 
    def setUp(self):
        # classification problem.
        iris = pd.read_csv('iris.csv')
        self.iris = Dataset(iris)   

        # Regression problem
        tips = pd.read_csv('tips.csv')
        self.tips = Dataset(tips, dependent_col = 'tip')   


    def test_number_of_rows(self):
        result = self.iris.n_rows()
        self.assertEqual(150, result)

    def test_number_of_columns(self):
        result = self.iris.n_columns()
        self.assertEqual(5, result)
 
    def test_if_self_categorical_cols_is_zero_iris(self):
        result = self.iris.categorical_cols
        self.assertEqual([], result)

    def test_number_of_categorical_vars(self):
        result = self.iris.n_categorical()
        self.assertEqual(0, result)

    def test_number_of_numerical_vars(self):
        result = self.iris.n_numerical()
        self.assertEqual(4, result)

    def test_total_nclasses(self):
        result = self.iris.n_classes()
        self.assertEqual(3, result)

    def test_total_nclasses_in_regression_problem(self):
        result = self.tips.n_classes()
        self.assertTrue(math.isnan(result))
    
    def test_prediction_type_classification(self):
        result = self.iris.prediction_type
        self.assertEqual('classification', result)

    def test_prediction_type_regression(self):
        result = self.tips.prediction_type
        self.assertEqual('regression', result)


    def test_max_corr_with_dependent_classification(self):
        result = self.iris.corr_with_dependent_abs_max()
        self.assertTrue(math.isnan(result))

    def test_max_corr_with_dependent_regression(self):
        result = self.tips.corr_with_dependent_abs_max()
        self.assertAlmostEqual(0.675,result, places = 2)

    def test_min_corr_with_dependent_regression(self):
        result = self.tips.corr_with_dependent_abs_min()
        self.assertAlmostEqual(0.002, result, places = 2)


    def test_25p_corr_with_dependent_regression(self):
        result = self.tips.corr_with_dependent_abs_25p()
        self.assertAlmostEqual(0.055, result, places = 2)


    def test_mean_corr_with_dependent_regression(self):
        result = self.tips.corr_with_dependent_abs_mean()
        self.assertAlmostEqual(0.18, result, places = 2)


    def test_median_corr_with_dependent_regression(self):
        result = self.tips.corr_with_dependent_abs_median()
        self.assertAlmostEqual(0.095, result, places = 2)


    def test_75p_corr_with_dependent_regression(self):
        result = self.tips.corr_with_dependent_abs_75p()
        self.assertAlmostEqual(0.125, result, places = 2)

    def test_std_corr_with_dependent_regression(self):
        result = self.tips.corr_with_dependent_abs_std()
        self.assertAlmostEqual(0.234, result, places = 2)


    def test_class_probablity_total_suite(self):
        ## evaluating for regression problem.
        result = self.tips.class_prob_min()
        self.assertTrue(math.isnan(result))
        ## evaluating for iris dataset.
        ## not really a useful test it seems, should get another dataset.
        ## Also not a unit test.

        self.assertAlmostEqual(0.33, self.iris.class_prob_min(), places = 2)
        self.assertAlmostEqual(0.33, self.iris.class_prob_max(), places = 2)
        self.assertAlmostEqual(0, self.iris.class_prob_std(), places = 2)
        self.assertAlmostEqual(0.33, self.iris.class_prob_mean(), places = 2)
        self.assertAlmostEqual(0.33, self.iris.class_prob_median(), places = 2)


    def test_class_symbols_suite(self):
        mean = 2.5
        std = 1
        min_ = 2
        max_ = 4

        ## Iris has no nominal variables.

        result = self.iris.symbols_sum()
        self.assertTrue(math.isnan(result))
        
        ## evaluating for tips dataset.
        ## Also not a unit test.
        symbol_counts = self.tips._get_symbols_per_category()

        self.assertEqual(symbol_counts['sex'], 2)
        self.assertEqual(symbol_counts['smoker'], 2)

        self.assertAlmostEqual(max_, self.tips.symbols_max(), places = 2)
        self.assertAlmostEqual(min_, self.tips.symbols_min(), places = 2)
        self.assertAlmostEqual(std, self.tips.symbols_std(), places = 2)
        self.assertAlmostEqual(mean, self.tips.symbols_mean(), places = 2)
                


if __name__ == '__main__':
    unittest.main()