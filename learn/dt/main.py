#!/usr/bin/python3
import MySQLdb
import pandas as pd
from sklearn import tree
import numpy as np
from sklearn.cross_validation import train_test_split
from sklearn.externals.six import StringIO
from IPython.display import Image
import pydot

# Open database connection
mysql_cn = MySQLdb.connect("172.18.0.1", "root", "otgbh!", "gei")
# Prepare SQL query to INSERT a record into the database.
df_mysql = pd.read_sql("SELECT * FROM biomarkers", con=mysql_cn)
print('loaded dataframe from MySQL. records:', len(df_mysql))
# print(df_mysql)
mysql_cn.close()
# subset the columns and data we want
df = df_mysql
df = df.iloc[0:400, [1, 2, 4, 5, 7, 9, 12, 13, 14]]
# replace NA/NAN with 0
df['gender'] = df['gender'].map({'F': 1, 'M': 0})
# replace any Na values with zero
df = df.fillna(0)
#
df = df.set_index(df['id_subject'])
del df['id_subject']

# create a training and testing
X_train, X_test = train_test_split(df)

X_target = X_train.srcase
del X_train['srcase']

X_status = X_test.srcase
del X_test['srcase']

df_status = df.srcase
del df['srcase']

clf = tree.DecisionTreeClassifier()
clf = clf.fit(X_train, X_target)


with open("iris.dot", 'w') as f:
    f = tree.export_graphviz(clf, out_file=f)


features = clf.feature_importances_
print(features)
print(clf.predict(X_test))
print(X_status)
