#!/bin/bash

# unit test runner for python tests
REPORT_PATH="/appsrc/target/test-reports"
COVERAGE_PATH="/appsrc/target/test-reports/cobertura"
NOSE_LOG_PATH="/appsrc/target/test-reports/nose.log"


NOSE_TESTS="/appsrc/ai/tests/test_recommender.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/ai/tests/test_ai.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/ai/tests/test_ai_and_api_utils.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/ai/tests/test_api_utils.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/ai/tests/test_knowledgebase_utils.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/ai/metalearning/tests/test_dataset_describe.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/ai/metalearning/tests/test_get_metafeatures.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/machine/test/learn_tests.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/lab/pyutils/tests/test_loadInitialDatasets.py"
NOSE_TESTS="${NOSE_TESTS} /appsrc/lab/pyutils/tests/test_validateDataset.py"
##NOSE_TESTS="${NOSE_TESTS} ai/tests/test_knowledgebase_utils_profile.py"

MOCHA_TESTS="/appsrc/machine/test/test.js"


rm -f "${REPORT_PATH}/nose_xunit.xml"
rm -f "${REPORT_PATH}/mocha_xunit.xml"
rm -drf "${COVERAGE_PATH}"

mkdir -p "${REPORT_PATH}/cobertura/html"
mkdir -p "${REPORT_PATH}/html"

echo "starting nosetest"
echo $NOSE_TESTS

coverage run -m nose -s \
--with-xunit --xunit-file="${REPORT_PATH}/nose_xunit.xml" \
--with-html --html-file="${REPORT_PATH}/html/nose.html" \
-v $NOSE_TESTS \
#--verbosity=4
#--verbosity=4 > $NOSE_LOG_PATH 2>&1

coverage combine
coverage html -d "${COVERAGE_PATH}/html"
coverage xml -o "${COVERAGE_PATH}/nose_cover.xml"

echo "coverage erase"
coverage erase

echo "starting mocha tests"
mocha --reporter xunit --reporter-options output="${REPORT_PATH}/mocha_xunit.xml" $MOCHA_TESTS
