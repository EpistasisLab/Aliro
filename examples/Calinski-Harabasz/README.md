# Calinski-Harabasz (FGLab)

## Introduction

The Calinski-Harabasz criterion is a heuristic for comparing clustering solutions on the same data [1]. Without delving into the details or assumptions of either the clustering algorithms or the Calinkski-Harabasz criterion itself, this example will simply calculate the best solution found for the Iris flower dataset [2] by using grid search. The algorithms that will be compared are *k*-means clustering and agglomerative hierarchical clustering. The number of clusters, *k*, will vary from 1-6.

This example has been adapted from [Evaluate clustering solutions - MATLAB evalclusters](https://uk.mathworks.com/help/stats/evalclusters.html). 

## Requirements

- [MATLAB](http://uk.mathworks.com/products/matlab/)
- [JSONlab](http://iso2mesh.sourceforge.net/cgi-bin/index.cgi?jsonlab)

The `matlab` binary must be available on [PATH](https://en.wikipedia.org/wiki/PATH_(variable)). The JSONlab library should be available on [startup](https://uk.mathworks.com/help/matlab/ref/startup.html).

## Instructions

1. Create a new project from [calinski-harabasz.json](https://github.com/Kaixhin/FGLab/blob/master/examples/Calinski-Harabasz/calinski-harabasz.json).
1. Set up [FGMachine](https://github.com/Kaixhin/FGMachine/blob/master/examples/Calinski-Harabasz).
1. Open the optimisation page and change the following values for *k*:
  - min: 1
  - max: 7
  - #: 6
1. This example is simple, so reduce the Retry Timeout to 60s.
1. Start grid search.

## Results

The following are the results of running the code on MATLAB R2015b - your results may vary, but the trends should remain: The ideal number of clusters is 3.

| algorithm      | k | CH          |
|----------------|---|-------------|
| kmeans         | 3 | 561.6277566 |
| linkage        | 3 | 558.0580408 |
| kmeans         | 4 | 530.4920531 |
| linkage        | 4 | 515.0789062 |
| kmeans         | 2 | 513.924546  |
| linkage        | 2 | 502.8215635 |
| kmeans         | 5 | 495.5414877 |
| linkage        | 5 | 488.484904  |
| kmeans         | 6 | 473.6576725 |
| linkage        | 6 | 464.9493915 |
| linkage        | 1 | \_NaN\_     |
| kmeans         | 1 | \_NaN\_     |

Each experiment also produces two scatter plots to show the clustering - one based on sepal length vs. sepal width, and the other based on petal length vs. petal width.

## Citations

[1] Caliński, T., & Harabasz, J. (1974). A dendrite method for cluster analysis. *Communications in Statistics-theory and Methods*, 3(1), 1-27.

[2] Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. *Annals of eugenics*, 7(2), 179-188.
