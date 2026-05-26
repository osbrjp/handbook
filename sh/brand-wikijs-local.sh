#!/bin/sh -eu
#
# Replace the Wiki.js logo and title with the OSBR brand.
# Embeds doc/public/logo1.svg as a data URI so no asset hosting is needed.

SCRIPT_NAME=$(basename "$0")
PROJECT_ROOT=$(git rev-parse --show-toplevel)

# shellcheck disable=SC1091
. "$PROJECT_ROOT/wikijs/.env"

LOGO_PATH="$PROJECT_ROOT/doc/public/logo1.svg"
SITE_TITLE="${SITE_TITLE:-OSBR}"

if [ ! -f "$LOGO_PATH" ]; then
  echo "[$SCRIPT_NAME] Logo not found at $LOGO_PATH" >&2
  exit 1
fi

LOGO_DATA_URI="data:image/svg+xml;base64,$(base64 < "$LOGO_PATH" | tr -d '\n')"

cd "$PROJECT_ROOT/wikijs"

docker compose --env-file .env exec -T db psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
update settings
   set value = json_build_object('v', '$SITE_TITLE'),
       "updatedAt" = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
 where key = 'title';

insert into settings (key, value, "updatedAt")
values ('logoUrl', json_build_object('v', '$LOGO_DATA_URI'),
        to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
on conflict (key) do update
   set value = excluded.value,
       "updatedAt" = excluded."updatedAt";
SQL

echo "[$SCRIPT_NAME] Restarting Wiki.js to pick up new config..."
docker compose --env-file .env restart wiki >/dev/null

echo "[$SCRIPT_NAME] Set title='$SITE_TITLE' and embedded logo from $LOGO_PATH"
