@echo off
cd /d "%~dp0"
git add app/admin/live-attendance/page.tsx app/api/admin/attendance-live/route.ts
git commit -m "Add split-screen layout to live attendance page (1:3 ratio) with student details panel"
git push origin main
pause






