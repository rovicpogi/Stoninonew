@echo off
cd /d "%~dp0"
git add app/admin/page.tsx app/api/admin/attendance-live/route.ts
git commit -m "Add live attendance monitoring feature with real-time RFID scan updates"
git push origin main
pause






