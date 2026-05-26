#!/bin/sh -eu

SCRIPT_NAME=$(basename "$0")
PROJECT_ROOT=$(git rev-parse --show-toplevel)

# shellcheck disable=SC1091
. "$PROJECT_ROOT/wikijs/.env"

CSS_FILE=$(mktemp)
cat > "$CSS_FILE" <<'CSS'
/* Hide the left navigation sidebar (page tree / custom nav). */
.nav-sidebar,
.page-col-sd {
  display: none !important;
}

/* Hide the page-header row (Home button, breadcrumb, page actions). */
.page-header {
  display: none !important;
}

/* Reclaim the freed horizontal space for content. */
.page-col-content {
  margin-left: 0 !important;
}
CSS

THEMING_JSON_B64=$(node -e "const fs=require('fs');const css=fs.readFileSync(process.argv[1],'utf8');const obj={theme:'default',darkMode:false,iconset:'mdi',injectCSS:css,injectHead:'',injectBody:'',tocPosition:'left'};process.stdout.write(Buffer.from(JSON.stringify(obj)).toString('base64'));" "$CSS_FILE")

cd "$PROJECT_ROOT/wikijs"
docker compose --env-file .env exec -T db psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "update settings set value = convert_from(decode('$THEMING_JSON_B64', 'base64'), 'UTF8')::json, \"updatedAt\" = to_char(now(), 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') where key = 'theming';"

echo "[$SCRIPT_NAME] Applied Wiki.js CSS overrides (hides sidebar + page-header)"

rm -f "$CSS_FILE"
