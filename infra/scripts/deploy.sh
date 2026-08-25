#!/bin/sh -eu

# (Boilerplate Variables)
SCRIPT_NAME=`basename "$0"`
PROJECT_ROOT=$(git rev-parse --show-toplevel)
INFRA_ROOT="$PROJECT_ROOT/infra"

# (Ensure we're in the infrastructure directory)
cd "$INFRA_ROOT"

# -------

BACKEND_CONFIG=${BACKEND_CONFIG:-backend.hcl}

if [ ! -f tfplan ]; then
  echo "$SCRIPT_NAME: no tfplan found. Run scripts/plan.sh first." >&2
  exit 1
fi

if [ ! -f "$BACKEND_CONFIG" ]; then
  echo "$SCRIPT_NAME: $BACKEND_CONFIG not found. Copy backend.hcl.example and fill it in." >&2
  exit 1
fi

# Init is idempotent, and apply cannot reach the backend without it. Repeating
# it here is what lets plan and apply run as separate jobs on separate
# checkouts, which is how CI will invoke them.
terraform init -backend-config="$BACKEND_CONFIG" -input=false

# Applying the saved plan means what ships is exactly what was reviewed;
# Terraform refuses the plan outright if the state has moved on since.
terraform apply -input=false tfplan

# A spent plan must not be applied a second time.
rm -f tfplan
