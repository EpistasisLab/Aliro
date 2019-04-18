"""
Utility functions for loading experiment results that can be used for building an 
initial knowledgebase for the recommenders.


A knowledgebase consists of a relational dataset of previously run experiments, and 
the metafeatures of the datasets in those experiments.
"""

import pandas as pd
import os
import ai.metalearning.get_metafeatures as mf
import logging
import pdb

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


def load_knowledgebase(resultsFile, datasetDirectory):
    """Load experiment results from from file and generate metadata for the 
    experiment datasets.

    :param resultsFile: string - a gzip file of experiment results in csv form
    :param datasetDirectory: string - the directory that contains the datasets used
        in resultsFile

    :returns dict {resultsData: DataFrame with columns corresponding to:
    				'dataset',
	                'algorithm',
	                'parameters',
	                'accuracy',
	                'macrof1',
	                'bal_accuracy'
		   metafeaturesData: {String (datasetName): metafeatures}
				}
    """
    logger.info("load_knowledgebase({0},{1})".format(resultsFile, datasetDirectory))


    resultsData = _load_results_from_file(resultsFile)
    metafeaturesData = _generate_metadata_from_directory(datasetDirectory,
            targetField='class')

    # check that all result datasets have metadata
    warnings = _validate_knowledgebase(resultsData, metafeaturesData)

    # return
    return {'resultsData': resultsData, 'metafeaturesData': metafeaturesData, 'warnings': warnings}

def load_pmlb_knowledgebase():
    """ load the PMBL knowledgebase"""
    return load_knowledgebase(
            resultsFile = ('data/knowledgebases/sklearn-benchmark5-data-'
                'knowledgebase.tsv.gz'),
            datasetDirectory = "data/datasets/pmlb"
            )

def _validate_knowledgebase(resultsDf, metafeaturesDict):
  """
  Validate knowledgebase
  """
  requiredResultsFields = ['dataset', 'algorithm']

  warnings = []

  # check that resultsDf has required fields
  for reqField in requiredResultsFields:
    if not reqField in resultsDf.columns: warnings.append("Required field '" + reqField + "'' is not in the knowledgebase experiments.")

  if warnings: return warnings


  # check that all the datasets in resultsDf are in metafeaturesDict
  missingMfDatasets = list(set(resultsDf.dataset.unique()) - set(metafeaturesDict.keys()))
  if missingMfDatasets : warnings.append("Found experiment datasets with no associated metadata: " + str(missingMfDatasets))

  # TODO: check that all the metafeatures were created with a version compatable
  #       with the current version of datasest_describe.py

  return warnings


def _load_results_from_file(resultsFile):
    results_data = pd.read_csv(resultsFile,
                       compression='gzip', sep='\t')
                       # names=['dataset',
                       #        'algorithm',
                       #        'parameters',
                       #        'accuracy',
                       #        'macrof1',
                       #        'bal_accuracy']).fillna('')
    # convert params to dictionary 
    results_data['parameters'] = results_data['parameters'].apply(
            lambda x: eval(x))
    print('returning results data ')
    assert(not results_data.isna().any().any())
    logger.debug('results_data:')
    logger.debug(results_data.head())
    return results_data



def _generate_metadata_from_directory(datasetDirectory, targetField = 'class', 
    checkSubdirectories = True):
    """Extract metafeatures for all .csv files in the directory

    :returns dict: dataset name(str):metafeatures(dataFrame)
    """
    metafeaturesData = {}

    for root, dirs, files in os.walk(datasetDirectory):
        for name in files:
            if not name.startswith('.') and name.endswith('.csv'):
                dataset = os.path.splitext(name)[0]
                logger.debug("Generating metadata for {}".format(os.path.join(root,
                        name)))
                metafeatures = mf.generate_metafeatures_from_filepath(
                        os.path.join(root, name), targetField)
                metafeaturesData[dataset] = metafeatures

    return metafeaturesData

