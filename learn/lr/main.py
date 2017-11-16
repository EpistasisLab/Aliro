#!/usr/bin/python3
import numpy as np
import matplotlib as mpl
# run without X
mpl.use('Agg')
import matplotlib.pyplot as plt
from sklearn import linear_model, datasets
import pandas as pd
import argparse
import os
import json
import urllib3
import pycurl
import time
http = urllib3.PoolManager()

basedir = '/share/devel/Gp/learn/lr/'
tmpdir = basedir + 'tmp/'


def lr(penalty, _id, file_name):
    # import reduced GEI phenotype data
    df = pd.read_csv(tmpdir + file_name)
    df = df.set_index(df['id_subject'])

    del df['id_subject']
    X = df
    Y = X['srcase']
    del X['srcase']

    X = X.as_matrix()
    Y = Y.as_matrix()

    h = .02  # step size in the mesh

    logreg = linear_model.LogisticRegression(C=1e5)
    # we create an instance of Neighbours Classifier and fit the data.
    logreg.fit(X, Y)

    # Plot the decision boundary. For that, we will assign a color to each
    # point in the mesh [x_min, m_max]x[y_min, y_max].
    x_min, x_max = X[:, 0].min(), X[:, 0].max()
    y_min, y_max = X[:, 1].min(), X[:, 1].max()
    xx, yy = np.meshgrid(np.arange(x_min, x_max, h),
                         np.arange(y_min, y_max, h))
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

    plt.savefig(tmpdir + _id + '/out.png')
    return(12)


if __name__ == "__main__":
    # Parse arguments
    parser = argparse.ArgumentParser("Perform Logistic Regression")
    parser.add_argument('--_id', dest='_id', default=None)
    parser.add_argument('--penalty', dest='penalty', default=None)
    params = vars(parser.parse_args())

    # Save all attached files
    _id = params['_id']
    if not os.path.exists(tmpdir + _id):
        os.makedirs(tmpdir + _id)

    response = http.request('GET', 'http://lab:5080/api/v1/experiments/' + _id)
    jsondata = json.loads(response.data.decode('utf-8'))
    files = jsondata['_files']
    numfiles = 0
    file_name = ''

    for x in files:
        time.sleep(5)
        file_id = x['_id']
        file_name = x['filename']
        c = pycurl.Curl()
        c.setopt(c.URL, 'http://lab:5080/api/v1/files/' + file_id)
        with open(tmpdir + file_name, 'wb') as f:
            c.setopt(c.WRITEFUNCTION, f.write)
            c.perform()
            c.close()
            numfiles += 1
    if numfiles == 1:
        result = lr(params['penalty'], _id, file_name)
    else:
        result = 0

    if not os.path.exists(tmpdir + _id):
        os.makedirs(tmpdir + _id)

    print('Result = %f' % result)
    with open(os.path.join(tmpdir + _id, 'value.json'), 'w') as outfile:
        json.dump({'_scores': {'value': result}}, outfile)
