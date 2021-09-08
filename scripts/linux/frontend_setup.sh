#!/usr/bin/env sh
set -e

if [ "$#" -eq 1 ]; then
  cosmosDir="$1"
else
  cosmosDir="cosmos"
fi

# ***************************************************************************
# Setup cosmos-frontend build
# ***************************************************************************

mkdir -p tmp/cosmos-frontend-init tmp/cypress

rsync -av --quiet ../${cosmosDir}/cosmos-frontend-init tmp/ --exclude node_modules
rsync -av --quiet ../${cosmosDir}/cypress tmp/ --exclude node_modules
rsync -av --quiet ./cosmos-frontend-init tmp/ --exclude node_modules
rsync -av --quiet ./cypress tmp/ --exclude node_modules
