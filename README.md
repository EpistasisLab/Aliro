# FGLab

FGLab is a machine learning dashboard, designed to facilitate performing experiments. It uses RESTful endpoints to pass data to a (MongoDB) database, which allows analytics to be performed on experiments after their completion.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Objects

### Experiments

An **experiment** is one complete training and testing run of a specific machine learning **model** on a specific **dataset** with a specific set of **hyperparameters**. An experiment *should* be repeatable i.e. all random seeds should be specified. However, if the dataset contains randomness that cannot be accounted for, for example a live stream of data, then experiments will not be perfectly repeatable. Therefore, each with the same dataset, model and hyperparameters will be assigned a unique ID.

The current schema is:

```
timestamp: Int (ms since epoch)
hyperparams: {Object}
model: String
train:
  losses: [Number]
  freq: Int (number of iterations between logging loss)
val:
  losses: [Number]
  freq: Int
test:
  loss: Number
  score: Number (e.g. classification accuracy)
```

The endpoints are as follows:

| URL                  | HTTP Verb | Body | Result                 |
|----------------------|-----------|------|------------------------|
| /api/experiments     | GET       |      | Returns all entries    |
| /api/experiments     | POST      | JSON | Creates new entry      |
| /api/experiments/:id | GET       |      | Returns single entry   |
| /api/experiments/:id | PUT       | JSON | Updates existing entry |
| /api/experiments/:id | DELETE    |      | Deletes existing entry |

### Datasets

A dataset is traditionally split into training, validation and test sets, that are fixed for every model...

### Models

There are a variety of machine learning models available, ranging from random forests to SVMs, with all sorts of combinations possible. Therefore it is up to you to decide the appropriate schema for your model.

### Hyperparameters

With a specified dataset and model, the hyperparameters are what we seek to tune. By plotting the losses stored during training and validation, more information can be gained about the difference between hyperparameter options.
