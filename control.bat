@echo off
setlocal ENABLEDELAYEDEXPANSION

docker --version
docker-compose --version

if "%1" == "" (
  GOTO usage
)
if "%1" == "setup" (
  GOTO setup
)
if "%1" == "build" (
  GOTO build
)

GOTO usage

:setup
  CALL scripts/windows/frontend_setup
  @echo off
GOTO :EOF

:build
  docker-compose -f compose.yaml build
  @echo off
GOTO :EOF

:usage
  @echo Usage: %0 [setup, build] 1>&2
  @echo *  setup: setup the directory to build the docker container 1>&2
  @echo *  build: build the container 1>&2

@echo on