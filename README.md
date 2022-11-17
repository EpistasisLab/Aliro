[![logo](./docs/source/_static/logo_blank_small.png)]()

[![license: gpl v3](https://img.shields.io/badge/license-gpl%20v3-blue.svg)](https://github.com/epistasislab/aliro/blob/master/license) [![aliro ci/cd](https://github.com/epistasislab/aliro/actions/workflows/aliro_tests.yml/badge.svg)](https://github.com/epistasislab/aliro/actions/workflows/aliro_tests.yml) [![coverage status](https://coveralls.io/repos/github/epistasislab/pennai/badge.svg)](https://coveralls.io/github/epistasislab/pennai)

aliro: ai-driven data science
==================================

**aliro** is an easy-to-use data science assistant.
it allows researchers without machine learning or coding expertise to run supervised machine learning analysis through a clean web interface. 
it provides results visualization and reproducible scripts so that the analysis can be taken anywhere. 
and, it has an *ai* assistant that can choose the analysis to run for you.   dataset profiles are generated and added to a knowledgebase as experiments are run, and the ai assistant learns from this to give more informed recommendations as it is used.   aliro comes with an initial knowledgebase generated from the [pmlb benchmark suite](https://github.com/epistasislab/penn-ml-benchmarks).

[**documentation**](https://epistasislab.github.io/aliro/) 

[**latest production release**](https://github.com/epistasislab/aliro/releases/latest)

browse the repo:
 - [user guide](./docs/guides/userguide.md)
 - [developer guide](./docs/guides/developerguide.md) 

about the project
=================

aliro is actively developed by the Center for Artificial Intelligence Research (CAIR) in the [Department of Computational Biomedicine](https://www.cedars-sinai.edu/research/departments-institutes/computational-biomedicine.html) at [Cedars-Sinai Medical Center](https://www.cedars-sinai.org/) in Los Angeles.
Contributors include Hyunjun Choi, Miguel Hernandez, Nick Matsumoto, Jay Moran, Paul Wang, and Jason Moore (PI).

cite
====

an up-to-date paper describing ai methodology is available in [bioinformatics](https://doi.org/10.1093/bioinformatics/btaa698) and [arxiv](http://arxiv.org/abs/1905.09205).
here's the biblatex:

```
@article{pennai_2020,
	title = {evaluating recommender systems for {ai}-driven biomedical informatics},
	url = {https://doi.org/10.1093/bioinformatics/btaa698},
	journaltitle = {bioinformatics},
	doi = {10.1093/bioinformatics/btaa698},
	year = {2020},
	author = {la cava, william and williams, heather and fu, weixuan and vitale, steve and srivatsan, durga and moore, jason h.},
	eprinttype = {arxiv},
	eprint = {1905.09205},
	keywords = {computer science - machine learning, computer science - information retrieval},
}
```

you can also find our original position paper on [arxiv](https://arxiv.org/abs/1705.00594).
