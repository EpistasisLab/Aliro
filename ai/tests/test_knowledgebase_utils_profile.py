"""~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - Michael Stauffer (mgstauff@gmail.com)
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

(Autogenerated header, do not modify)

"""


import ai.knowledgebase_utils as kb_utils
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import (nottest, raises, assert_equals, 
        assert_is_instance, assert_dict_equal)
from parameterized import parameterized
import pandas as pd
import pprint
import math
import cProfile
from pstats import Stats
import re
import time

TEST_OUTPUT_PATH = "target/test_output/test_knowledgebase_utils"

class TestResultUtils(unittest.TestCase):    
    def test_profile_load_results_from_file(self):

        #kb_file = 'data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz'
        kb_file = 'data/knowledgebases/pmlb_regression_results.tsv.gz'

        start_time = time.time()
        cProfile.runctx('df = kb_utils._load_results_from_file(kb_file)', 
            globals(), locals(), "target/test-reports/profile/load_results_profile.cprof")
        print("--- %s seconds ---" % (time.time() - start_time))

        start_time = time.time()
        cProfile.runctx('kb_utils._load_results_from_file_set(kb_file)', 
            globals(), locals(), "target/test-reports/profile/load_results_set_profile.cprof")
        print("--- %s seconds ---" % (time.time() - start_time))

        #df = kb_utils._load_results_from_file(kb_file)

        start_time = time.time()
        cProfile.runctx('kb_utils.dedupe_results_dataframe(df)', 
            globals(), locals(), "target/test-reports/profile/dedupe_profile.cprof")
        print("--- %s seconds ---" % (time.time() - start_time))


        self.assertEquals(1, 1)

  