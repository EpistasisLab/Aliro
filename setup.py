#!/usr/bin/env python
# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

def calculate_version():
    initpy = open('ai/_version.py').read().split('\n')
    version = list(filter(lambda x: '__version__' in x, initpy))[0].split('\'')[1]
    return version

package_version = calculate_version()

setup(
    name='pennaipy',
    version=package_version,
    author='Heather Williams, Weixuan Fu, William La Cava',
    author_email='hwilli@pennmedicine.upenn.edu, weixuanf@pennmedicine.upenn.edu, lacava@upenn.edu',
    packages=find_packages(exclude=("tests",)),
    url='https://github.com/epistasislab/pennai',
    license='GNU/GPLv3',
    test_suite='nose.collector',
    tests_require=['nose'],
    description=('Penn Artificial Intelligence Data Assistant'),
    long_description='''
A system that intelligently manages machine learning workflows for data science

Contact:
===
- Heather Williams (hwilli@upenn.edu)
- Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
- William La Cava (lacava@upenn.edu)

This project is hosted at https://github.com/epistasislab/pennai
''',
    zip_safe=True,
    install_requires=['numpy>=1.16.3',
                    'scipy>=1.3.1',
                    'scikit-learn>=0.22.0',
                    'update_checker>=0.16',
                    'pandas>=0.24.2',
                    'joblib>=0.13.2'
                    ],
    classifiers=[
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Topic :: Scientific/Engineering :: Artificial Intelligence'
    ],
    keywords=['data science', 'machine learning','metalearning'],
)
