#!/bin/bash

# unit test runner for jest javascript tests

export JEST_JUNIT_OUTPUT_DIR="${REPORT_PATH}"

echo "starting '/lab' jest reports"
cd "/appsrc/lab/"
npm run test
labres=$?
echo "==== labres unit tests result "$labres

echo "starting '/lab/webapp' jest reports"
cd "/appsrc/lab/webapp/"
npm run test
webappres=$?
echo "==== webappres unit tests result "$webappres

cd "/appsrc"

# exit with error code 1 if either test fails
if [ $labres -eq 0 -a $webappres -eq 0 ]; then exit 0; else exit 1; fi
