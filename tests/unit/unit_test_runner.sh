#!/bin/bash

dos2unix /appsrc/tests/unit/py_tests.sh
dos2unix /appsrc/tests/unit/js_tests.sh

# run via sh to avoid permissions problem
sh /appsrc/tests/unit/py_tests.sh
pyres=$?
# echo "==== py_tests unit tests result "$pyres

# run via sh to avoid permissions problem
sh /appsrc/tests/unit/js_tests.sh
jsres=$?
# echo "==== js_tests unit tests result "$jsres

# exit with code 1 if either test fails
# If we don't exit with a non-zero value, github actions won't catch the error
if [ $pyres -eq 0 -a $jsres -eq 0 ]; then exit 0; else exit 1; fi
