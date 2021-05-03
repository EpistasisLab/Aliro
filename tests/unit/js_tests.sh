#!/bin/bash

# unit test runner for jest javascript tests

export JEST_JUNIT_OUTPUT_DIR="${REPORT_PATH}"

echo "starting '/lab' jest reports"
cd "/appsrc/lab/"
npm run test
echo "==== lab unit tests result "$?


echo "starting '/lab/webapp' jest reports"
cd "/appsrc/lab/webapp/"
npm run test
echo "==== webapp unit tests result "$?

cd "/appsrc"
