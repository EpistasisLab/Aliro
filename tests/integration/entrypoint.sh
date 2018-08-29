#!/bin/bash

echo "waiting for lab to be responsive..."
/opt/wait-for-it.sh -t 300 lab:5080 -- echo "lab wait over"

echo "waiting for machine to be responsive..."
/opt/wait-for-it.sh -t 30 machine:5081 -- echo "machine wait over"

#npm test -- --json --outputFile="/results/jest.json"

# for now, hardcode some time for the datasets to get loaded
echo "hardcoded sleep to load datasets..."
sleep 90s
echo "starting tests..."
npm test