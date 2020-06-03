#!/usr/bin/env python
# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

def calculate_version():
    initpy = open('ai/_version.py').read().split('\n')
    version = list(filter(lambda x: '__version__' in x, initpy))[0].split('\'')[1]
    return version

package_version = calculate_version()

setup(
    name='pennai',
    version=package_version,
    author='William La Cava, Heather Williams and Weixuan Fu',
    author_email='lacava@upenn.edu, hwilli@pennmedicine.upenn.edu and weixuanf@pennmedicine.upenn.edu',
    packages=find_packages(),
    url='https://github.com/epistasislab/pennai',
    license='GNU/GPLv3',
    entry_points={'console_scripts': ['pennai=pennai:main', ]},
    test_suite='nose.collector',
    tests_require=['nose'],
    description=('Penn Artificial Intelligence Data Assistant'),
    long_description='''
A system that intelligenetly manages machine learning workflows for data science

Contact:
===
e-mail: lacava@upenn.edu

This project is hosted at https://github.com/epistasislab/pennai
''',
    zip_safe=True,
    install_requires=['numpy>=1.16.3',
                    'scipy>=1.3.1',
                    'scikit-learn>=0.22.0',
                    'update_checker>=0.16',
                    'pandas>=0.24.2',
                    'joblib>=0.13.2',
                    'surprise>=1.0.8'
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
