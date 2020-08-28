"""This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""
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
    author='William La Cava',
    author_email='lacava@upenn.edu',
    packages=find_packages(),
    url='https://github.com/epistasislab/pennai',
    # download_url='https://github.com/lacava/few/releases/tag/'+package_version,
    license='GNU/GPLv3',
    entry_points={'console_scripts': ['few=few:main', ]},
    test_suite='nose.collector',
    tests_require=['nose'],
    description=('Penn Artificial Intelligence Data Assistant'),
    long_description='''
A system that intelligenetly manages machine learning workflows for data science

Contact:
===
e-mail: lacava@upenn.edu

This project is hosted at https://github.com/epistasislab/penn-ai
''',
    zip_safe=True,
    install_requires=['numpy', 'pandas', 'scikit-learn',
                      'update_checker'],
    classifiers=[
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
        # 'Programming Language :: Python :: 2.7',
        # 'Programming Language :: Python :: 3',
        # 'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Topic :: Scientific/Engineering :: Artificial Intelligence'
    ],
    keywords=['data science', 'machine learning','metalearning'],
)
