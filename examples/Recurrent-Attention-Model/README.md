# Recurrent Attention Model (FGMachine)

## Introduction

The Recurrent Attention Model (RAM) [1] is a recurrent neural network that uses the REINFORCE algorithm [2] to take multiple *glimpses* of its 2D spatial input. At every time step, the RAM produces both the location for its next glimpse, and potentially an action, such as a classification of its input data.

## Requirements

- [Torch7](http://torch.ch/)
- [dpnn](https://github.com/nicholas-leonard/dpnn)
- [rnn](https://github.com/Element-Research/rnn)
- [mnist](https://github.com/andresy/mnist)

`luarocks install <package>` can be used to install the `dpnn`, `rnn` and `mnist` libraries once Torch7 is installed.

## Instructions

This example has been adapted from [Recurrent Model of Visual Attention](http://torch.ch/blog/2015/09/21/rmva.html). 

1. Set up [FGLab](https://github.com/Kaixhin/FGLab/blob/master/examples/Recurrent-Attention-Model).
1. Insert the [project](https://github.com/Kaixhin/FGMachine/blob/master/examples/Recurrent-Attention-Model/project.json) into FGMachine's `projects.json` file, using the project ID from FGLab.
1. [Submit an experiment](https://github.com/Kaixhin/FGLab/blob/master/examples/Recurrent-Attention-Model).

## Results

The code produces a plot of the training losses, and calculates the accuracy of the RAM on the test set after training. In addition the policy for taking glimpses is visualised, providing `glimpse<x>.png` for the first 5 test images, where `<x>` is the time step, as shown below:

![glimpse1](https://raw.githubusercontent.com/Kaixhin/FGMachine/master/examples/Recurrent-Attention-Model/glimpse1.png)

For each glimpse, the extracted patches, `patch<x>.png`, are also extracted:

![patch1](https://raw.githubusercontent.com/Kaixhin/FGMachine/master/examples/Recurrent-Attention-Model/patch1.png)

## Citations

[1] Mnih, V., Heess, N., & Graves, A. (2014). Recurrent models of visual attention. In *Advances in Neural Information Processing Systems* (pp. 2204-2212).

[2] Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine learning*, 8(3-4), 229-256.
