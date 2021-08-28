@echo off
setlocal enableextensions disabledelayedexpansion

if ("%1"=="") (
  set cosmosDir="%1"
) else (
  set cosmosDir=cosmos
)

REM ***************************************************************************
REM Setup cosmos-frontend build
REM ***************************************************************************

mkdir "tmp" 2>nul
xcopy /E /I /Y /Q /D /exclude:scripts\windows\exclude.txt ..\%cosmosDir%\cosmos-frontend-init tmp\cosmos-frontend-init || EXIT /b 1
xcopy /E /I /Y /Q /D /exclude:scripts\windows\exclude.txt ..\%cosmosDir%\cypress tmp\cypress || EXIT /b 1
xcopy /E /I /Y /Q /D /exclude:scripts\windows\exclude.txt .\cosmos-frontend-init tmp\cosmos-frontend-init || EXIT /b 1
xcopy /E /I /Y /Q /D /exclude:scripts\windows\exclude.txt .\cypress tmp\cypress || EXIT /b 1

REM Setup Complete!