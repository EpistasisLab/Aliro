#!/bin/bash

dos2unix /appsrc/tests/unit/py_tests.sh
dos2unix /appsrc/tests/unit/js_tests.sh

echo "* * * from unit_test_runner: "
ls -l /appsrc/tests/unit/py_tests.sh
sh /appsrc/tests/unit/py_tests.sh
pyres=$?
echo "==== py_tests unit tests result "$pyres

echo "* * * from unit_test_runner: "
ls -l /appsrc/tests/unit/js_tests.sh 
sh /appsrc/tests/unit/js_tests.sh
jsres=$?
echo "==== js_tests unit tests result "$jsres

# exit with code 1 if either test fails
if [ $pyres -eq 0 -a $jsres -eq 0 ]; then exit 0; else exit 1; fi
