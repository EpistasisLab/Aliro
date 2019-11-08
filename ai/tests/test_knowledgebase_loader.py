

import ai.knowledgebase_loader as kb_loader
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import (nottest, raises, assert_equals, 
        assert_is_instance, assert_dict_equal)
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
        #print(f"not floats: '{a}', '{b}'")
        return a == b

    ##if not(abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)):
    ##    print(f"tol check failed: {a}, {b}, {max(rel_tol * max(abs(a), 
    ##      abs(b)), abs_tol)}, {abs(a-b)}")

    return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)

@nottest
def load_test_data():
    '''
    testName
    resultsFiles
    datasetDirectory
    jsonMetafeatureDirectory
    metafeaturesFiles
    targetField
    expectedResultsCount
    expectedMetafeaturesCount
    expectedWarningCount
    '''
    return [
        ("benchmark5-metafeaturesFromDirectory", 
         ["data/knowledgebases/"
             "sklearn-benchmark5-data-knowledgebase-small.tsv.gz"], 
         'data/knowledgebases/test/jsonmetafeatures',
         '',
         'class',
         79608,
         5,
         1
         ),
        ("benchmark5-metafeaturesFromFile", 
         ["data/knowledgebases/"
             "sklearn-benchmark5-data-knowledgebase-small.tsv.gz"], 
         '',
         ['data/knowledgebases/pmlb_metafeatures.csv.gz'],
         'class',
         79608,
         165,
         0
         ),
        ("multiResultFile-metafeaturesFromFile", 
         [("data/knowledgebases/test/results/"
             "sklearn-benchmark5-data-knowledgebase_filtered1.tsv"),
            ("data/knowledgebases/test/results/"
            "sklearn-benchmark5-data-knowledgebase_filtered2.tsv")], 
         '',
         ['data/knowledgebases/pmlb_metafeatures.csv.gz'],
         'class',
         6,
         165,
         0
         ),
        ("benchmark5-metafeaturesFromMultiFile", 
         ["data/knowledgebases/"
             "sklearn-benchmark5-data-knowledgebase-small.tsv.gz"], 
         '',
         ['data/knowledgebases/test/metafeatures/pmlb_metafeatures1.csv',
            'data/knowledgebases/test/metafeatures/pmlb_metafeatures2.csv'],
         'class',
         79608,
         165,
         0
         ),
    ]

def load_default_kb_data():
    # /test/results contains dupes from pmlb
    return [
        ("pmlbOnly", True, None, None, 79608, 165),
        ("userOnly", False, "data/knowledgebases/test/results", 
            "data/knowledgebases/test/metafeatures", 6, 165),
        ("pmlbAndUser", True, "data/knowledgebases/test/results", 
            "data/knowledgebases/test/metafeatures", 79608, 165) 
    ]

def results_files():
    return [
    (   "benchmark5", 
        "data/knowledgebases/"
        "sklearn-benchmark5-data-knowledgebase-small.tsv.gz"),
    (   "test1",
        "data/knowledgebases/test/results/"
        "sklearn-benchmark5-data-knowledgebase_filtered1.tsv"),
    (   "test2",
        "data/knowledgebases/test/results/"
        "sklearn-benchmark5-data-knowledgebase_filtered2.tsv"),
    ]


