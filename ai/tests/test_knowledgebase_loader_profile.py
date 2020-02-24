

import ai.knowledgebase_loader as kb_loader
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

TEST_OUTPUT_PATH = "target/test_output/test_knowledgebase_loader"

class TestResultUtils(unittest.TestCase):    
    def test_profile_load_results_from_file(self):

        #kb_file = 'data/knowledgebases/sklearn-benchmark5-data-knowledgebase-small.tsv.gz'
        kb_file = 'data/knowledgebases/pmlb_regression_results.tsv.gz'

        start_time = time.time()
        cProfile.runctx('df = kb_loader._load_results_from_file(kb_file)', 
            globals(), locals(), "target/test-reports/profile/load_results_profile.cprof")
        print("--- %s seconds ---" % (time.time() - start_time))

        start_time = time.time()
        cProfile.runctx('kb_loader._load_results_from_file_set(kb_file)', 
            globals(), locals(), "target/test-reports/profile/load_results_set_profile.cprof")
        print("--- %s seconds ---" % (time.time() - start_time))

        #df = kb_loader._load_results_from_file(kb_file)

        start_time = time.time()
        cProfile.runctx('kb_loader.dedupe_results_dataframe(df)', 
            globals(), locals(), "target/test-reports/profile/dedupe_profile.cprof")
        print("--- %s seconds ---" % (time.time() - start_time))


        self.assertEquals(1, 1)

  