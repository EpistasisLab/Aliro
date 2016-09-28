#!/usr/bin/python3
import numpy as np
import matplotlib as mpl
#run without X
mpl.use('Agg')
import matplotlib.pyplot as plt
from sklearn import linear_model, datasets
import pandas as pd
import argparse
import os
import json


def lr(penalty,_id):
    # import reduced GEI phenotype data
    df=pd.read_csv('pheno_reduced.csv')
    df=df.set_index(df['id_subject'])
    del df['id_subject']
    X = df;
    Y=X['srcase']
    del X['srcase']


    X=X.as_matrix()
    Y=Y.as_matrix()


    h = .02  # step size in the mesh

    logreg = linear_model.LogisticRegression(C=1e5)
    # we create an instance of Neighbours Classifier and fit the data.
    logreg.fit(X, Y)

    # Plot the decision boundary. For that, we will assign a color to each
    # point in the mesh [x_min, m_max]x[y_min, y_max].
    x_min, x_max = X[:, 0].min(), X[:, 0].max()
    y_min, y_max = X[:, 1].min(), X[:, 1].max()
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h), np.arange(y_min, y_max, h))
    Z = logreg.predict(np.c_[xx.ravel(), yy.ravel()])

    # Put the result into a color plot
    Z = Z.reshape(xx.shape)
    plt.figure(1, figsize=(4, 3))
    plt.pcolormesh(xx, yy, Z, cmap=plt.cm.Paired)

    # Plot also the training points
    plt.scatter(X[:, 0], X[:, 1], c=Y, edgecolors='k', cmap=plt.cm.Paired)
    plt.xlabel(df.keys()[0])
    plt.ylabel(df.keys()[1])

    plt.xlim(xx.min(), xx.max())
    plt.ylim(yy.min(), yy.max())
    plt.xticks(())
    plt.yticks(())

    plt.savefig(_id + '/out.png')
    return(12)

if __name__ == "__main__":
    # Parse arguments
    parser = argparse.ArgumentParser("Perform Logistic Regression")
    parser.add_argument('--_id', dest='_id', default=None)
    parser.add_argument('--penalty', dest='penalty', default=None)
    params = vars(parser.parse_args())

    # Save result
    _id = params['_id']
    if not os.path.exists(_id):
        os.makedirs(_id)


    result = lr(params['penalty'],_id)
    print('Result = %f' % result)
    with open(os.path.join(_id, 'value.json'), 'w') as outfile:
        json.dump({'_scores': {'value': result}}, outfile)


