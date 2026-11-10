#!/bin/sh
# Builds a project app that uses this repo as the Nuxt layer in ./layers/feedlog, for Cloudflare Workers.
# Run it from the project app directory. Then: wrangler deploy --config .output/server/wrangler.json
set -e
[ -f layers/feedlog/nuxt.config.ts ] || { echo "run this from a project app that holds this repo in layers/feedlog" >&2; exit 1; }
(cd layers/feedlog && pnpm install --frozen-lockfile)
ln -sfn layers/feedlog/node_modules node_modules
NITRO_PRESET=cloudflare-module NODE_OPTIONS="--max-old-space-size=8192 $NODE_OPTIONS" node_modules/.bin/nuxt build
mkdir -p .output/server/db
cp -r layers/feedlog/server/db/migrations .output/server/db/migrations
