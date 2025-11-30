@echo off
cd /d "%~dp0"
git add app/admin/page.tsx app/admin/live-attendance/page.tsx
git commit -m "Move live attendance monitoring to separate page that opens in new tab"
git push origin main
pause






