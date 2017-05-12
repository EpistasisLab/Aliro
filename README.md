# Penn AI
Engine for reading in modeling results, updating knowledge base, and making recommendations that instantiate new runs. 
## workflow
 - runs are stored in database
 - the Penn AI recommender is instantiated
```python
pennai = Recommender(method='ml_p',ml_type='classifier')
# data: a dataframe of results from database
pennai.update(results_data)
``` 
 - given a new modeling task, the AI recommends an ML method with parameter values (P)
```python
# dataset_metafeatures: an optional set of metafeatures of the dataset to assist in recommendations
ml,p = pennai.recommend(dataset_metafeatures=None)
```
 - the ML+P recommendation is run on the dataset using outside system

```python
#todo
submit(dataset,ml,p)
```
 - the results are used to update the recommender
```python
pennai.update(new_results_data)
```
## overall tasks
 - [ ] build dataframe `results_data` from MongoDB results. 
  - Dataframe cols:
  - 'classifier' or 'regressor': e.g. "RandomForestClassifier"
  - ML parameter data:
```python
column_types = {
    'fit_intercept':bool,
    'loss':str,
    'C':float,
    'alpha':float,
    'learning_rate':str,
    'penalty':str,
    'l1_ratio':float,
    'eta0':float,
    'power_t':int,
    'min_weight_fraction_leaf':float,
    'criterion':str,
    'n_estimators':int,
    'max_features':str,
    'Unnamed: 19':str,
    'degree':int,
    'kernel':str,
    'gamma':str,
    'coef0':float,
    'dual':bool,
    'weights':str,
    'n_neighbors':int,
    'fit_prior':bool,
    'max_depth':int,
    'binarize':bool,
}
```
  - metrics: 'accuracy','bal_accuracy', 'AUC': score of run
  - dataset: dataset name e.g. "iris"
  - metafeatures: list from `dataset_describe.py`
 - [ ] make method to accept job submissions 
 - [ ] recommendation shows up in launch page

## recommender tasks
- [ ] filter recommendations for what has already been run
- [ ] direct acess to MongDB results for checking what has been run

recommendations using:
 - [x] ml + p 
 - [ ] ml + p + mf
 - [ ] ml + p + mf, per model basis
 - [ ] incorporating expert knowledge rules
 - [ ] analyze which metafeatures are important
 - [ ] make method to submit jobs (`submit(dataset,ml,p)`)

