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
import csv

logger = logging.getLogger(__name__)
logger.setLevel(logging.WARN)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


PMLB_KB_RESULTS_PATH = 'data/knowledgebases/sklearn-benchmark5-data-knowledgebase.tsv.gz'
PMLB_KB_METAFEATURES_PATH = 'data/knowledgebases/pmlb_metafeatures.csv.gz'

USER_KB_RESULTS_PATH = 'data/knowledgebases/user/results'
USER_KB_METAFEATURES_PATH = 'data/knowledgebases/user/metafeatures'

def load_knowledgebase(resultsFiles=[], metafeaturesFiles=[], jsonMetafeatureDirectory=''):
    """Load experiment results from from file and generate metadata for the 
    experiment datasets.

    :param resultsFiles: list<string> - list of experiment results in tsv form, can be compressed files.
    :param metafeaturesFiles - list<string> - list of files that contain metafeatures for the experiment datasets in csv form, can be compressed files.
    :param jsonMetafeatureDirectory - root of a directory structure that contains .json files for metafeatures

    :returns dict {resultsData: DataFrame with columns corresponding to:
    				'dataset',
	                'algorithm',
	                'parameters',
	                'accuracy',
	                'macrof1',
	                'bal_accuracy'
	metafeaturesData: {String (datasetName): metafeatures}
    warnings: <string>
				}
    """
    logger.info(f"load_knowledgebase('{resultsFiles}', {metafeaturesFiles}', '{jsonMetafeatureDirectory}')")

    # load experiment results
    frames = []
    for resultsFile in resultsFiles:
        frames.append(_load_results_from_file(resultsFile))
    
    resultsData = pd.concat(frames)
    dedupe_results_dataframe(resultsData)
    dataset_names = resultsData['dataset']
    
    # load dataset metafeatures
    metafeaturesData = {}
    if jsonMetafeatureDirectory:
        metafeaturesData.update(_load_json_metafeatures_from_directory(jsonMetafeatureDirectory, dataset_names))

    if metafeaturesFiles:
        assert isinstance(metafeaturesFiles, list), f"load_knowledgebase.metafeaturesFiles must be a list; got '{metafeaturesFiles}'"
        for mfFile in metafeaturesFiles:
            metafeaturesData.update(_load_metadata_from_file(mfFile))

    if not(jsonMetafeatureDirectory or metafeaturesFiles):
        raise ValueError('One of metafeaturesFile or jsonMetafeatureDirectory '
                             'has to be specified')


    # check that all result datasets have metadata
    warnings = _validate_knowledgebase(resultsData, metafeaturesData)


    # add an id to results so we can index them by dataset hash, 
    # i.e., the '_id' variable in metafeaturesData
    pdb.set_trace()
    resultsData['dataset_id'] = resultsData['dataset'].apply(
            lambda x: metafeaturesData[x]['_id'])

    return {'resultsData': resultsData, 'metafeaturesData': metafeaturesData, 
            'warnings': warnings}


def dedupe_results_dataframe(resultsData):
    resultsData['parmHash'] = resultsData.apply(lambda x: hash(frozenset(x['parameters'].items())), axis = 1)

    rawCount = len(resultsData)
    pd.set_option('display.max_columns', None)
    #logger.debug(resultsData.head())

    compCols = list(resultsData.columns)
    compCols.remove("parameters")

    resultsData.drop_duplicates(subset=compCols, inplace=True)
    # drop duplicates with rounding
    #resultsData.loc[resultsData.round().drop_duplicates(subset=compCols).index]

    resultsData.drop(columns=['parmHash'], inplace=True)
    logger.info(f"loaded {rawCount} experiments, {len(resultsData)} after dropDuplicates")

    return resultsData


def load_default_knowledgebases(usePmlb=True, userKbResultsPath=USER_KB_RESULTS_PATH, userKbMetafeaturesPath=USER_KB_METAFEATURES_PATH):
    """
    Convienence method to load the pmlb knowledgebase and any user-added knowledgebases
    """
    logger.info(f"load_default_knowledgebases('{usePmlb}', '{userKbResultsPath}', '{userKbMetafeaturesPath}'")

    resFileExtensions = ['.tsv', '.gz']
    mfFileExtensions = ['.csv', '.tsv', '.gz']

    resultsFiles = []
    metafeaturesFiles = []

    # load pmlb
    if usePmlb:
        resultsFiles.append(PMLB_KB_RESULTS_PATH)
        metafeaturesFiles.append(PMLB_KB_METAFEATURES_PATH)

    # if additional directories for results or metafeatures provided, use them
    if (userKbResultsPath):
        for root, dirs, files in os.walk(userKbResultsPath):
            for name in files:
                extension = os.path.splitext(name)[1]
                if not name.startswith('.') and (extension in resFileExtensions):
                    resultsFiles.append(os.path.join(root, name))

    if (userKbMetafeaturesPath):
        for root, dirs, files in os.walk(userKbMetafeaturesPath):
            for name in files:
                extension = os.path.splitext(name)[1]
                if not name.startswith('.') and (extension in mfFileExtensions):
                    metafeaturesFiles.append(os.path.join(root, name))

    return load_knowledgebase(
            resultsFiles = resultsFiles,
            metafeaturesFiles = metafeaturesFiles
            )

