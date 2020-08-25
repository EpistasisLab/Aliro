"""
Utility functions for loading experiment results that can be used for building
an initial knowledgebase for the recommenders.


A knowledgebase consists of a relational dataset of previously run experiments,
and the metafeatures of the datasets in those experiments.
"""

import pandas as pd
import numpy as np
import os
import ai.metalearning.get_metafeatures as mf
import logging
import pdb
import json
import csv

# add trace level
logging.TRACE = logging.DEBUG + 5
logging.addLevelName(logging.TRACE, "TRACE")
class TraceLogger(logging.getLoggerClass()):
    def trace(self, msg, *args, **kwargs):
        self.log(logging.TRACE, msg, *args, **kwargs)
logging.setLoggerClass(TraceLogger)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


PMLB_KB_CLASSIFICATION_RESULTS_PATH = ('data/knowledgebases/'
        'sklearn-benchmark-data-knowledgebase-r6.tsv.gz')
PMLB_KB_CLASSIFICATION_METAFEATURES_PATH = ('data/knowledgebases/'
        'pmlb_classification_metafeatures.csv.gz')
PMLB_KB_REGRESSION_RESULTS_PATH = ('data/knowledgebases/'
        'pmlb_regression_results.pkl.gz')
PMLB_KB_REGRESSION_METAFEATURES_PATH = ('data/knowledgebases/'
        'pmlb_regression_metafeatures.csv.gz')

USER_KB_RESULTS_PATH = 'data/knowledgebases/user/results'
USER_KB_METAFEATURES_PATH = 'data/knowledgebases/user/metafeatures'

