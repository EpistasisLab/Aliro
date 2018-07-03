#!/bin/bash

echo "waiting for lab to be responsive..."
/opt/wait-for-it.sh -t 200 lab:5080 -- echo "lab wait over"

echo "waiting for machine to be responsive..."
/opt/wait-for-it.sh -t 30 machine:5081 -- echo "machine wait over"

#npm test -- --json --outputFile="/results/jest.json"
npm test