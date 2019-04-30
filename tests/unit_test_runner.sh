#!/bin/bash

REPORT_PATH="/appsrc/target/test-reports"
COVERAGE_PATH="/appsrc/target/test-reports/cobertura"

NOSE_TESTS="ai/tests/test_recommender.py ai/tests/test_ai.py ai/tests/test_ai_and_api_utils.py machine/test/learn_tests.py ai/tests/test_knowledgebase_loader.py ai/metalearning/tests/test_dataset_describe.py lab/pyutils/tests/test_loadInitialDatasets.py lab/pyutils/tests/test_validateDataset.py"
MOCHA_TESTS="machine/test/test.js"
#lab/webapp/src/components/FileUpload/FileUpload.test.js
rm -f "${REPORT_PATH}/nose_xunit.xml"
rm -f "${REPORT_PATH}/mocha_xunit.xml"
rm -drf "${COVERAGE_PATH}"

mkdir -p target/test-reports/cobertura/html
mkdir -p target/test-reports/html

nosetests -s \
--with-xunit --xunit-file="${REPORT_PATH}/nose_xunit.xml" \
--with-html --html-file="${REPORT_PATH}/html/nose.html" \
--with-coverage --cover-inclusive \
--cover-package=. --cover-xml \
--cover-xml-file="${COVERAGE_PATH}/nose_cover.xml" \
--cover-html --cover-html-dir="${COVERAGE_PATH}/html" $NOSE_TESTS

mocha --reporter xunit --reporter-options output="${REPORT_PATH}/mocha_xunit.xml" $MOCHA_TESTS

rm .coverage

cd "lab/webapp/"

export JEST_HTML_REPORTER_OUTPUT_PATH="${REPORT_PATH}/html/unit_webapp_jest_test_report.html"
export JEST_JUNIT_OUTPUT_DIR="${REPORT_PATH}"

npm run test

# todo: check for generated files and potentially remove
#       jest - snapshots, potentially use or disable
