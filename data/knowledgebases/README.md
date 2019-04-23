# Knowledgebases

Knowledgebases are collections of previous results from machine learning analyses 
that are used to bootstrap PennAI. 

The results are stored in a .tsv.gz file. By default PennAI loads results from the
benchmark of scikit-learn described in these papers:

 - Olson, Randal S., William La Cava, Patryk Orzechowski, Ryan J. Urbanowicz, and 
Jason H. Moore. “PMLB: A Large Benchmark Suite for Machine Learning Evaluation and 
Comparison.” BioData Mining, 2017. [arxiv](https://arxiv.org/abs/1703.00512)

 - Olson\*, Randal S., William La Cava\*, Zairah Mustahsan, Akshay Varik, 
 and Jason H. Moore. “Data-Driven Advice for Applying Machine Learning to 
 Bioinformatics Problems.” In Pacific Symposium on Biocomputing (PSB), 2017. 
 [arxiv](http://arxiv.org/abs/1708.05070)

A knowledgebase also needs the metafeatures of the datasets it contains. 
The `processing` folder contains scripts to facilitate generating them, given a set
of datasets and the aformented set of results. 
See `generate_metafeatures.py` for an example.

