#!/bin/sh -eu

# (Boilerplate Variables)
SCRIPT_NAME=`basename "$0"`
PROJECT_ROOT=$(git rev-parse --show-toplevel)
PROJECT_NAME=$(basename $PROJECT_ROOT | sed s/-//g)

# (Ensure we're in the root directory of the git repository)
cd $PROJECT_ROOT

# -------

npm install
npm run docs:dev
