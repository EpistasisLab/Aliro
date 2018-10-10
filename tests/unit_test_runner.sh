#!/bin/bash

#rm -drf target
REPORT_PATH="target/test-reports"
COVERAGE_PATH="target/test-reports/cobertura"

rm -f "${REPORT_PATH}/nose_xunit.xml"
rm -drf "${COVERAGE_PATH}"

mkdir -p target/test-reports/cobertura/html

nosetests -s --with-xunit --xunit-file="${REPORT_PATH}/nose_xunit.xml" --with-coverage  --cover-inclusive --cover-package=. --cover-xml --cover-xml-file="${COVERAGE_PATH}/nose_cover.xml" --cover-html --cover-html-dir="${COVERAGE_PATH}/html" ai/tests/test_recommender.py ai/tests/test_ai.py machine/test/learn_tests.py

rm .coverage