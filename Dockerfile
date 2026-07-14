# ── Stage 1: install dependencies ─────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ── Stage 2: build ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# The /cms-assets rewrite destination is baked into routes-manifest.json at
# build time, so DIRECTUS_URL must point at the compose-network hostname here
# (runtime env only affects server-side fetches, not the rewrite).
ARG DIRECTUS_URL=http://directus:8055
ENV DIRECTUS_URL=$DIRECTUS_URL

RUN npm run build

# ── Stage 3: production runner ─────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy everything needed to run
COPY --from=builder --chown=nextjs:nodejs /app/public       ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next        ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json  ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/src            ./src

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start"]
