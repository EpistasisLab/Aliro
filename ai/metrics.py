# -*- coding: utf-8 -*-

"""This scoring file is part of the TPOT library.

"""

import numpy as np
from sklearn.metrics import make_scorer, SCORERS


def balanced_accuracy(y_true, y_pred):
    """Default scoring function: balanced accuracy.

    Balanced accuracy computes each class' accuracy on a per-class basis using a
    one-vs-rest encoding, then computes an unweighted average of the class accuracies.

    Parameters
    ----------
    y_true: numpy.ndarray {n_samples}
        True class labels
    y_pred: numpy.ndarray {n_samples}
        Predicted class labels by the estimator

    Returns
    -------
    fitness: float
        Returns a float value indicating the individual's balanced accuracy
        0.5 is as good as chance, and 1.0 is perfect predictive accuracy
    """
    all_classes = np.unique(np.append(y_true, y_pred))
    all_class_accuracies = []
    for this_class in all_classes:
        this_class_sensitivity = 0.
        this_class_specificity = 0.
        if sum(y_true == this_class) != 0:
            this_class_sensitivity = \
                float(sum((y_pred == this_class) & (y_true == this_class))) /\
                float(sum((y_true == this_class)))

            this_class_specificity = \
                float(sum((y_pred != this_class) & (y_true != this_class))) /\
                float(sum((y_true != this_class)))

        this_class_accuracy = (this_class_sensitivity + this_class_specificity) / 2.
        all_class_accuracies.append(this_class_accuracy)

    return np.mean(all_class_accuracies)


SCORERS['balanced_accuracy'] = make_scorer(balanced_accuracy)
