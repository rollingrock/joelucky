#!/bin/bash
set -e

if [ -f ".deploy_env" ]; then
  source .deploy_env
fi

HOST="ams1-shared-01.dreamhost.com"
USER="jaspha2"
REMOTE_DIR="/home/jaspha2/jlmgt.org"

echo "Building site..."
bundle exec jekyll build

echo "Deploying to $HOST..."
sshpass -p "$DEPLOY_PASSWORD" rsync -avz --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  _site/ \
  "$USER@$HOST:$REMOTE_DIR/"

echo "Deploy complete!"
