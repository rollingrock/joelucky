#!/bin/bash
set -euo pipefail

if [ -f ".deploy_env" ]; then
  # shellcheck disable=SC1091
  source .deploy_env
fi

HOST="ams1-shared-01.dreamhost.com"
USER="jaspha2"
REMOTE_DIR="/home/jaspha2/jlmgt.org"

# Refuse to remove more than this many files from the live site without an
# explicit --force. Deploys that legitimately delete a lot — converting a
# gallery to JPEG, say — are rare and deliberate.
DELETE_LIMIT="${DELETE_LIMIT:-50}"

FORCE=0
if [ "${1:-}" = "--force" ]; then
  FORCE=1
fi

if [ -z "${DEPLOY_PASSWORD:-}" ]; then
  echo "DEPLOY_PASSWORD is not set. Expected it in .deploy_env" >&2
  exit 1
fi

echo "Building site..."
bundle exec jekyll build

# The rsync below mirrors _site/ with --delete, so whatever is missing locally
# is removed from the live site. Photo galleries are gitignored, so a fresh
# clone produces a _site with no images at all — deploying that would strip
# every photo off jlmgt.org and the server is a mirror, not a backup. Look at
# what would be removed before removing it.
if [ ! -s "_site/index.html" ]; then
  echo "Refusing to deploy: _site/index.html is missing or empty." >&2
  exit 1
fi

# WSL reports every file under /mnt/c as 0777, and -a would copy that mode to
# the server. Static HTML is served regardless; PHP under board/ is run as this
# user by suexec-style FastCGI and may refuse a world-writable script.
RSYNC_ARGS=(-avz --delete --chmod=D755,F644 -e "ssh -o StrictHostKeyChecking=no"
            _site/ "$USER@$HOST:$REMOTE_DIR/")

echo "Checking what this deploy would remove..."
PLAN="$(mktemp)"
trap 'rm -f "$PLAN"' EXIT
sshpass -p "$DEPLOY_PASSWORD" rsync --dry-run "${RSYNC_ARGS[@]}" > "$PLAN"
DELETIONS="$(grep -c '^deleting ' "$PLAN" || true)"

if [ "$DELETIONS" -gt "$DELETE_LIMIT" ] && [ "$FORCE" -eq 0 ]; then
  echo >&2
  echo "Refusing to deploy: this would delete $DELETIONS files from the live" >&2
  echo "site, over the limit of $DELETE_LIMIT. The first 20:" >&2
  grep '^deleting ' "$PLAN" | head -20 | sed 's/^/  /' >&2
  echo >&2
  echo "If that is intended, re-run:  ./deploy.sh --force" >&2
  exit 1
fi

echo "Deploying to $HOST ($DELETIONS files to be removed)..."
sshpass -p "$DEPLOY_PASSWORD" rsync "${RSYNC_ARGS[@]}"

echo "Deploy complete!"
