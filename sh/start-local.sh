#!/bin/sh -eu

SCRIPT_NAME=$(basename "$0")
PROJECT_ROOT=$(git rev-parse --show-toplevel)

cd "$PROJECT_ROOT"

if [ ! -f "landing/.env" ]; then
  cp landing/.env.example landing/.env
  echo "[$SCRIPT_NAME] Created landing/.env from .env.example"
fi

if [ ! -f "wikijs/.env" ]; then
  cp wikijs/.env.example wikijs/.env
  echo "[$SCRIPT_NAME] Created wikijs/.env from .env.example"
fi

echo "[$SCRIPT_NAME] Building VitePress landing page..."
npx vitepress build doc

echo "[$SCRIPT_NAME] Starting landing stack..."
(cd landing && docker compose --env-file .env up -d)

echo "[$SCRIPT_NAME] Starting Wiki.js stack..."
(cd wikijs && docker compose --env-file .env up -d)

LANDING_PORT=$(grep -E '^LANDING_PORT=' landing/.env | cut -d= -f2)
WIKI_PORT=$(grep -E '^WIKI_PORT=' wikijs/.env | cut -d= -f2)

echo "[$SCRIPT_NAME] Stacks are starting..."
echo "[$SCRIPT_NAME] Landing page: http://localhost:${LANDING_PORT:-8080}"
echo "[$SCRIPT_NAME] Wiki.js:      http://localhost:${WIKI_PORT:-3000}"
echo "[$SCRIPT_NAME] First Wiki.js boot can take up to a minute."
