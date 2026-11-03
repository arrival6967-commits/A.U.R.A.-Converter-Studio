@echo off
chcp 65001 >nul
title Установка A.U.R.A. Converter Studio v1.1
color 0F

echo ===================================================================
echo   A.U.R.A. Converter Studio v1.1 - The Godot Entertaiment Inc.
echo   Мастер быстрой установки приложения для Windows
echo ===================================================================
echo.

set "APP_DIR=%LOCALAPPDATA%\AURA_Converter_Studio"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "STARTMENU_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\A.U.R.A. Converter Studio"
set "APP_URL=https://ais-pre-6fan2e54gdsoqajpyppwdg-702394825518.europe-west2.run.app"

echo [1/3] Создание локальной рабочей папки приложения...
if not exist "%APP_DIR%" mkdir "%APP_DIR%"

echo [2/3] Создание ярлыков на Рабочем столе и в меню «Пуск»...
(
  echo [InternetShortcut]
  echo URL=%APP_URL%
  echo IconIndex=0
  echo IconFile=shell32.dll,138
) > "%DESKTOP_DIR%\A.U.R.A. Converter Studio.url"

if not exist "%STARTMENU_DIR%" mkdir "%STARTMENU_DIR%"
(
  echo [InternetShortcut]
  echo URL=%APP_URL%
  echo IconIndex=0
  echo IconFile=shell32.dll,138
) > "%STARTMENU_DIR%\A.U.R.A. Converter Studio.url"

echo [3/3] Регистрация A.U.R.A. Converter Studio в системе...
echo.
echo ===================================================================
echo   Установка успешно завершена!
echo   Разработчик: The Godot Entertaiment Inc.
echo   Ярлык «A.U.R.A. Converter Studio» добавлен на ваш Рабочий стол.
echo ===================================================================
echo.
echo Запуск A.U.R.A. Converter Studio...
start "" "%APP_URL%"
timeout /t 3 >nul
exit
