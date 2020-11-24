#!/bin/bash

# Options for which test(s) to run.
# Set environment variables to any value to run a subset of tests.
# If none are set, all tests will be run.
# You can pass env vars to your doccker container using -e option.
# So, for example
#    docker-compose -f .\docker-compose-unit-test.yml up --abort-on-container-exit
# Make sure to export your defines if running manually from a shell.
#
#   export PENNAI_UNIT_TEST_NOSE=1
#   export PENNAI_UNIT_TEST_MOCHA=1
#   export PENNAI_UNIT_TEST_JEST=1 - run both Jest tests
#   export PENNAI_UNIT_TEST_JEST_LAB - run just the Jest tests for Lab
#   export PENNAI_UNIT_TEST_JEST_WEBAPP - run just the Jest tests for webapp

RUN_ALL=0
if  [ ! $PENNAI_UNIT_TEST_NOSE ] && \
    [ ! $PENNAI_UNIT_TEST_MOCHA ] && \
    [ ! $PENNAI_UNIT_TEST_JEST ] && \
    [ ! $PENNAI_UNIT_TEST_JEST_LAB ] && \
    [ ! $PENNAI_UNIT_TEST_JEST_WEBAPP]; then RUN_ALL=1; fi

if [ $RUN_ALL -eq 1 ]; then 
    echo "Running all unit tests."; 
else 
    echo "Running sub-set of unit tests."
fi

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
##NOSE_TESTS="${NOSE_TESTS} ai/tests/test_knowledgebase_utils_profile.py"

MOCHA_TESTS="machine/test/test.js"

rm -f "${REPORT_PATH}/nose_xunit.xml"
rm -f "${REPORT_PATH}/mocha_xunit.xml"
rm -drf "${COVERAGE_PATH}"

mkdir -p target/test-reports/cobertura/html
mkdir -p target/test-reports/html

if [ $RUN_ALL -eq 1 ] || [ $PENNAI_UNIT_TEST_NOSE ]; then
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
fi

if [ $RUN_ALL -eq 1 ] || [ $PENNAI_UNIT_TEST_MOCHA ]; then
    echo "starting mocha tests"
    mocha --reporter xunit --reporter-options output="${REPORT_PATH}/mocha_xunit.xml" $MOCHA_TESTS
fi

# jest tests
export JEST_JUNIT_OUTPUT_DIR="${REPORT_PATH}"

if [ $RUN_ALL -eq 1 ] || [ $PENNAI_UNIT_TEST_JEST ] || [ $PENNAI_UNIT_TEST_JEST_LAB ]; then
    echo "starting lab jest reports"
    cd "/appsrc/lab/"
    npm run test
fi

if [ $RUN_ALL -eq 1 ] || [ $PENNAI_UNIT_TEST_JEST ] || [ $PENNAI_UNIT_TEST_JEST_WEBAPP ]; then
    echo "starting webapp jest reports"
    cd "/appsrc/lab/webapp/"
    npm run test
fi

# todo: check for generated files and potentially remove
#       jest - snapshots, potentially use or disable
