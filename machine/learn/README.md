# Learn Overview

The scripts in this folder will build and evaluate model based on experiment requests from Aliro API.

To see options for machine learning algorithms defined in `projects.json` of Aliro, attach machine docker container (e.g. `docker exec -it "Aliro_machine_1" /bin/ba
sh`) and type `python learn/driver.py -h` to see options for machine learning algorithms in Aliro.

To check options for a specific algorithm from [scikit learn](https://scikit-learn.org/stable/), e.g [DecisionTreeClassifier](https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html), type `python learn/driver.py DecisionTreeClassifier -h`.
