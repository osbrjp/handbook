#!/bin/sh -eu

SCRIPT_NAME=$(basename "$0")
PROJECT_ROOT=$(git rev-parse --show-toplevel)

cd "$PROJECT_ROOT"

(cd landing && docker compose --env-file .env down)
(cd wikijs && docker compose --env-file .env down)

echo "[$SCRIPT_NAME] Both stacks stopped"
