@echo off
setlocal ENABLEDELAYEDEXPANSION

docker --version
docker-compose --version

if "%1" == "" (
  GOTO usage
)
if "%1" == "build" (
  GOTO build
)

GOTO usage

:build
  docker-compose -f compose.yaml build
  @echo off
GOTO :EOF

:usage
  @echo Usage: %0 [build] 1>&2
  @echo *  build: build the container 1>&2

@echo on