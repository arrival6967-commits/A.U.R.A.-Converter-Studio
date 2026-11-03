@echo off
chcp 65001 >nul
title Установка A.U.R.A. Converter Studio v1.1 - The Godot Entertaiment Inc.
color 0F

echo ===================================================================
echo   A.U.R.A. Converter Studio v1.1
echo   Разработчик: The Godot Entertaiment Inc.
echo   Мастер развертывания приложения для Windows 10/11
echo ===================================================================
echo.

set "APP_DIR=%LOCALAPPDATA%\Programs\AURA_Converter_Studio"
set "APP_URL=https://ais-pre-6fan2e54gdsoqajpyppwdg-702394825518.europe-west2.run.app"

echo [1/4] Определение путей Рабочего стола Windows...
set "FOUND_DESKTOP="

:: Попытка определить путь Рабочего стола через реестр (включая OneDrive и русский язык)
for /f "tokens=2*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop 2^>nul') do (
    set "REG_DESKTOP=%%b"
)
call set "REG_DESKTOP=%REG_DESKTOP%"

if exist "%REG_DESKTOP%" (
    set "FOUND_DESKTOP=%REG_DESKTOP%"
) else if exist "%USERPROFILE%\OneDrive\Рабочий стол" (
    set "FOUND_DESKTOP=%USERPROFILE%\OneDrive\Рабочий стол"
) else if exist "%USERPROFILE%\Рабочий стол" (
    set "FOUND_DESKTOP=%USERPROFILE%\Рабочий стол"
) else if exist "%USERPROFILE%\OneDrive\Desktop" (
    set "FOUND_DESKTOP=%USERPROFILE%\OneDrive\Desktop"
) else (
    set "FOUND_DESKTOP=%USERPROFILE%\Desktop"
)

echo   -> Рабочий стол обнаружен: "%FOUND_DESKTOP%"
echo.

echo [2/4] Создание рабочей папки приложения...
echo   -> Папка: "%APP_DIR%"
if not exist "%APP_DIR%" mkdir "%APP_DIR%"

:: Создаем файлы внутри папки приложения
(
  echo [A.U.R.A. Converter Studio v1.1]
  echo Developer: The Godot Entertaiment Inc.
  echo Version: 1.1
  echo Installed: %DATE% %TIME%
  echo Status: Ready
) > "%APP_DIR%\version.txt"

(
  echo @echo off
  echo start "" "%APP_URL%"
  echo exit
) > "%APP_DIR%\AURA_Launcher.bat"

(
  echo [InternetShortcut]
  echo URL=%APP_URL%
  echo IconIndex=0
  echo IconFile=shell32.dll,138
) > "%APP_DIR%\A.U.R.A. Converter Studio.url"

(
  echo @echo off
  echo chcp 65001 ^>nul
  echo echo Удаление A.U.R.A. Converter Studio...
  echo del /q "%FOUND_DESKTOP%\A.U.R.A. Converter Studio.lnk" 2^>nul
  echo del /q "%FOUND_DESKTOP%\A.U.R.A. Converter Studio.url" 2^>nul
  echo rmdir /s /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\A.U.R.A. Converter Studio" 2^>nul
  echo echo Приложение удалено.
  echo timeout /t 2 ^>nul
  echo exit
) > "%APP_DIR%\uninstall.bat"

echo.
echo [3/4] Создание ярлыков на Рабочем столе и в меню «Пуск»...

:: Создаем VBS скрипт для генерации настоящего бинарного ярлыка .LNK через WScript.Shell
set "VBS_SCRIPT=%TEMP%\create_aura_shortcut.vbs"
(
  echo Set oWS = WScript.CreateObject("WScript.Shell"^)
  echo sLink = "%FOUND_DESKTOP%\A.U.R.A. Converter Studio.lnk"
  echo Set oLink = oWS.CreateShortcut(sLink^)
  echo oLink.TargetPath = "%APP_DIR%\AURA_Launcher.bat"
  echo oLink.WorkingDirectory = "%APP_DIR%"
  echo oLink.Description = "A.U.R.A. Converter Studio v1.1 - The Godot Entertaiment Inc."
  echo oLink.IconLocation = "shell32.dll,138"
  echo oLink.Save
) > "%VBS_SCRIPT%"
cscript //nologo "%VBS_SCRIPT%" >nul 2>&1
del /q "%VBS_SCRIPT%" 2^>nul

:: Дублируем Интернет-ярлык .URL на случай политик ярлыков
(
  echo [InternetShortcut]
  echo URL=%APP_URL%
  echo IconIndex=0
  echo IconFile=shell32.dll,138
) > "%FOUND_DESKTOP%\A.U.R.A. Converter Studio.url"

:: Если есть стандартный Desktop, дублируем и туда
if exist "%USERPROFILE%\Desktop" (
  copy /y "%FOUND_DESKTOP%\A.U.R.A. Converter Studio.url" "%USERPROFILE%\Desktop\A.U.R.A. Converter Studio.url" >nul 2>&1
)

:: Меню Пуск
set "START_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\A.U.R.A. Converter Studio"
if not exist "%START_DIR%" mkdir "%START_DIR%"
copy /y "%FOUND_DESKTOP%\A.U.R.A. Converter Studio.url" "%START_DIR%\A.U.R.A. Converter Studio.url" >nul 2>&1

echo.
echo [4/4] Завершение установки...
echo ===================================================================
echo   УСТАНОВКА УСПЕШНО ЗАВЕРШЕНА!
echo.
echo   1. Приложение установлено в:
echo      "%APP_DIR%"
echo.
echo   2. Ярлык добавлен на Рабочий стол:
echo      "%FOUND_DESKTOP%\A.U.R.A. Converter Studio"
echo ===================================================================
echo.

:: Открываем папку программы в проводнике, чтобы пользователь сразу ее увидел
explorer "%APP_DIR%"

:: Запускаем саму студию
start "" "%APP_URL%"

echo Нажмите любую клавишу для выхода из установщика...
timeout /t 5 >nul
exit
