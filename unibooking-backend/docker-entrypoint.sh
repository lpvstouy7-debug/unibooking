#!/bin/sh
# Runs once, every time the production container starts, before the app
# does. See the "Prisma migration strategy" comment in docker-compose.yml
# for why this is safe to run on every boot, including with multiple
# replicas of this same image running at once.
set -e

echo "[entrypoint] Applying Prisma migrations (migrate deploy)..."
npx prisma migrate deploy

echo "[entrypoint] Starting UniBooking API..."
exec node dist/main.js
