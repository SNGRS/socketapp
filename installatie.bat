@echo off
setlocal enabledelayedexpansion

rem Het pad van de map waarin het batch-bestand zich bevindt
set "scriptDir=%~dp0"

rem Het pad naar de 'transacties'-map
set "rootDir=%scriptDir%transacties"

if not exist "%rootDir%" (
    mkdir "%rootDir%"
    echo De map 'transacties' is aangemaakt.
)

cd "%rootDir%"

for %%d in (html pakbonnen kassabonnen) do (
    if not exist "%%d" (
        mkdir "%%d"
        echo De map '%%d' is aangemaakt.
    )
)

echo Controle en aanmaak voltooid.
pause


rem Controleer of Node.js is geïnstalleerd
where node >nul 2>nul
if %errorlevel% neq 0 (
    rem Node.js is niet geïnstalleerd

    rem Controleer Windows-versie
    ver | find "XP" >nul && set WIN_VERSION=XP
    ver | find "6.1." >nul && set WIN_VERSION=7
    ver | find "10.0." >nul && set WIN_VERSION=10

    if "%WIN_VERSION%"=="XP" (
        echo Fout: Node.js is vereist maar wordt niet ondersteund op Windows XP.
        exit /b 1
    ) else if "%WIN_VERSION%"=="7" (
        rem Download Node.js voor Windows 7
        set NODE_URL=https://nodejs.org/download/release/v13.6.0/node-v13.6.0-x86.msi
    ) else if "%WIN_VERSION%"=="10" (
        rem Controleer processorarchitectuur
        if "%PROCESSOR_ARCHITECTURE%"=="x86" (
            set NODE_URL=https://nodejs.org/dist/v20.10.0/node-v20.10.0-x86.msi
        ) else if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
            set NODE_URL=https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
        ) else (
            echo Fout: Onbekende processorarchitectuur.
            exit /b 1
        )
    ) else (
        echo Fout: Onbekende Windows-versie.
        exit /b 1
    )

    rem Download Node.js
    echo Downloaden van Node.js van %NODE_URL%...
    bitsadmin /transfer "NodeJSInstaller" %NODE_URL% node-installer.msi

    rem Wacht tot het downloaden is voltooid
    :WAIT_FOR_DOWNLOAD
    timeout /nobreak /t 5 >nul
    bitsadmin /query /verbose /name "NodeJSInstaller" | find "TRANSFERRED" >nul
    if errorlevel 1 goto WAIT_FOR_DOWNLOAD

    rem Installeer Node.js
    echo Installeren van Node.js...
    start /wait msiexec /i node-installer.msi /qn

    rem Wacht tot de installatie is voltooid
    :WAIT_FOR_INSTALL
    timeout /nobreak /t 5 >nul
    tasklist | find "msiexec.exe" >nul
    if not errorlevel 1 goto WAIT_FOR_INSTALL
)

rem Voer het "npm install" commando uit
start cmd /k "npm install"

echo Script voltooid.
pause
exit /b 0