# Directus CMS — built from the project's own package.json/extensions so the
# custom emoji-picker / icon-picker interfaces work the same as in local dev.
FROM node:22-bookworm-slim

WORKDIR /directus

RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# patches/ must be present before `npm ci` — the postinstall hook runs
# patch-package (e.g. the @directus/app az-AZ locale patch).
COPY package.json package-lock.json ./
COPY patches ./patches
RUN npm ci --omit=dev

# The prebuilt sqlite3 binary requires a newer glibc than bookworm ships —
# rebuild it from source against this image's glibc.
RUN npm rebuild sqlite3 --build-from-source

COPY extensions ./extensions

ENV HOST=0.0.0.0
ENV PORT=8055
EXPOSE 8055

CMD ["npx", "directus", "start"]
