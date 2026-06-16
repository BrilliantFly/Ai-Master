@echo off
cd /d E:\Ai-Master\know-boot\know-boot-system
start "know-boot-system" cmd /k "mvn spring-boot:run"
timeout /nobreak /t 25
cd /d E:\Ai-Master\know-boot\know-boot-camera
start "know-boot-camera" cmd /k "mvn spring-boot:run"
timeout /nobreak /t 25
cd /d E:\Ai-Master\know-uniapp
start "know-uniapp" cmd /k "npm run dev:h5"
pause