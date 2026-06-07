#!/bin/sh
set -eu

if [ "${AUTO_SEED:-true}" = "true" ]; then
  bun /app/seed.js
fi

exec bun /app/index.js
