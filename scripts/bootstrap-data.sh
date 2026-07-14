#!/usr/bin/env bash
# Puts the seed CMS data in place on a fresh clone. No-op when data already
# exists — live data (directus-cms/verbivore.db, uploads/) is untracked, so
# `git pull` never touches it and editors' changes survive deployments.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f directus-cms/verbivore.db ]; then
  cp directus-cms/seed-data/verbivore.db directus-cms/verbivore.db
  echo "seeded directus-cms/verbivore.db"
fi
if [ ! -d directus-cms/uploads ]; then
  cp -r directus-cms/seed-data/uploads directus-cms/uploads
  echo "seeded directus-cms/uploads/"
fi
echo "CMS data in place."
