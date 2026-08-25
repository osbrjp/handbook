#!/bin/sh -eu

# (Boilerplate Variables)
SCRIPT_NAME=`basename "$0"`
PROJECT_ROOT=$(git rev-parse --show-toplevel)
INFRA_ROOT="$PROJECT_ROOT/infra"

# (Ensure we're in the infrastructure directory)
cd "$INFRA_ROOT"

# -------

if [ ! -f tfplan ]; then
  echo "$SCRIPT_NAME: no tfplan found. Run scripts/plan.sh first." >&2
  exit 1
fi

# Applying the saved plan means what ships is exactly what was reviewed;
# Terraform refuses the plan outright if the state has moved on since.
terraform apply -input=false tfplan

# A spent plan must not be applied a second time.
rm -f tfplan
