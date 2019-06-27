

import ai.knowledgebase_loader as knowledgebase_loader
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equals, assert_is_instance, assert_dict_equal
from parameterized import parameterized
import pandas as pd
import pprint

TEST_OUTPUT_PATH = "target/test_output/test_knowledgebase_loader"

@nottest
def load_test_data():
    return [
        ("benchmark5", 
         "data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz", 
         "data/datasets/pmlb_small",
         None,
         pd.DataFrame(data={'col1': [1, 2], 'col2': [3, 4]}),
         {'apple':[1,2,3]}
         ),
    ]

class TestResultUtils(unittest.TestCase):
    @parameterized.expand(load_test_data)
    def test_load_results_from_file(self, name, testResultFile,
        testResultsDataDirectory, targetField, expectedResultsData, 
        expectedMetafeaturesData):
        data = knowledgebase_loader._load_results_from_file(testResultFile)
        assert isinstance(data, pd.DataFrame)

        self.assertGreater(len(data), 1)
        #assert expectedResultsData.equals(data)

    @parameterized.expand(load_test_data)
    def test_generate_metadata_from_directory(self, name, testResultFile,
            testResultsDataDirectory, targetField, expectedResultsData, 
            expectedMetafeaturesData):
        data = knowledgebase_loader._generate_metadata_from_directory(
                testResultsDataDirectory, targetField=targetField)
        assert isinstance(data, dict)

        self.assertGreater(len(data.keys()), 1)
        #assert expectedMetafeaturesData.equals(data)

    @parameterized.expand(load_test_data)
    def test_load_knowledgebase(self, name, testResultFile,
            testResultsDataDirectory, targetField, expectedResultsData, 
            expectedMetafeaturesData):
        result = knowledgebase_loader.load_knowledgebase(testResultFile, 
                testResultsDataDirectory)
        assert 'resultsData' in result
        assert 'metafeaturesData' in result

        assert isinstance(result['resultsData'], pd.DataFrame)
        assert isinstance(result['metafeaturesData'], dict)

        self.assertGreater(len(result['resultsData']), 1)
        self.assertGreater(len(result['metafeaturesData'].keys()), 1)

        print("test_load_knowledgebase result.warnings:")
        print(result['warnings'])
        #assert len(result['warnings']) == 0

        #assert expectedResultsData.equals(result['resultsData']) 
        #assert expectedMetafeaturesData.equals(result['metafeaturesData'])
    
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

    def test_load_json_metadata_from_directory(self):
        testDirectory = "data/knowledgebases/test/metafeatures"
        testDatasets = ["adult", "agaricus-lepiota", "allbp", "allhyper", "allhypo"]

        result = knowledgebase_loader._load_json_metadata_from_directory(testDirectory, testDatasets)
        assert len(result) == len(testDatasets)

        for dataset in testDatasets:
            assert dataset in result.keys()

    def test_generate_metafeatures_file(self):
        datasetDirectory = "data/datasets/pmlb_small"
        outputFilename = 'metafeatures.csv.gz'

        mfGen = knowledgebase_loader.generate_metafeatures_file(
            outputFilename=outputFilename,
            outputPath=TEST_OUTPUT_PATH, 
            datasetDirectory=datasetDirectory,
            fileExtensions = ['.csv', '.tsv', '.gz'],
            targetField = 'class', 
            checkSubdirectories = True)

        assert len(mfGen) > 10

        mfLoad = knowledgebase_loader._load_metadata_from_file(f"{TEST_OUTPUT_PATH}/{outputFilename}")

        self.maxDiff = None
        self.assertIsInstance(mfGen, dict)
        self.assertIsInstance(mfLoad, dict)

        ## mfLoad is of type <str:Dict>, mfGen is of type <str:OrderedDict>; cannot do direct dict equality
        self.assertTrue(mfGen.keys() == mfLoad.keys())

        for key in mfGen.keys():
            for field in mfGen[key].keys():
                gen = mfGen[key][field]
                load = mfLoad[key][field]
                #print(f"{key}:{field}  {type(gen)}:{type(load)}  {gen}:{load}")
                return (gen == load) or (math.isnan(gen) and math.isnan(load))
