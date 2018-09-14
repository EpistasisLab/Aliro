# Recommender

A recommender is responsible for deciding what ML-parameter combination will be run when the AI button is clicked. 

## Recommendation Basics

A recommender should inherit from the BaseRecommender class, which contains the minimum methods needed. 

 - `update(self, results_data)`: takes in new results as they are generated. Most recommenders use this to maintain an internal state. 
 - `recommend(self, dataset_id=None, n_recs=1)`: Returns an ML choice, its parameter values, and the internal score of its recommendation for `dataset_id`.

For a new recommender, these two classes, along with the class constructor, must be implemented. 

## Current Recommenders

 - **RandomRecommender**

    Recommends random machine learning algorithms and parameters from the possible algorithms
    fetched from the server.
 
    RandomRecommender samples uniform randomly from the ML methods, then uniform randomly samples the parameters of the chosen algorithm.

 - **AverageRecommender**
    
    Recommends machine learning algorithms and parameters based on their average performance
    across all evaluated datasets.

    AverageRecommender maintains an internal moving average of each ML-paramter combination across all datasets. 

    It can only recommend ML-paramter combinations that it has results for. 

    On startup, it is best topreload some results so that AverageRecommender has some minimum knowledge base. Otherwise it won't be able to make a recommendation until results have been generated. 

 - **MetaRecommender**
    
    Recommends machine learning algorithms and parameters as follows:
    maintains an internal model of the form

            f_d(ML,P,MF) = E
    where

    - `d` is the dataset
    - `ML` is the machine learning algorithm
    - `P` is the ML parameters
    - `MF` is the metafeatures associated with `d`
    - `E` is the error that `ML`-`P` produces on `d`
        
    To produce recommendations for dataset `d`, it does the following:

    - grab metafeatures of `d` from the server
    - for several `a` sampled from ML-P options:
        - `E_a = f_d(ML_a,P_a,MF_d)` prediction of performance of `a` on `d`
    - Sort `E_a` 
    - recommend top `n_recs` `E_a` 
    




