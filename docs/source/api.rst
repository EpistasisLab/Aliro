API
===

====
AI
====

.. autoclass:: ai.ai.AI
    :members:

============
Recommenders
============

##################
Base Recommender
##################
.. autoclass:: ai.recommender.base.BaseRecommender
    :members:

##################
Random Recommender
##################
.. autoclass:: ai.recommender.random_recommender.RandomRecommender
    :members:

###################
Average Recommender
###################
.. autoclass:: ai.recommender.average_recommender.AverageRecommender
    :members:

###############
KNN Recommender
###############
.. autoclass:: ai.recommender.knn_meta_recommender.KNNMetaRecommender
    :members:

#####################
Surprise Recommenders
#####################

We have a customized version of the Surprise library available `here. <https://github.com/lacava/surprise>`_

.. autoclass:: ai.recommender.surprise_recommenders.SurpriseRecommender
    :members:

.. autoclass:: ai.recommender.surprise_recommenders.CoClusteringRecommender
    :members:

.. autoclass:: ai.recommender.surprise_recommenders.KNNWithMeansRecommender
    :members:

.. autoclass:: ai.recommender.surprise_recommenders.KNNDatasetRecommender
    :members:

.. autoclass:: ai.recommender.surprise_recommenders.KNNMLRecommender
    :members:

.. autoclass:: ai.recommender.surprise_recommenders.SlopeOneRecommender
    :members:

.. autoclass:: ai.recommender.surprise_recommenders.SVDRecommender
    :members:


Learn
=====

This is the API for building ML models.
PennAI uses scikit-learn to achieve this.

==
IO
==

These methods control data flow from the server to and from sklearn models.

.. autoclass:: machine.learn.io_utils.Experiment
    :members:

.. autofunction:: machine.learn.io_utils.get_projects

.. autofunction:: machine.learn.io_utils.parse_args

.. autofunction:: machine.learn.io_utils.get_input_data

.. autofunction:: machine.learn.io_utils.get_file_data

.. autofunction:: machine.learn.io_utils.check_column

.. autofunction:: machine.learn.io_utils.bool_type

.. autofunction:: machine.learn.io_utils.none

.. autofunction:: machine.learn.io_utils.get_type


==================
Scikit-learn Utils
==================

These methods generate sklearn models and evaluate them.

.. autofunction:: machine.learn.skl_utils.balanced_accuracy

.. autofunction:: machine.learn.skl_utils.generate_results

.. autofunction:: machine.learn.skl_utils.get_col_idx

.. autofunction:: machine.learn.skl_utils.setup_model_params

.. autofunction:: machine.learn.skl_utils.compute_imp_score

.. autofunction:: machine.learn.skl_utils.save_json_fmt

.. autofunction:: machine.learn.skl_utils.plot_confusion_matrix

.. autofunction:: machine.learn.skl_utils.plot_roc_curve

.. autofunction:: machine.learn.skl_utils.plot_imp_score

.. autofunction:: machine.learn.skl_utils.plot_dot_plot

.. autofunction:: machine.learn.skl_utils.export_model

.. autofunction:: machine.learn.skl_utils.generate_export_codes

