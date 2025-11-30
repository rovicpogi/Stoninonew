@echo off
cd /d "%~dp0"
git add app/admin/live-attendance/page.tsx
git commit -m "Update live attendance to flash student info for 2 seconds on new RFID scan"
git push origin main
pause






