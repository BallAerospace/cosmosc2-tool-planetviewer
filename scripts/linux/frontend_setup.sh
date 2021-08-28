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

rsync -av --progress ../${cosmosDir}/cosmos-frontend-init tmp/cosmos-frontend-init --exclude node_modules
rsync -av --progress ../${cosmosDir}/cypress tmp/cypress --exclude node_modules
rsync -av --progress ./cosmos-frontend-init tmp/cosmos-frontend-init --exclude node_modules
rsync -av --progress ./cypress tmp/cypress --exclude node_modules
