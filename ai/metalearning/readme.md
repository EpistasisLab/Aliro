A bunch of methods to describe datasets as completely as possible.

Also misc utility methods for loading the database with pregenerated data or producing various .csv files of metafeatures from static directories.


A good starting point it so implement metafeatures described in Alexandros Kalousis's thesis "Algorithm Selection via Meta-Learning" and other relevant works.


#### Generate metafeatures ####
* dataset_describe.py - Script to generate metafeatures for a dataset
* generate_metafeatures.py - generate and return metafeatures for a given file


#### Return prevously generated metafeature or ml experiment data ####
* get_metafeatures.py, get_meta_features_pmlb.py - Generate metafeatures for the contents of the `../data` directory or a hardcoded directory
* make_meta_ml_dataset.py - return previously generated data about metafeatures or experiments

#### Load pregenrated data ####
* export_to_mongo.py - Script to load the pmlb ml experiment results contained in 'sklearn-benchmark5-data-short.tsv.gz' to the mongodb database

#### Test ####
* test_dataset_describe.py

#### Data ####
* iris.csv - testing data for test_dataset_describe.py
* tips.csv - testing data for test_dataset_describe.py
* data_metafeatures.csv - ???
* metafeatures-nn.tar.gz - ???
* metalearning.ipynb - ???
* sklearn-benchmark5-data-short.tsv.gz - ???


**to do list**
- not sure if `get_meta_features_pmlb.py` and `get_metafeatures.py` can be removed. (asked Bill, wait for reply)
- possibly remove everything not in the 'Generate metafeatures' or 'Test' category?