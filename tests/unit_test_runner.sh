#!/bin/bash
rm -drf target
mkdir -p target/test-reports/cobertura/html

REPORT_PATH="target/test-reports"
COVERAGE_PATH="target/test-reports/cobertura"

nosetests -s --with-xunit --xunit-file="${REPORT_PATH}/nose_xunit.xml" --with-coverage  --cover-inclusive --cover-package=. --cover-xml --cover-xml-file="${COVERAGE_PATH}/nose_cover.xml" --cover-html --cover-html-dir="${COVERAGE_PATH}/html" ai/tests/test_recommender.py ai/tests/test_ai.py ai/tests/test_ai_db_utils.py machine/test/learn_tests.py

rm .coverage