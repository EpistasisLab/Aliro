

import ai.knowledgebase_loader as knowledgebase_loader
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equals, assert_is_instance, assert_dict_equal
from parameterized import parameterized
import pandas as pd
import pprint
import math

TEST_OUTPUT_PATH = "target/test_output/test_knowledgebase_loader"

@nottest
def isClose(a, b, rel_tol=1e-09, abs_tol=0.0):
    '''
    https://www.python.org/dev/peps/pep-0485/#proposed-implementation
    '''
    try:
        a = float(a)
        b = float(b)
    except (TypeError, ValueError):
        print(f"not floats: '{a}', '{b}'")
        return a == b

    if not(abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)):
        print(f"tol check failed: {a}, {b}, {max(rel_tol * max(abs(a), abs(b)), abs_tol)}, {abs(a-b)}")

    return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)

@nottest
def load_test_data():
    '''
    testName
    resultFile
    datasetDirectory
    metafeatureDirectory
    metafeaturesFile
    targetField
    expectedResultsCount
    expectedMetafeaturesCount
    expectedWarningCount
    '''
    return [
        ("benchmark5-generateMetafeatures", 
         "data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz", 
         "data/datasets/pmlb_small",
         '',
         '',
         'class',
         79608,
         49,
         1
         ),
        ("benchmark5-metafeaturesFromDirectory", 
         "data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz", 
         '',
         'data/knowledgebases/test/metafeatures',
         '',
         'class',
         79608,
         5,
         1
         ),
        ("benchmark5-metafeaturesFromFile", 
         "data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz", 
         '',
         '',
         'data/knowledgebases/pmlb_metafeatures.csv.gz',
         'class',
         79608,
         165,
         0
         ),
    ]

def results_files():
    return [
    (   "benchmark5", 
        "data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz"),
    (   "test1",
        "data/knowledgebases/test/sklearn-benchmark5-data-edited-formatted-filtered1.tsv"),
    (   "test2",
        "data/knowledgebases/test/sklearn-benchmark5-data-edited-formatted-filtered2.tsv"),
    ]


class TestResultUtils(unittest.TestCase):

    @parameterized.expand(load_test_data)
    def test_load_knowledgebase(self, testName, resultFile, 
        datasetDirectory, metafeatureDirectory, metafeaturesFile, targetField, 
        expectedResultsCount, expectedMetafeaturesCount, expectedWarningCount):

        result = knowledgebase_loader.load_knowledgebase(
            resultsFile=resultFile,
            metafeaturesFile=metafeaturesFile,
            datasetDirectory=datasetDirectory,
            metafeatureDirectory=metafeatureDirectory)

        assert 'resultsData' in result
        assert 'metafeaturesData' in result

        assert isinstance(result['resultsData'], pd.DataFrame)
        assert isinstance(result['metafeaturesData'], dict)

        self.assertGreater(len(result['resultsData']), 1)
        self.assertGreater(len(result['metafeaturesData'].keys()), 1)

        print("test_load_knowledgebase result.warnings:")
        print(result['warnings'])
        self.assertEquals(len(result['warnings']), expectedWarningCount, msg = f"warnings: {result['warnings']}")

        self.assertEquals(len(result['metafeaturesData']), expectedMetafeaturesCount)
        self.assertEquals(len(result['resultsData']), expectedResultsCount)


    @parameterized.expand(results_files)
    def test_load_results_from_file(self, name, testResultFile):
        data = knowledgebase_loader._load_results_from_file(testResultFile)
        assert isinstance(data, pd.DataFrame)

        self.assertGreater(len(data), 1)
        #assert expectedResultsData.equals(data)


    def test_generate_metadata_from_directory(self):
        testResultsDataDirectory = "data/datasets/pmlb_small"
        targetField = "class"

        data = knowledgebase_loader._generate_metadata_from_directory(
                testResultsDataDirectory, targetField=targetField)
        assert isinstance(data, dict)

        self.assertGreater(len(data.keys()), 1)
        #assert expectedMetafeaturesData.equals(data)

    
    def test_load_pmlb_knowledgebase(self):
        """the PMLB knowledgebase is loaded correctly"""
        result = knowledgebase_loader.load_pmlb_knowledgebase()
        assert 'resultsData' in result
        assert 'metafeaturesData' in result

        assert isinstance(result['resultsData'], pd.DataFrame)
        assert isinstance(result['metafeaturesData'], dict)

        self.assertGreater(len(result['resultsData']), 1)
        self.assertGreater(len(result['metafeaturesData'].keys()), 1)

        print("test_load_pmlb_knowledgebase result.warnings:")
        print(result['warnings'])
        assert len(result['warnings']) == 0


    def test_load_json_metafeatures_from_directory(self):
        testDirectory = "data/knowledgebases/test/metafeatures"
        testDatasets = ["adult", "agaricus-lepiota", "allbp", "allhyper", "allhypo"]

        result = knowledgebase_loader._load_json_metafeatures_from_directory(testDirectory, testDatasets)
        assert len(result) == len(testDatasets)

        for dataset in testDatasets:
            assert dataset in result.keys()

    def test_load_metafeatures_from_file(self):
        pmlbMetafeaturesFile = "data/knowledgebases/pmlb_metafeatures.csv.gz"
        result = knowledgebase_loader._load_metadata_from_file(pmlbMetafeaturesFile)
        assert len(result) == 165

    def test_generate_metafeatures_file(self):
        datasetDirectory = "data/datasets/pmlb_small"
        outputFilename = 'metafeatures.csv.gz'
        targetField = 'class'

        mfGen = knowledgebase_loader.generate_metafeatures_file(
            outputFilename=outputFilename,
            outputPath=TEST_OUTPUT_PATH, 
            datasetDirectory=datasetDirectory,
            fileExtensions = ['.csv', '.tsv', '.gz'],
            targetField = targetField, 
            checkSubdirectories = True)

        assert len(mfGen) > 10

        mfLoad = knowledgebase_loader._load_metadata_from_file(f"{TEST_OUTPUT_PATH}/{outputFilename}")

        self.assertIsInstance(mfGen, dict)
        self.assertIsInstance(mfLoad, dict)

        #assert that mfLoad and mfGen are equal
        self.assert_metafeature_dict_equality(mfGen, mfLoad)


    def assert_metafeature_dict_equality(self, mf1, mf2):
        '''
        assert that two metafeature dictionaries are equal
    
        cannot do direct dict equalty because:
            - metafeatures loaded from file are of type <str:Dict>, metafeatures loaded generated are of type <str:OrderedDict>
            - can contain nan values which are not equal in python
        '''
        tolerance = 0
        #tolerance = 0.0000000000001
        mutualKeys = set(mf1.keys()) & set(mf2.keys())

        for key in mutualKeys:
            for field in mf1[key].keys():
                gen = mf1[key][field]
                load = mf2[key][field]
                #print(f"{key}:{field}  {type(gen)}:{type(load)}  {gen}:{load}")
                self.assertTrue(
                    #(gen == load) or 
                    isClose(gen, load, abs_tol=tolerance) or
                    ((gen==None or math.isnan(gen)) and (load==None or math.isnan(load))), 
                    msg= f"For key/field '{key}'/'{field}', values not equal: {type(gen)}:{type(load)}  '{gen}':'{load}'")

        self.assertEqual(set(mf1.keys()), set(mf2.keys()))