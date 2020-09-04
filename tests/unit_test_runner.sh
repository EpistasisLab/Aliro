#!/bin/bash

REPORT_PATH="/appsrc/target/test-reports"
COVERAGE_PATH="/appsrc/target/test-reports/cobertura"
NOSE_LOG_PATH="/appsrc/target/test-reports/nose.log"


NOSE_TESTS="ai/tests/test_recommender.py"
NOSE_TESTS="${NOSE_TESTS} ai/tests/test_ai.py"
NOSE_TESTS="${NOSE_TESTS} ai/tests/test_ai_and_api_utils.py"
NOSE_TESTS="${NOSE_TESTS} ai/tests/test_api_utils.py"
NOSE_TESTS="${NOSE_TESTS} ai/tests/test_knowledgebase_utils.py"
NOSE_TESTS="${NOSE_TESTS} ai/metalearning/tests/test_dataset_describe.py"
NOSE_TESTS="${NOSE_TESTS} ai/metalearning/tests/test_get_metafeatures.py"
NOSE_TESTS="${NOSE_TESTS} machine/test/learn_tests.py"
NOSE_TESTS="${NOSE_TESTS} lab/pyutils/tests/test_loadInitialDatasets.py"
NOSE_TESTS="${NOSE_TESTS} lab/pyutils/tests/test_validateDataset.py"
#NOSE_TESTS="${NOSE_TESTS} ai/tests/test_knowledgebase_utils_profile.py"

MOCHA_TESTS="machine/test/test.js"

rm -f "${REPORT_PATH}/nose_xunit.xml"
rm -f "${REPORT_PATH}/mocha_xunit.xml"
rm -drf "${COVERAGE_PATH}"

mkdir -p target/test-reports/cobertura/html
mkdir -p target/test-reports/html

echo "starting nosetest"
echo $NOSE_TESTS
nosetests -s \
--with-xunit --xunit-file="${REPORT_PATH}/nose_xunit.xml" \
--with-html --html-file="${REPORT_PATH}/html/nose.html" \
--with-coverage --cover-inclusive \
--cover-package=. --cover-xml \
--cover-xml-file="${COVERAGE_PATH}/nose_cover.xml" \
--cover-html --cover-html-dir="${COVERAGE_PATH}/html" $NOSE_TESTS \
#--verbosity=4
#--verbosity=4 > $NOSE_LOG_PATH 2>&1

# rm .coverage

echo "starting mocha tests"
mocha --reporter xunit --reporter-options output="${REPORT_PATH}/mocha_xunit.xml" $MOCHA_TESTS


# jest tests
export JEST_JUNIT_OUTPUT_DIR="${REPORT_PATH}"

echo "starting lab jest reports"
cd "/appsrc/lab/"
npm run test


echo "starting webapp jest reports"
cd "/appsrc/lab/webapp/"
npm run test

# todo: check for generated files and potentially remove
#       jest - snapshots, potentially use or disable
