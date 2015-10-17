# Calinski-Harabasz (FGMachine)

## Introduction

The Calinski-Harabasz criterion is a heuristic for comparing clustering solutions on the same data [1]. Without delving into the details or assumptions of either the clustering algorithms or the Calinkski-Harabasz criterion itself, this example will simply calculate the best solution found for the Iris flower dataset [2] by using grid search. The algorithms that will be compared are *k*-means clustering, agglomerative hierarchical clustering, and Gaussian mixture models. The number of clusters, *k*, will vary from 1-6.

## Instructions

This example requires [MATLAB](http://uk.mathworks.com/products/matlab/), and has been adapted from [Evaluate clustering solutions - MATLAB evalclusters](https://uk.mathworks.com/help/stats/evalclusters.html). The `matlab` binary must be available on [PATH](https://en.wikipedia.org/wiki/PATH_(variable\)).The [JSONlab](http://iso2mesh.sourceforge.net/cgi-bin/index.cgi?jsonlab) library should be available on [startup](https://uk.mathworks.com/help/matlab/ref/startup.html).

1. Set up [FGLab](https://github.com/Kaixhin/FGLab/blob/master/examples/Calinski-Harabasz).
1. Insert the [project](https://github.com/Kaixhin/FGLab/blob/master/examples/Calinski-Harabasz/projects.json) into FGMachine's `project.json` file, using the project ID from FGLab.
1. Start [grid search](https://github.com/Kaixhin/FGLab/blob/master/examples/Calinski-Harabasz).

Notice that since the `capacity` has been sent to 0.1, only 10 experiments will run at one time.

## Results

The following are the results of running the code on MATLAB R2015b - your results may vary, but the trends should remain: The ideal number of clusters is 3, and Gaussian mixture models perform poorly on this dataset.

| algorithm      | k | CH          |
|----------------|---|-------------|
| kmeans         | 3 | 561.6277566 |
| linkage        | 3 | 558.0580408 |
| kmeans         | 4 | 530.4920531 |
| linkage        | 4 | 515.0789062 |
| kmeans         | 2 | 513.924546  |
| linkage        | 2 | 502.8215635 |
| gmdistribution | 2 | 502.8215635 |
| kmeans         | 5 | 495.5414877 |
| linkage        | 5 | 488.484904  |
| gmdistribution | 3 | 483.0771101 |
| kmeans         | 6 | 473.6576725 |
| linkage        | 6 | 464.9493915 |
| gmdistribution | 4 | 380.0446615 |
| gmdistribution | 6 | 344.9350911 |
| gmdistribution | 5 | 315.5050093 |
| linkage        | 1 | \_NaN\_     |
| gmdistribution | 1 | \_NaN\_     |
| kmeans         | 1 | \_NaN\_     |

## Citations

[1] Caliński, T., & Harabasz, J. (1974). A dendrite method for cluster analysis. *Communications in Statistics-theory and Methods*, 3(1), 1-27.

[2] Fisher, R. A. (1936). The use of multiple measurements in taxonomic problems. *Annals of eugenics*, 7(2), 179-188.
