#!/bin/sh -eu

# (Boilerplate Variables)
SCRIPT_NAME=`basename "$0"`
PROJECT_ROOT=$(git rev-parse --show-toplevel)
INFRA_ROOT="$PROJECT_ROOT/infra"

# (Ensure we're in the infrastructure directory)
cd "$INFRA_ROOT"

# -------

BACKEND_CONFIG=${BACKEND_CONFIG:-backend.hcl}

if [ ! -f "$BACKEND_CONFIG" ]; then
  echo "$SCRIPT_NAME: $BACKEND_CONFIG not found. Copy backend.hcl.example and fill it in." >&2
  exit 1
fi

terraform init -backend-config="$BACKEND_CONFIG" -input=false
terraform fmt -check -recursive
terraform validate
node --test functions/*.test.mjs

# The saved plan is what deploy.sh applies, so nothing is applied that a human
# has not read first.
terraform plan -input=false -out=tfplan "$@"

echo "$SCRIPT_NAME: wrote $INFRA_ROOT/tfplan. Review it, then run scripts/deploy.sh."