class TestResultUtils(unittest.TestCase):

    @parameterized.expand(load_test_data)
    def test_load_knowledgebase(self, testName, resultsFiles, 
        jsonMetafeatureDirectory, metafeaturesFiles, targetField, 
        expectedResultsCount, expectedMetafeaturesCount, expectedWarningCount):

        result = kb_loader.load_knowledgebase(
            resultsFiles=resultsFiles,
            metafeaturesFiles=metafeaturesFiles,
            jsonMetafeatureDirectory=jsonMetafeatureDirectory)

        assert 'resultsData' in result
        assert 'metafeaturesData' in result

        assert isinstance(result['resultsData'], pd.DataFrame)
        assert isinstance(result['metafeaturesData'], dict)

        self.assertGreater(len(result['resultsData']), 1)
        self.assertGreater(len(result['metafeaturesData'].keys()), 1)

        print("test_load_knowledgebase result.warnings:")
        print(result['warnings'])
        self.assertEquals(len(result['warnings']), expectedWarningCount, 
                msg = f"warnings: {result['warnings']}")

        self.assertEquals(len(result['metafeaturesData']), 
                expectedMetafeaturesCount)
        self.assertEquals(len(result['resultsData']), expectedResultsCount)


    @parameterized.expand(results_files)
    def test_load_results_from_file(self, name, testResultsFiles):
        data = kb_loader._load_results_from_file(testResultsFiles)
        assert isinstance(data, pd.DataFrame)

        self.assertGreater(len(data), 1)
        #assert expectedResultsData.equals(data)


    def test_generate_metadata_from_directory(self):
        testResultsDataDirectory = "data/datasets/pmlb_small"
        targetField = "class"

        data = kb_loader._generate_metadata_from_directory(
                testResultsDataDirectory, targetField=targetField)
        assert isinstance(data, dict)

        self.assertGreater(len(data.keys()), 1)
        #assert expectedMetafeaturesData.equals(data)

    @parameterized.expand(load_default_kb_data)
    def test_load_default_knowledgebases(self, name, usePmlb, 
            userKbResultsPath, userKbMetafeaturesPath,
            expectedResultsCount, expectedMetafeaturesCount):
        """the PMLB knowledgebase is loaded correctly"""
        result = kb_loader.load_default_knowledgebases(
            usePmlb=usePmlb,
            userKbResultsPath=userKbResultsPath,
            userKbMetafeaturesPath=userKbMetafeaturesPath
            )

        assert 'resultsData' in result
        assert 'metafeaturesData' in result

        assert isinstance(result['resultsData'], pd.DataFrame)
        assert isinstance(result['metafeaturesData'], dict)

        self.assertEquals(len(result['resultsData']), 
                expectedResultsCount)
        self.assertEquals(len(result['metafeaturesData']), 
                expectedMetafeaturesCount)

        print("test_load_default_knowledgebases result.warnings:")
        print(result['warnings'])
        assert len(result['warnings']) == 0


    def test_load_json_metafeatures_from_directory(self):
        testDirectory = "data/knowledgebases/test/jsonmetafeatures"
        testDatasets = ["adult", "agaricus-lepiota", "allbp", "allhyper", 
                "allhypo"]

        result = kb_loader._load_json_metafeatures_from_directory(
                testDirectory, testDatasets)
        assert len(result) == len(testDatasets)

        for dataset in testDatasets:
            assert dataset in result.keys()

    def test_load_metafeatures_from_file(self):
        pmlbMetafeaturesFile = "data/knowledgebases/pmlb_metafeatures.csv.gz"
        result = kb_loader._load_metadata_from_file(pmlbMetafeaturesFile)
        assert len(result) == 165

    def test_generate_metafeatures_file(self):
        datasetDirectory = "data/datasets/pmlb_small"
        outputFilename = 'metafeatures.csv.gz'
        targetField = 'class'

        mfGen = kb_loader.generate_metafeatures_file(
            outputFilename=outputFilename,
            outputPath=TEST_OUTPUT_PATH, 
            datasetDirectory=datasetDirectory,
            fileExtensions = ['.csv', '.tsv', '.gz'],
            targetField = targetField, 
            checkSubdirectories = True)

        assert len(mfGen) > 10

        mfLoad = kb_loader._load_metadata_from_file(
                f"{TEST_OUTPUT_PATH}/{outputFilename}")

        self.assertIsInstance(mfGen, dict)
        self.assertIsInstance(mfLoad, dict)

        #assert that mfLoad and mfGen are equal
        self.assert_metafeature_dict_equality(mfGen, mfLoad)


    def assert_metafeature_dict_equality(self, mf1, mf2):
        '''
        assert that two metafeature dictionaries are equal
    
        cannot do direct dict equalty because:
            - metafeatures loaded from file are of type <str:Dict>, 
            metafeatures loaded generated are of type <str:OrderedDict>
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
                    isClose(gen, load, abs_tol=tolerance) 
                    or ((gen==None or math.isnan(gen)) 
                        and (load==None or math.isnan(load))), 
                    msg= (f"For key/field '{key}'/'{field}', values not equal:"
                        " {type(gen)}:{type(load)}  '{gen}':'{load}'"))

        self.assertEqual(set(mf1.keys()), set(mf2.keys()))
