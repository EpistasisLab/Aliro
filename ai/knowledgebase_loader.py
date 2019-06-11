"""
Utility functions for loading experiment results that can be used for building an 
initial knowledgebase for the recommenders.


A knowledgebase consists of a relational dataset of previously run experiments, and 
the metafeatures of the datasets in those experiments.
"""

import pandas as pd
import numpy as np
import os
import ai.metalearning.get_metafeatures as mf
import logging
import pdb
import json 

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


def load_knowledgebase(resultsFile, datasetDirectory='', metafeatureDirectory=''):
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
    logger.info(f"load_knowledgebase({resultsFile},{datasetDirectory})")

    # load results
    resultsData = _load_results_from_file(resultsFile)
    dataset_names = resultsData['dataset']
    metafeaturesData = {}
    
    # load or generate dataset metafeatures
    if metafeatureDirectory:
        metafeaturesData = _load_json_metadata_from_directory(metafeatureDirectory, dataset_names)
    elif datasetDirectory:
        metafeaturesData = _generate_metadata_from_directory(datasetDirectory,
                targetField='class')
    else:
        raise ValueError('One of datasetDirectory or metafeatureDirectory '
                             'has to be specified')


    # check that all result datasets have metadata
    warnings = _validate_knowledgebase(resultsData, metafeaturesData)


    return {'resultsData': resultsData, 'metafeaturesData': metafeaturesData, 
            'warnings': warnings}


def load_pmlb_knowledgebase():
    """ 
    Convience method to load the PMBL knowledgebase
    """
    return load_knowledgebase(
            resultsFile = ('data/knowledgebases/sklearn-benchmark5-data-'
                'knowledgebase.tsv.gz'),
            # datasetDirectory = "data/datasets/pmlb",
            metafeatureDirectory = 'data/knowledgebases/metafeatures'
            )


def _validate_knowledgebase(resultsDf, metafeaturesDict):
    """
    Validate knowledgebase
    """
    requiredResultsFields = ['dataset', 'algorithm']

    warnings = []

    # check that resultsDf has required fields
    for reqField in requiredResultsFields:
        if not reqField in resultsDf.columns: 
            warnings.append("Required field '" + reqField + 
                "'' is not in the knowledgebase experiments.")

    # if warnings: 
    #     return warnings

    # check that all the datasets in resultsDf are in metafeaturesDict
    missingMfDatasets = list(set(resultsDf.dataset.unique()) 
          - set(metafeaturesDict.keys()))
    if missingMfDatasets : 
      warnings.append(f"Found {len(missingMfDatasets)} of {len(resultsDf.dataset.unique())} experiment datasets with no associated metadata: {missingMfDatasets}")

    # check that all the metafeatures were created with a version compatable
    # with the current version of datasest_describe.py
    versions=[]
    for k,v in metafeaturesDict.items():
        versions.append(v['metafeature_version'])
    versions = np.array(versions)
    if len(np.unique(versions)) != 1:
        warnings.append('Different metafeatures versions present: '+
                        str(np.unique(versions)))
    return warnings


def _load_results_from_file(resultsFile):
    """
    Load experiment results from file
    """
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
    logger.info('returning results data ')
    assert(not results_data.isna().any().any())
    logger.debug('results_data:')
    logger.debug(results_data.head())
    return results_data


def _load_json_metadata_from_directory(metafeatureDirectory, datasetNames):
    """Load .json metafeatures for datasets

    Assumes metafeature files are named 'metafeatures.json' and are in
    subdirectories for each datset:
        metafeatureDirectory/dataset1/metadata.json
        metafeatureDirectory/dataset2/metadata.json
        metafeatureDirectory/dataset3/metadata.json

    :param metafeatureDirectory
    :param datasetNames - list of String dataset names
    """
    logger.info('loading cached metafeatures from '+ metafeatureDirectory)
    
    metafeaturesData = {}

    for dataset in np.unique(datasetNames):
        mfPath = os.path.join(metafeatureDirectory, dataset, 'metafeatures.json')
        if os.path.exists(mfPath):
            #logger.debug(f'loading {mfPath}')
            with open(mfPath) as data_file:    
                data = json.load(data_file)
            metafeaturesData[dataset] = data 
        else:
            raise ValueError("couldn't find metafeature file for " + dataset)

    return metafeaturesData

def _generate_metadata_from_directory(datasetDirectory, targetField = 'class', 
    checkSubdirectories = True):
    """Extract metafeatures for all .csv files in the directory

    :returns dict: dataset name(str):metafeatures(dataFrame)
    """
    logger.info(f"generating metafeatures for files in directory '{datasetDirectory}', targetField={targetField}, checkSubdirectories={checkSubdirectories}")

    if (not datasetDirectory):
        raise ValueError("Could not generate metadata from directory, 'datasetDirectory' must be specified")

    metafeaturesData = {}

    for root, dirs, files in os.walk(datasetDirectory):
        for name in files:
            extension = os.path.splitext(name)[1]
            if not name.startswith('.') and (extension in ['.csv', '.tsv']):
                dataset = os.path.splitext(name)[0]
                logger.debug("Generating metadata for {}".format(os.path.join(root,
                        name)))
                metafeatures = mf.generate_metafeatures_from_filepath(
                        os.path.join(root, name), targetField)
                metafeaturesData[dataset] = metafeatures

    return metafeaturesData

