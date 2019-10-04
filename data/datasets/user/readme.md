## Add labeled datasets to this directory.

* Datasets must have the extension .csv or .tsv
* Datasets can contain only numeric values and cannot have any null values

* By default, the label column is assumed to be named 'class', the dataset is assumed to be a classification problem, and all fields are numeric.

* An optional json config file can be provided to specify the target column, ordinal and categorical fields, and/or the prediction type ('classification' or 'regression').  For file myDatafile.*sv can be specified in a json config file named myDatafile_metadata.json, see the example file myDataset_metadata.json for reference.