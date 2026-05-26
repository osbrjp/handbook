#!/bin/sh -eu

# (Boilerplate Variables)
SCRIPT_NAME=`basename "$0"`
PROJECT_ROOT=$(git rev-parse --show-toplevel)
PROJECT_NAME=$(basename $PROJECT_ROOT | sed s/-//g)

# (Ensure we're in the root directory of the git repository)
cd $PROJECT_ROOT

# -------

if ! command -v pnpm >/dev/null 2>&1; then
	echo "Error: pnpm is not installed." >&2
	exit 1
fi

pnpm install
pnpm run docs:dev
