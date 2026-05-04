@echo off
echo =========================================
echo   Iniciando el Frontend de la Wiki...
echo =========================================
echo.

:: 1. Abre tu navegador predeterminado en la URL correcta
start http://localhost:8000/home.html

:: 2. Arranca el servidor de Python en esta misma ventana
python -m http.server 8000