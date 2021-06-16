#!/bin/bash

# NOTE
# To run only the python tests (py_tests.sh) or only the web/javascript tests
# (js_tests.sh), set the appropriate env var, as used below.
# With docker-compose, use the --env-file param and pass either of
# config/unit-test-js-only.env, or
# config/unit-test-py-only.env

dos2unix /appsrc/tests/unit/py_tests.sh
dos2unix /appsrc/tests/unit/js_tests.sh

# initialize
pyres=0
jsres=0

# run via sh to avoid permissions problem
if [ -z "${PENNAI_UNIT_TESTS_JS_ONLY}" ]; then
  sh /appsrc/tests/unit/py_tests.sh
  pyres=$?
  # echo "==== py_tests unit tests result "$pyres
else
  echo "$0 - skipped py_tests"
fi

# run via sh to avoid permissions problem
if [ -z "${PENNAI_UNIT_TESTS_PY_ONLY}" ]; then
  sh /appsrc/tests/unit/js_tests.sh
  jsres=$?
  # echo "==== js_tests unit tests result "$jsres
else
  echo "$0 - skipped js_tests"
fi

# exit with code 1 if either test fails
# If we don't exit with a non-zero value, github actions won't catch the error
if [ $pyres -eq 0 -a $jsres -eq 0 ]; then exit 0; else exit 1; fi
