#!/bin/sh -eu

SCRIPT_NAME=$(basename "$0")
PROJECT_ROOT=$(git rev-parse --show-toplevel)
IMPORT_DIR="$PROJECT_ROOT/wikijs/generated-import"
CONTAINER_IMPORT_DIR="/wiki/import/handbook"

cd "$PROJECT_ROOT"

node wikijs/prepare-import.mjs

cd "$PROJECT_ROOT/wikijs"
docker compose --env-file .env ps wiki >/dev/null

docker compose --env-file .env exec -T --user root wiki sh -lc 'rm -rf /wiki/import/handbook && mkdir -p /wiki/import'
docker cp "$IMPORT_DIR/." handbook-wikijs:"$CONTAINER_IMPORT_DIR"
docker cp "$PROJECT_ROOT/wikijs/import-handbook.js" handbook-wikijs:/wiki/import-handbook.js
docker compose --env-file .env exec -T --user root wiki sh -lc 'chmod -R a+rwX /wiki/import /wiki/import-handbook.js'
docker compose --env-file .env exec -T wiki node /wiki/import-handbook.js "$CONTAINER_IMPORT_DIR"

echo "[$SCRIPT_NAME] Imported handbook pages into local Wiki.js"