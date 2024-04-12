<!-- [![Logo](./docs/source/_static/logo_blank_small.png)]() -->

[![Logo](https://media.githubusercontent.com/media/EpistasisLab/Aliro/master/docs/source/_static/aliro_brain_logo.png)]()

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://github.com/EpistasisLab/Aliro/blob/master/LICENSE)
[![Aliro CI/CD](https://github.com/EpistasisLab/Aliro/actions/workflows/aliro_tests.yml/badge.svg)](https://github.com/EpistasisLab/Aliro/actions/workflows/aliro_tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/EpistasisLab/Aliro/badge.svg)](https://coveralls.io/github/EpistasisLab/Aliro)
[![Downloads](https://img.shields.io/github/downloads/EpistasisLab/Aliro/total)](https://github.com/EpistasisLab/Aliro/releases)
[![Latest Downloads](https://img.shields.io/github/downloads/EpistasisLab/Aliro/latest/total?sort=semver)](https://github.com/EpistasisLab/Aliro/releases)

# Aliro: AI-Driven Data Science

**Aliro** is an easy-to-use data science assistant.
It allows researchers without machine learning or coding expertise to run supervised machine learning analysis through a clean web interface.
It provides results visualization and reproducible scripts so that the analysis can be taken anywhere.
And, it has an _AI_ assistant that can choose the analysis to run for you. Dataset profiles are generated and added to a knowledgebase as experiments are run, and the AI assistant learns from this to give more informed recommendations as it is used. Aliro comes with an initial knowledgebase generated from the [PMLB benchmark suite](https://github.com/EpistasisLab/penn-ml-benchmarks).

[**Documentation**](https://epistasislab.github.io/Aliro/)

[**Latest Production Release**](https://github.com/EpistasisLab/Aliro/releases/latest)

Browse the repo:

- [User Guide](./docs/guides/userGuide.md)
- [Developer Guide](./docs/guides/developerGuide.md)

# About the Project

Aliro is actively developed by the Center for AI Research and Education (CAIRE) in the [Department of Computational Biomedicine](https://www.cedars-sinai.edu/research/departments-institutes/computational-biomedicine.html) at [Cedars-Sinai Medical Center](https://www.cedars-sinai.org/) in Los Angeles, California, USA.  
Contributors include Hyunjun Choi, Miguel Hernandez, Nick Matsumoto, Jay Moran, Paul Wang, and Jason Moore (PI).

# Reproduce the ML Results on the QTc Project

This guide provides detailed instructions for loading and executing the trained model from the pickle file obtained through the Aliro model download feature for the QTc project. Please follow the instructions carefully.

## Initial Setup

- **Install Aliro**: Begin by installing the Aliro software on your local machine.
- **Download the Trained Model:**

  - Please download the trained model pickle file from Aliro and create a new folder named `test_trained_models` within the machine directory.

- **Store the Pickle File:**

  - Place the downloaded pickle file inside the `test_trained_models` folder and a test set in the machine directory.

- **Load and Test the Model:**
  - Write a Python script within the machine directory to load the pickle file from the `test_trained_models` folder and the test set in the machine directory.

## Working with Docker

### Start Docker Container:

- Use `docker ps -a` to list all containers.
- Identify the container you need based on its ID.
- Access the container by running `docker exec -it <container_id> /bin/bash`.
- **Run the Python Script:**
  - Execute the Python script within the Docker container to reproduce the model's performance.

# Cite

An up-to-date paper describing AI methodology is available in [Bioinformatics](https://doi.org/10.1093/bioinformatics/btaa698) and [arxiv](http://arxiv.org/abs/1905.09205).
Here's the biblatex:

```
@article{pennai_2020,
	title = {Evaluating recommender systems for {AI}-driven biomedical informatics},
	url = {https://doi.org/10.1093/bioinformatics/btaa698},
	journaltitle = {Bioinformatics},
	doi = {10.1093/bioinformatics/btaa698},
	year = {2020},
	author = {La Cava, William and Williams, Heather and Fu, Weixuan and Vitale, Steve and Srivatsan, Durga and Moore, Jason H.},
	eprinttype = {arxiv},
	eprint = {1905.09205},
	keywords = {Computer Science - Machine Learning, Computer Science - Information Retrieval},
}
```

You can also find our original position paper on [arxiv](https://arxiv.org/abs/1705.00594).
