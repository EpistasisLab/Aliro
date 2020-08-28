"""This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""
import unittest
import pandas as pd
import numpy as np
import math
import os
from ai.metalearning.dataset_describe import Dataset
from nose.tools import nottest

package_directory = os.path.dirname(os.path.abspath(__file__))
 
class Dataset_Describe(unittest.TestCase):
 
    def setUp(self):
        ## paths
        irisPath = os.path.join(package_directory, 'iris.csv') 
        tipsPath = os.path.join(package_directory, 'tips.csv')

        #dataset that contains string values
        appendicitisStringPath = os.path.join(package_directory, 'appendicitis_cat_ord.csv')

        #row permutation of the iris dataset
        irisPermutePath = os.path.join(package_directory, 'iris_permute.csv')

        #duplicate of the iris dataser
        irisDupePath = os.path.join(package_directory, 'iris_dupe.csv')

        ## cols
        self.irisCols = set(["SepalLength","SepalWidth","PetalLength","PetalWidth","Name"])
        self.irisCatCols = set(["Name"])
        self.irisTarget = "Name"

        self.appendicitisCols = set(["At1","At2","At3","At4","At5","At6","At7","cat","ord","target_class"])
        self.appendicitisCatCols = set(["cat", "ord"])
        self.appendicitisTarget = "target_class"

        self.tipsCols = set(["total_bill","tip","sex","smoker","day","time","size"])
        self.tipsCatCols = set(["sex", "smoker", "day", "time"])
        self.tipsTarget = "tip"

        ## metafeature classes
        # classification problems
        irisPd = pd.read_csv(irisPath)
        self.iris = Dataset(irisPd) 

        irisPermutePd = pd.read_csv(irisPermutePath)
        self.irisPermute = Dataset(irisPermutePd) 

        irisDupePd = pd.read_csv(irisDupePath)
        self.irisDupe = Dataset(irisDupePd) 

        appendicitisStringPd = pd.read_csv(appendicitisStringPath, sep=None, engine='python')
        self.appendicitisString = Dataset(appendicitisStringPd, prediction_type="classification")
        self.appendicitisOrdTarget = Dataset(appendicitisStringPd, prediction_type="classification", dependent_col="ord")

        # Regression problem
        tipsPd = pd.read_csv(tipsPath)
        self.tips = Dataset(tipsPd, dependent_col = 'tip') 

    def test_m_dependent_col(self):
        self.assertEqual(self.iris.m_dependent_col(), "Name")
        self.assertEqual(self.irisPermute.m_dependent_col(), "Name")
        self.assertEqual(self.tips.m_dependent_col(), "tip")
        self.assertEqual(self.appendicitisString.m_dependent_col(), "target_class")
        self.assertEqual(self.appendicitisOrdTarget.m_dependent_col(), "ord")

    def iterableToSrtdStr(self, iterable):
        return repr(sorted(list(iterable)))

    def test_m_categorical_cols(self):
        self.assertEqual(self.iris.m_categorical_cols(), self.iterableToSrtdStr(self.irisCatCols - set([self.irisTarget])))
        self.assertEqual(self.irisPermute.m_categorical_cols(), self.iterableToSrtdStr(self.irisCatCols - set([self.irisTarget])))
        self.assertEqual(self.appendicitisString.m_categorical_cols(), self.iterableToSrtdStr(self.appendicitisCatCols - set([self.appendicitisTarget])))
        self.assertEqual(self.appendicitisOrdTarget.m_categorical_cols(), self.iterableToSrtdStr(self.appendicitisCatCols - set(["ord"])))
        self.assertEqual(self.tips.m_categorical_cols(), self.iterableToSrtdStr(self.tipsCatCols - set([self.tipsTarget])))

    def test_m_independent_cols(self):
        self.assertEqual(self.iris.m_independent_cols(), self.iterableToSrtdStr(self.irisCols - set([self.irisTarget])))
        self.assertEqual(self.irisPermute.m_independent_cols(), self.iterableToSrtdStr(self.irisCols - set([self.irisTarget])))
        self.assertEqual(self.appendicitisString.m_independent_cols(), self.iterableToSrtdStr(self.appendicitisCols - set([self.appendicitisTarget])))
        self.assertEqual(self.appendicitisOrdTarget.m_independent_cols(), self.iterableToSrtdStr(self.appendicitisCols - set(["ord"])))
        self.assertEqual(self.tips.m_independent_cols(), self.iterableToSrtdStr(self.tipsCols - set([self.tipsTarget])))

    def test_m_prediction_type(self):
        self.assertEqual(self.iris.m_prediction_type(), "classification")
        self.assertEqual(self.irisPermute.m_prediction_type(), "classification")
        self.assertEqual(self.appendicitisString.m_prediction_type(), "classification")
        self.assertEqual(self.appendicitisOrdTarget.m_prediction_type(), "classification")
        #self.assertEqual(self.tips.m_prediction_type(), "regression")

    def test_m_data_hash(self):
        irisResult = self.iris.m_data_hash()
        irisPermuteResult = self.irisPermute.m_data_hash()
        irisDupeResult = self.irisDupe.m_data_hash()
        tipsResult = self.tips.m_data_hash()
        appendicitisStringResult = self.appendicitisString.m_data_hash()
        appendicitisOrdTargetResult = self.appendicitisOrdTarget.m_data_hash()


        self.assertEqual(irisResult, irisDupeResult)
        self.assertNotEqual(irisResult, irisPermuteResult)
        self.assertEqual(appendicitisStringResult, appendicitisOrdTargetResult)

        self.assertEqual(irisResult, "4761c082ca2f241c151d3ec57336ddf7627bfbf0893348ed21e8abb87620206b")
        self.assertEqual(irisPermuteResult, "2a7d7049779206839faa99f28060f5645f856cf5bbccfee08b735cc261c151e8")
        self.assertEqual(tipsResult, "6b5a7bde4f70028674093e87ddbfc2de39f7e2826b6027511199c89eaeb0c63e")
        self.assertEqual(appendicitisStringResult, "4d9be7d1f3026a82e16fc7cebdbdfb7d375668070d1b0297beaf63c447993dbb")
        self.assertEqual(appendicitisOrdTargetResult, "4d9be7d1f3026a82e16fc7cebdbdfb7d375668070d1b0297beaf63c447993dbb")


    def test_id_obj_str(self):
        irisResult = self.iris._id_obj_str()
        irisDupeResult = self.irisDupe._id_obj_str()
        irisPermuteResult = self.irisPermute._id_obj_str()
        tipsResult = self.tips._id_obj_str()
        appendicitisStringResult = self.appendicitisString._id_obj_str()

        self.assertEqual(irisResult, irisDupeResult)
        self.assertNotEqual(irisResult, irisPermuteResult)

        self.assertEqual(irisResult.encode('utf-8'), 
            b"[('m_categorical_cols', []), ('m_data_hash', '4761c082ca2f241c151d3ec57336ddf7627bfbf0893348ed21e8abb87620206b'), ('m_dependent_col', 'Name'), ('m_independent_cols', ['PetalLength', 'PetalWidth', 'SepalLength', 'SepalWidth']), ('m_prediction_type', 'classification')]")
        self.assertEqual(irisDupeResult.encode('utf-8'), 
            b"[('m_categorical_cols', []), ('m_data_hash', '4761c082ca2f241c151d3ec57336ddf7627bfbf0893348ed21e8abb87620206b'), ('m_dependent_col', 'Name'), ('m_independent_cols', ['PetalLength', 'PetalWidth', 'SepalLength', 'SepalWidth']), ('m_prediction_type', 'classification')]")
        self.assertEqual(irisPermuteResult.encode('utf-8'), 
            b"[('m_categorical_cols', []), ('m_data_hash', '2a7d7049779206839faa99f28060f5645f856cf5bbccfee08b735cc261c151e8'), ('m_dependent_col', 'Name'), ('m_independent_cols', ['PetalLength', 'PetalWidth', 'SepalLength', 'SepalWidth']), ('m_prediction_type', 'classification')]")
 

    def test_m_id(self):
        irisResult = self.iris.m_id()
        irisDupeResult = self.irisDupe.m_id()
        irisPermuteResult = self.irisPermute.m_id()
        tipsResult = self.tips.m_id()
        appendicitisStringResult = self.appendicitisString.m_id()

        self.assertEqual(irisResult, irisDupeResult)
        self.assertNotEqual(irisResult, irisPermuteResult)

        #unittest.util._MAX_LENGTH = 700 

        self.assertEqual(irisResult, "8f1ade2dc0cc5ab6d2375ae6d00c879b8123e5959fc3b1db7445c2baa4b1e484")
        self.assertEqual(irisPermuteResult, "781effc03375bbdab47ea289ca0f11994ff780c09d81b64c1d7ed1d83b89fed7")
        self.assertEqual(tipsResult, "0a545c848cf5cac0b47bf39a67b626a057d1ff7d79b37f954df16d0262875bc6")
        self.assertEqual(appendicitisStringResult, "a34dccabe2d3605caa582ec6ec68a8aa56738a94694a828a7f5c041760a7eb9d")


    def test_number_of_rows(self):
        irisResult = self.iris.n_rows()
        irisPermuteResult = self.iris.n_rows()
        self.assertEqual(150, irisResult)
        self.assertEqual(150, irisPermuteResult)

    def test_number_of_columns(self):
        irisResult = self.iris.n_columns()
        appendicitisStringResult = self.appendicitisString.n_columns()
        self.assertEqual(5, irisResult)
        self.assertEqual(10, appendicitisStringResult)
 
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
        # call twice; the first time this method is called corr_with_dependent is set.
        # during subsiquent calls the set value is referenced
        self.tips.corr_with_dependent_abs_75p()

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

    @nottest
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