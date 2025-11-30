@echo off
cd /d "%~dp0"
git add app/admin/page.tsx
git commit -m "Move live attendance monitoring to separate tab instead of dialog"
git push origin main
pause






