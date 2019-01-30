# coding: utf-8
import numpy as np
import pandas as pd
df = pd.read_csv('machine/test/test_categories.tsv', sep='\t')
df
df.head()
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
from sklearn.pipeline import make_pipeline
transform_cols = [("onehotencoder", OneHotEncoder(), [4])]
ct = ColumnTransformer(
                                transform_cols,
                                 remainder='passthrough',
                                 sparse_threshold=0
                                 )
                                 
from sklearn.tree import DecisionTreeClassifier
ds = DecisionTreeClassifier()
y = df['class']
X = df.drop('class', axis=1).values
X
y = df['class'].values
model = make_pipeline(ct, ds)
model
model.fit(X, y)
from sklearn.model_selection import train_test_split, cross_val_score
cv_scores = cross_val_score(
                                    estimator=model,
                                    X=X,
                                    y=y,
                                    scoring="accuracy",
                                    cv=5
                                    )
                                    
X[:5]
model
model.get_params()
get_ipython().magic('save 1-25 test')
