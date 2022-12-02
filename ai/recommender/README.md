#Recommenders

A recommender is responsible for deciding what ML-parameter combination will be run when the AI button is clicked. 

## Recommendation Basics

A recommender should inherit from the BaseRecommender class, which contains the minimum methods needed. 

 - `update(self, results_data, results_mf=None)`: takes in new results as they are generated. Most recommenders use this to maintain an internal state. 
 - `recommend(self, dataset_id=None, n_recs=1, dataset_mf=None)`: Returns an ML choice, its parameter values, and the internal score of its recommendation for `dataset_id`.

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

 - **KNNMetaRecommender**
    
    This is a collaborative filtering approach. 
    The recommender tries to recommend MLs that have performed well on similar datasets. 
    
    KNNMetaRecommender maintains and internal list of the best MLs on each dataset that has been seen. 
    When a new recommendation request comes in, the neighborhood of the dataset is calculated in metafeature space, and recommendations are made in order of nearest to farthest dataset using the best ML methods for that dataset (excluding the current one). 
    
    In the case of repeat recommendations, this recommender defaults to random recommendations.

 - **SVDRecommender**

    This recommender uses an online version of the SVD recommender system from the [Surprise package](https://surprise.readthedocs.io/en/stable/matrix_factorization.html).
    See their documentation for details.

    Note: Any other recommenders in that folder are not currently supported or 
    maintained. 

## Building your own recommender

To build your own recommender, start with the `recommender/base.py` file.
From there, implement `update()` and `recommend()` strategies. 
The base class provides `self.ml_p`, a dataframe of available algorithm
configurations. 
It also maintains a parameter hash table (`self.param_htable`) that facilitates the
unique identification of parameter dictionaries. 
Check out the base class API [documentation]() to get started. 

To use the recommender with the AI class, you need to make the following changes to
`ai/ai.py`:

 1. Import your recommender:
   
    ```python
    from ai.recommender.my_recommender import MyFancyRecommender
    ```

 2. To use your recommender via command-line calls of the ai, add it as an argument
    to the argument parser:

    ```python 
    parser.add_argument('-rec',action='store',dest='REC',default='random',
            choices = ['random','average','exhaustive','meta','knn','svd','myrec'],
            help='Recommender algorithm options.')
    ```

 3. Add it as an option to `name_to_rec` in `main()`:

    ```python 
    # dictionary of default recommenders to choose from at the command line.
    name_to_rec = {'random': RandomRecommender,
            'average': AverageRecommender,
            'knn': KNNMetaRecommender,
            'svd': SVDRecommender,
            'myrec': MyFancyRecommender
            }
    ```

That should be all the required changes. 

### Running your recommender

You should now be able to start the AI with your recommender. 
The easiest way to do so is to add your recommender to the `config/ai.env` file.
Edit this file so that `AI_RECOMMENDER=myrec`.

Then when Aliro is launched, it will run with your recommender. 

For more control and for testing, launch Aliro with `AI_AUTOSTART=0` set in the
`config/ai.env` file. 
Then, attach to the `aliro_lab_1` docker container with the command

    docker exec -it "aliro_lab_1" /bin/bash

Change to the project root:

    cd $PROJECT_ROOT

Then you can launch the AI with your recommender as 

    python -m ai.ai -rec myrec 

Run `python -m ai.ai -h` to see additional options. 