def load_knowledgebase(resultsFiles={}, metafeaturesFiles=[],
        jsonMetafeatureDirectory='', dedupe=True):
    """Load experiment results from from file and generate metadata for the
    experiment datasets.

    :param resultsFiles - list<(string,string)>
        a list of tuples that contain resultsFile, pred_type
        - list of experiment results in tsv form, can be compressed files.
    :param metafeaturesFiles - list<tuple<string,string>>
        - list of files that contain metafeatures for the experiment datasets
        in csv form, can be compressed files.
    :param jsonMetafeatureDirectory
        - root of a directory structure that contains .json files for
        metafeatures

    :returns dict {
        dict {
        pred_type
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
    logger.info(f"load_knowledgebase('{resultsFiles}', {metafeaturesFiles}', "
            f"'{jsonMetafeatureDirectory}')")

    # load experiment results
    frames = []
    for resultsFile in resultsFiles:
        frames.append(_load_results_from_file(resultsFile))

    logger.info("concatenating results....")
    all_resultsData = pd.concat(frames, sort=False)

    if dedupe:
        logger.info("deduplicating results....")
        dedupe_results_dataframe(all_resultsData)
    dataset_names = all_resultsData['dataset'].unique()

    # load dataset metafeatures
    logger.info('load metafeatures...')
    metafeaturesDict = {}
    if jsonMetafeatureDirectory:
        metafeaturesDict.update(
                _load_json_metafeatures_from_directory(
                    jsonMetafeatureDirectory, dataset_names)
                )

    if metafeaturesFiles:
        assert isinstance(metafeaturesFiles, list), \
                (f"load_knowledgebase.metafeaturesFiles must be a list;"
                " got '{metafeaturesFiles}'")
        for mfFile in metafeaturesFiles:
            metafeaturesDict.update(_load_metadata_from_file(mfFile))

    if not(jsonMetafeatureDirectory or metafeaturesFiles):
        raise ValueError('One of metafeaturesFile or jsonMetafeatureDirectory '
                             'has to be specified')

    metafeaturesData = pd.DataFrame.from_records(
                metafeaturesDict).transpose()
    # filter any extraneous metafeaturesData (e.g. from extra datasets)
    metafeaturesData = metafeaturesData.loc[metafeaturesData['_id'].isin(
        all_resultsData['_id'].unique())]

    # check that all result datasets have metadata
    warnings = _validate_knowledgebase(all_resultsData, metafeaturesData)

    if (warnings):
        logger.warn(f"Warnings while running load_knowledgebase()"
            f"\n  resultsFiles: '{resultsFiles}'"
            f"\n  metafeaturesFiles: '{metafeaturesFiles}'"
            f"\n  jsonMetafeatureDirectory: '{jsonMetafeatureDirectory}'")

        logger.warn(f"Found {len(warnings)} warning(s):")
        logger.warn("\n".join(warnings))

    # split knowledgebases by prediction type
    resultsData = {}
    for pred_type in metafeaturesData['_prediction_type'].unique():
        relevant_dataset_ids = metafeaturesData.loc[
                metafeaturesData['_prediction_type']==pred_type,'_id']
        resultsData[pred_type] = all_resultsData.loc[
                all_resultsData['_id'].isin(relevant_dataset_ids)]
        # drop columns irrelevant to this pred_type
        resultsData[pred_type] = resultsData[pred_type].dropna(
                axis=1,how='all')

    return {'resultsData': resultsData, 'metafeaturesData': metafeaturesData,
            'warnings': warnings}


def dedupe_results_dataframe(resultsData):
    logger.trace("dedupe_results_dataframe()")

    logger.trace("generating parmHash")
    resultsData['parmHash'] = resultsData.apply(
            lambda x: hash(frozenset(x['parameters'].items())), axis = 1)
    logger.trace("parmHash generated")

    rawCount = len(resultsData)
    pd.set_option('display.max_columns', None)
    #logger.debug(resultsData.head())

    logger.trace("removing parameters....")
    compCols = list(resultsData.columns)
    compCols.remove("parameters")

    logger.trace("drop_duplicates...")
    resultsData.drop_duplicates(subset=compCols, inplace=True)

    logger.trace("drop paramHash")
    resultsData.drop(columns=['parmHash'], inplace=True)

    logger.info(f"loaded {rawCount} experiments, {len(resultsData)} "
            "after dropDuplicates")

    return resultsData


def load_default_knowledgebases(usePmlb=True,
        userKbResultsPath=USER_KB_RESULTS_PATH,
        userKbMetafeaturesPath=USER_KB_METAFEATURES_PATH,
        dedupe=True):
    """
    Convienence method to load the pmlb knowledgebase and any user-added
    knowledgebases
    """
    logger.info(f"load_default_knowledgebases('{usePmlb}', "
            f"'{userKbResultsPath}', '{userKbMetafeaturesPath}'")

    resFileExtensions = ['.json', 'pkl', '.tsv', '.gz']
    mfFileExtensions = ['.csv', '.tsv', '.gz']

    resultsFiles = []
    metafeaturesFiles = []

    # load pmlb
    if usePmlb:
        resultsFiles.append(
                PMLB_KB_CLASSIFICATION_RESULTS_PATH)
        resultsFiles.append(
                PMLB_KB_REGRESSION_RESULTS_PATH)
        metafeaturesFiles.append(
                PMLB_KB_CLASSIFICATION_METAFEATURES_PATH)
        metafeaturesFiles.append(
                PMLB_KB_REGRESSION_METAFEATURES_PATH)

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
            metafeaturesFiles = metafeaturesFiles,
            dedupe=dedupe
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
            f" {outputFilename}, ...)")

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
    df.to_csv(os.path.join(outputPath, outputFilename), header=True,
            compression='gzip')

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

    if warnings:
        return warnings

    resMissingMf = resultsDf[~resultsDf['_id'].isin(metafeaturesDf['_id'])]
    resMissingMfUnique = resMissingMf[['_id', 'dataset']].drop_duplicates()

    if len(resMissingMfUnique.index) > 0:
        warnings.append(f"Found {len(resMissingMfUnique.index)} of "
              f"{len(resultsDf._id.unique())} experiment datasets with no "
              "associated metadata: " +  resMissingMfUnique.to_string()
              +'.\nResults missing metadata will not be loaded.')


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
    logger.info(f'_load_results_from_file({resultsFile})')

    # resultsfile is a tsv file
    if resultsFile.endswith('tsv.gz') or resultsFile.endswith('tsv'):
        results_data = pd.read_csv(resultsFile, sep='\t')

        # convert params to dictionary
        logger.trace("converting parameters to dictionary")
        results_data['parameters'] = results_data['parameters'].apply(
                lambda x: eval(x))
        logger.info(f'returning {len(results_data)} results from {resultsFile}')
    elif resultsFile.endswith('.pkl') or resultsFile.endswith('.pkl.gz'):
        results_data = pd.read_pickle(resultsFile)
    elif resultsFile.endswith('.json') or resultsFile.endswith('.json.gz'):
        results_data = pd.read_json(resultsFile)
    else:
        raise ValueError("Unknown knowlegde base format!")
    assert not results_data.isna().any().any()
    logger.debug(f'results_data:\n{results_data.head()}')
    logger.trace("saving results_data to json "
                "from _load_results_from_file()")
    logger.trace("returning from _load_results_from_file()")
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
            f"'{metafeatureDirectory}'")

    metafeaturesData = {}

    for dataset in np.unique(datasetNames):
        mfPath = os.path.join(metafeatureDirectory, dataset,
                'metafeatures.json')
        if os.path.exists(mfPath):
            #logger.debug(f'loading {mfPath}')
            with open(mfPath) as data_file:
                data = json.load(data_file)
            metafeaturesData[dataset] = data
        else:
            logger.warn(f"Couldn't find metafeature file for dataset "
                    f"'{dataset}'")

    return metafeaturesData

def _load_metadata_from_file(metafeaturesFile):
    logger.info(f"Loading metadata from file '{metafeaturesFile}")
    metafeaturesDf = pd.read_csv(metafeaturesFile, index_col=0,
            float_precision='round_trip') #, quoting=csv.QUOTE_NONNUMERIC)
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
    logger.info(f"generating metafeatures for files in directory "
            f"'{datasetDirectory}', targetField={targetField}, "
            f"checkSubdirectories={checkSubdirectories}, "
            f"fileExtensions={fileExtensions}")

    if (not datasetDirectory):
        raise ValueError("Could not generate metadata from directory, "
                "'datasetDirectory' must be specified")

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