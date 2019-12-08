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
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


PMLB_KB_RESULTS_PATH = 'data/knowledgebases/sklearn-benchmark5-data-knowledgebase.tsv.gz'
PMLB_KB_METAFEATURES_PATH = 'data/knowledgebases/pmlb_classification_metafeatures.csv.gz'

USER_KB_RESULTS_PATH = 'data/knowledgebases/user/results'
USER_KB_METAFEATURES_PATH = 'data/knowledgebases/user/metafeatures'

def load_knowledgebase(resultsFiles={}, metafeaturesFiles=[], 
        jsonMetafeatureDirectory=''):
    """Load experiment results from from file and generate metadata for the 
    experiment datasets.

    :param resultsFiles: dict with regression and classification fields that
        contain list<string> 
        - list of experiment results in tsv form, can be compressed files.
    :param metafeaturesFiles - list<string> 
        - list of files that contain metafeatures for the experiment datasets 
        in csv form, can be compressed files.
    :param jsonMetafeatureDirectory 
        - root of a directory structure that contains .json files for 
        metafeatures

    :returns dict {
        resultsData: DataFrame with columns corresponding to:
                    '_id',
    				'dataset',
	                'algorithm',
	                'parameters',
                    classification or regression accuracy metrics 
                    (i.e. 'accuracy', 'macrof1', 'bal_accuracy')
  
        metafeaturesData: Dataframe with columns corresponding to:
                    '_id',
                    '_metafeature_version',
                    '_prediction_type',
                    metafeature columns as defined in get_metafeatures.py

        warnings: list of warning Strings
				}
    """
    logger.info(f"load_knowledgebase('{resultsFiles}', {metafeaturesFiles}', '
            ''{jsonMetafeatureDirectory}')")

    # load experiment results
    frames = {} 
    for pred_type,resultsFile in resultsFiles.items():
        frames[pred_type].append(_load_results_from_file(resultsFile))
    
    dataset_names = []
    for k in frames.keys():
        resultsData[k] = pd.concat(frames)
        dedupe_results_dataframe(resultsData[k])
        dataset_names.append(resultsData[k]['dataset'])
    
    # load dataset metafeatures
    metafeaturesDict = {}
    if jsonMetafeatureDirectory:
        metafeaturesData.update(
                _load_json_metafeatures_from_directory(
                    jsonMetafeatureDirectory, dataset_names))

    if metafeaturesFiles:
        assert (isinstance(metafeaturesFiles, list), 
        f"load_knowledgebase.metafeaturesFiles must be a list;"
        " got '{metafeaturesFiles}'")
        for mfFile in metafeaturesFiles:
            metafeaturesDict.update(_load_metadata_from_file(mfFile))

    if not(jsonMetafeatureDirectory or metafeaturesFiles):
        raise ValueError('One of metafeaturesFile or jsonMetafeatureDirectory '
                             'has to be specified')

    metafeaturesData = pd.DataFrame.from_records(
                metafeaturesDict).transpose()

    # check that all result datasets have metadata
    warnings = _validate_knowledgebase(resultsData, metafeaturesData)


    # add an id to results so we can index them by dataset hash, 
    # i.e., the '_id' variable in metafeaturesData
    # resultsData['_id'] = resultsData['dataset'].apply(
    #         lambda x: metafeaturesData[x]['_id'] 
    #         if x in metafeaturesData.keys() else x)

    if (warnings):
        logger.warn(f"Warnings while running load_knowledgebase()"
            f"\n  resultsFiles: '{resultsFiles}'"
            f"\n  metafeaturesFiles: '{metafeaturesFiles}'"
            f"\n  jsonMetafeatureDirectory: '{jsonMetafeatureDirectory}'")

        logger.warn(f"Found {len(warnings)} warning(s):")
        logger.warn("\n".join(warnings))


    return {'resultsData': resultsData, 'metafeaturesData': metafeaturesData, 
            'warnings': warnings}


def dedupe_results_dataframe(resultsData):
    resultsData['parmHash'] = resultsData.apply(
            lambda x: hash(frozenset(x['parameters'].items())), axis = 1)

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


def load_default_knowledgebases(usePmlb=True, 
        userKbResultsPath=USER_KB_RESULTS_PATH, 
        userKbMetafeaturesPath=USER_KB_METAFEATURES_PATH):
    """
    Convienence method to load the pmlb knowledgebase and any user-added 
    knowledgebases
    """
    logger.info(f"load_default_knowledgebases('{usePmlb}', "
            "'{userKbResultsPath}', '{userKbMetafeaturesPath}'")

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
                if (not name.startswith('.') 
                        and (extension in resFileExtensions)):
                    resultsFiles.append(os.path.join(root, name))

    if (userKbMetafeaturesPath):
        for root, dirs, files in os.walk(userKbMetafeaturesPath):
            for name in files:
                extension = os.path.splitext(name)[1]
                if (not name.startswith('.') 
                        and (extension in mfFileExtensions)):
                    metafeaturesFiles.append(os.path.join(root, name))

    return load_knowledgebase(
            resultsFiles = resultsFiles,
            metafeaturesFiles = metafeaturesFiles
            )

def generate_metafeatures_file(
    datasetDirectory,
    outputPath,  
    outputFilename = "metafeatures.csv", 
    predictionType = "classification",
    targetField = 'class', 
    checkSubdirectories = True, 
    fileExtensions = ['.csv', '.tsv'],
    **kwargs):
    """
    Generate metafeatures file for all datsets in the given directory

    """
    logger.info(f"generate_metafeatures_file({outputPath}, {datasetDirectory},"
            " {outputFilename}, ...)")

    os.makedirs(outputPath, exist_ok=True)

    metafeaturesData = _generate_metadata_from_directory(
        datasetDirectory, predictionType, targetField, 
        checkSubdirectories, fileExtensions, **kwargs)

    df = pd.DataFrame(metafeaturesData).transpose()

    logger.debug(f"generated metafeatures for {len(metafeaturesData)} "
            "datasets")
    #logger.debug(f"metafeaturesData: {metafeaturesData}")
    logger.debug(df.head())

    #, quoting=csv.QUOTE_NONNUMERIC)
    df.to_csv(os.path.join(outputPath, outputFilename), header=True) 

    return metafeaturesData


def _validate_knowledgebase(resultsDf, metafeaturesDf):
    """
    Validate knowledgebase
    """
    requiredResultsFields = ['_id', 'dataset', 'algorithm']
    requiredMetafeatureFields = ['_id', '_metafeature_version', 
            '_prediction_type']

    warnings = []

    assert isinstance(resultsDf, pd.DataFrame)
    assert isinstance(metafeaturesDf, pd.DataFrame)

    # check that resultsDf has required fields
    for reqField in requiredResultsFields:
        if not reqField in resultsDf.columns: 
            warnings.append("Knowledgebase experiments data "
                f"missing required field '{reqField}'")

    # check that metafeaturesDf has required fields
    for reqField in requiredMetafeatureFields:
        if not reqField in metafeaturesDf.columns: 
            warnings.append("Knowledgebase metafeature data "
                f"missing required field '{reqField}'")

    if warnings: return warnings

    # check that all the datasets in resultsDf are in metafeaturesDf
    '''
    missingMfDatasetIds = list(set(resultsDf._id.unique()) 
          - set(metafeaturesDf._id.unique()))
    if missingMfDatasetIds:
      warnings.append(f"Found {len(missingMfDatasetIds)} of "
              f"{len(resultsDf.dataset.unique())} experiment datasets with no "
              f"associated metadata: {missingMfDatasetIds}")
    '''

    resMissingMf = resultsDf[~resultsDf['_id'].isin(metafeaturesDf['_id'])]
    resMissingMfUnique = resMissingMf[['_id', 'dataset']].drop_duplicates()

    if len(resMissingMfUnique.index) > 0:
        warnings.append(f"Found {len(resMissingMfUnique.index)} of "
              f"{len(resultsDf._id.unique())} experiment datasets with no "
              "associated metadata: " +  resMissingMfUnique.to_string())


    # check that all the metafeatures were created with a version compatable
    # with the current version of datasest_describe.py
    mfVersions = metafeaturesDf['_metafeature_version'].unique()
    if len(mfVersions) != 1:
        warnings.append(f'Multiple metafeature versions present: {mfVersions}')


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
    logger.info(f"Loading json metafeatures from directory "
            "'{metafeatureDirectory}'")
    
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

def _generate_metadata_from_directory(datasetDirectory,
    prediction_type = "classification", targetField = 'class', 
    checkSubdirectories = True, fileExtensions = ['.csv', '.tsv'],
    **kwargs):
    """Extract metafeatures for all dataset files in the directory

    :returns dict: dataset name(str):metafeatures(dataFrame)
    """
    logger.info(f"generating metafeatures for files in directory '{datasetDirectory}', targetField={targetField}, checkSubdirectories={checkSubdirectories}, fileExtensions={fileExtensions}")

    if (not datasetDirectory):
        raise ValueError("Could not generate metadata from directory, 'datasetDirectory' must be specified")

    metafeaturesData = {}

    for root, dirs, files in os.walk(datasetDirectory):
        for name in files:
            print(name)
            extension = os.path.splitext(name)[1]
            # print('extension',extension, 'fileExtensions:',fileExtensions)
            if not name.startswith('.') and (extension in fileExtensions):
                # split twice to handle double extensions, i.e.
                #   'myfile.tsv.gz' => 'myfile'
                dataset = os.path.splitext(os.path.splitext(name)[0])[0]  
                datapath = os.path.join(root, name)
                logger.info(f"Generating metadata for {datapath}")
                metafeatures = mf.generate_metafeatures_from_filepath(
                        datapath, prediction_type, targetField, **kwargs)
                metafeaturesData[dataset] = metafeatures

    return metafeaturesData

