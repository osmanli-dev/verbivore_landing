# Verbivore Next.js + Directus CMS

## Stack
- **Next.js 16** with App Router (webpack build)
- **Directus 12** — headless CMS, in `directus-cms/`
- **SQLite** — `directus-cms/verbivore.db` (committed so the project ships with seeded demo data)

The Next.js app is a pure frontend: every page fetches its content from the
Directus REST API via `DIRECTUS_URL` (see `src/lib/directus.ts`, `src/lib/globals.ts`).

---

## Development (without Docker)

```bash
# Terminal 1 — Directus
cd directus-cms
npm install
npx directus start          # http://localhost:8055

# Terminal 2 — Next.js
cd verbivore-next
npm install
npm run dev                  # http://localhost:3000
```

`directus-cms/.env` holds `KEY`, `SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (copy
from `.env.example` on first setup). The Directus admin UI is at
`http://localhost:8055/admin`.

---

## Development with Docker (containerized dev database)

Runs Directus in a container (persisted SQLite data) plus Next.js with hot reload:

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: `http://localhost:3000`
- Directus admin: `http://localhost:8055/admin`

---

## Production / "enterprise" deployment

Docker builds and runs the two app services; nginx runs on the host as the
reverse proxy.

```bash
cp .env.example .env   # adjust DIRECTUS_* values for your domain/secrets
docker compose up -d --build
```

Both services bind to loopback only:

- Next.js frontend → `127.0.0.1:3000`
- Directus → `127.0.0.1:8055`

Both persist data via bind mounts to `directus-cms/` (`verbivore.db`,
`uploads/`, `extensions/`), so `docker compose down` / rebuilds don't lose data.

### Host nginx

A ready-made config lives in [`nginx/verbivore.conf`](nginx/verbivore.conf):
`verbivore.org` / `www.verbivore.org` → `127.0.0.1:3000`,
`admin.verbivore.org` → `127.0.0.1:8055`.

```bash
sudo cp nginx/verbivore.conf /etc/nginx/sites-available/verbivore.conf
sudo ln -s /etc/nginx/sites-available/verbivore.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Point `A` records for all three hostnames at the server, then issue
certificates (certbot rewrites the config for HTTPS and installs the renewal
timer itself):

```bash
sudo certbot --nginx -d verbivore.org -d www.verbivore.org -d admin.verbivore.org
```

Finally set `DIRECTUS_PUBLIC_URL=https://admin.verbivore.org` in `.env` and
run `docker compose up -d` again.

---

## Directus content structure

The admin nav is grouped into folders:

| Folder | Collections |
|--------|-------------|
| 📚 Yarış Mərhələləri | preliminary_page, national_final_page, sample_questions_page, preliminary_resources, exam_times, regulations, categories |
| 📄 Sayt Səhifələri | home_page, about_page, contact_page, editions_page, site_settings |
| 🌍 Məlumat Bazaları | countries, committee, certificates, partners |
| 📰 Media və Bloq | gallery, news, faq |

Plus top-level: `editions`, `inquiries`.

Seed scripts (idempotent, run from `directus-cms/`):

```bash
node seed/01-collections.mjs
node seed/02-seed.mjs
# ... through 16-azerbaijani-locale.mjs
```

### Azerbaijani admin app

The Directus 12 admin app ships an `az-AZ` translation pack but never registers
`az-AZ` in its list of available app languages, so the app silently refuses to
load it. `directus-cms/patches/@directus+app+16.1.0.patch` (applied
automatically via `npm install` / `postinstall`) adds `az-AZ` to that list so
the admin UI actually renders in Azerbaijani for users with `language: az-AZ`
(set by `seed/16-azerbaijani-locale.mjs`).

---

## Environment variables

### `verbivore-next/.env`
```env
DIRECTUS_URL=http://localhost:8055
```

### `directus-cms/.env`
```env
HOST="0.0.0.0"
PORT="8055"
PUBLIC_URL="http://localhost:8055"
KEY="..."
SECRET="..."
DB_CLIENT="sqlite3"
DB_FILENAME="./verbivore.db"
ADMIN_EMAIL="admin@verbivore.org"
ADMIN_PASSWORD="..."
CORS_ENABLED="true"
CORS_ORIGIN="true"
```