def generate_metafeatures_file(
    datasetDirectory,
    outputPath,  
    outputFilename = "metafeatures.csv", 
    targetField = 'class', 
    checkSubdirectories = True, 
    fileExtensions = ['.csv', '.tsv']):
    """
    Generate metafeatures file for all datsets in the given directory

    """
    logger.info(f"generate_metafeatures_file({outputPath}, {datasetDirectory}, {outputFilename}, ...)")

    os.makedirs(outputPath, exist_ok=True)

    metafeaturesData = _generate_metadata_from_directory(
        datasetDirectory, targetField, checkSubdirectories, fileExtensions)

    df = pd.DataFrame(metafeaturesData).transpose()

    logger.debug(f"generated metafeatures for {len(metafeaturesData)} datasets")
    #logger.debug(f"metafeaturesData: {metafeaturesData}")
    logger.debug(df.head())

    df.to_csv(os.path.join(outputPath, outputFilename), header=True) #, quoting=csv.QUOTE_NONNUMERIC)

    return metafeaturesData


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


    # check that all the datasets in resultsDf are in metafeaturesDict
    missingMfDatasets = list(set(resultsDf.dataset.unique()) 
          - set(metafeaturesDict.keys()))
    if missingMfDatasets : 
      warnings.append(f"Found {len(missingMfDatasets)} of {len(resultsDf.dataset.unique())} experiment datasets with no associated metadata: {missingMfDatasets}")

    # check that all the metafeatures were created with a version compatable
    # with the current version of datasest_describe.py
    versions=[]
    for k,v in metafeaturesDict.items():
        if ("_metafeature_version" in v.keys()):
            versions.append(v['_metafeature_version'])
        else:
            warnings.append(f"Required key '_metafeature_version' missing from metafeatures data for '{k}'. Existing keys: {v.keys()}.")


    versions = np.array(versions)
    if len(np.unique(versions)) != 1:
        warnings.append('Different metafeatures versions present: '+
                        str(np.unique(versions)))


    return warnings


def _load_results_from_file(resultsFile):
    """
    Load experiment results from file
    """
    results_data = pd.read_csv(resultsFile, sep='\t')

    # convert params to dictionary 
    results_data['parameters'] = results_data['parameters'].apply(
            lambda x: eval(x))
    logger.info(f'returning {len(results_data)} results from {resultsFile}')
    
    assert(not results_data.isna().any().any())
    logger.debug(f'results_data:\n{results_data.head()}')
    return results_data


def _load_json_metafeatures_from_directory(metafeatureDirectory, datasetNames):
    """Load .json metafeatures for datasets

    Assumes metafeature files are named 'metafeatures.json' and are in
    subdirectories for each datset:
        metafeatureDirectory/dataset1/metadata.json
        metafeatureDirectory/dataset2/metadata.json
        metafeatureDirectory/dataset3/metadata.json

    :param metafeatureDirectory
    :param datasetNames - list of String dataset names
    """
    logger.info(f"Loading json metafeatures from directory '{metafeatureDirectory}'")
    
    metafeaturesData = {}

    for dataset in np.unique(datasetNames):
        mfPath = os.path.join(metafeatureDirectory, dataset, 'metafeatures.json')
        if os.path.exists(mfPath):
            #logger.debug(f'loading {mfPath}')
            with open(mfPath) as data_file:    
                data = json.load(data_file)
            metafeaturesData[dataset] = data 
        else:
            #raise ValueError(f"Couldn't find metafeature file for dataset '{dataset}'")
            logger.warn(f"Couldn't find metafeature file for dataset '{dataset}'")

    return metafeaturesData

def _load_metadata_from_file(metafeaturesFile):
    logger.info(f"Loading metadata from file '{metafeaturesFile}")
    metafeaturesDf = pd.read_csv(metafeaturesFile, index_col=0, float_precision='round_trip') #, quoting=csv.QUOTE_NONNUMERIC)
    logger.debug("loaded metafeature file as df:")
    logger.debug(metafeaturesDf.head())

    return metafeaturesDf.to_dict(orient='index')

def _generate_metadata_from_directory(datasetDirectory, targetField = 'class', 
    checkSubdirectories = True, fileExtensions = ['.csv', '.tsv']):
    """Extract metafeatures for all dataset files in the directory

    :returns dict: dataset name(str):metafeatures(dataFrame)
    """
    logger.info(f"generating metafeatures for files in directory '{datasetDirectory}', targetField={targetField}, checkSubdirectories={checkSubdirectories}, fileExtensions={fileExtensions}")

    if (not datasetDirectory):
        raise ValueError("Could not generate metadata from directory, 'datasetDirectory' must be specified")

    metafeaturesData = {}

    for root, dirs, files in os.walk(datasetDirectory):
        for name in files:
            extension = os.path.splitext(name)[1]
            if not name.startswith('.') and (extension in fileExtensions):
                # split twice to handle double extensions, i.e.
                #   'myfile.tsv.gz' => 'myfile'
                dataset = os.path.splitext(os.path.splitext(name)[0])[0]  
                datapath = os.path.join(root, name)
                logger.info(f"Generating metadata for {datapath}")
                metafeatures = mf.generate_metafeatures_from_filepath(
                        datapath, targetField)
                metafeaturesData[dataset] = metafeatures

    return metafeaturesData

