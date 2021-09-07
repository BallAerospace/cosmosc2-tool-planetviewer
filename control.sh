#!/usr/bin/env sh

set -e

usage() {
  echo "Usage: $1 [setup, build]" >&2
  echo "*  setup: setup the directory to build the docker container" >&2
  echo "*  build: build the container" >&2
  exit 1
}

if [ "$#" -eq 0 ]; then
  usage $0
fi

docker --version
docker-compose --version

case $1 in
  setup)
    ./scripts/linux/frontend_setup.sh
    ;;
  build)
    docker-compose -f compose.yaml build
    ;;
  *)
    usage $0
    ;;
esac