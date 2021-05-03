#!/bin/bash

dos2unix /appsrc/tests/unit/py_tests.sh
dos2unix /appsrc/tests/unit/js_tests.sh

. /appsrc/tests/unit/py_tests.sh
. /appsrc/tests/unit/js_tests.sh

echo "***"
echo "test non-zero exit"
exit 1