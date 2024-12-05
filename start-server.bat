@echo off
cd /d D:\learnSaaSjQuery\expenses-note-jquery\backend
start cmd /k "node server.js"
timeout /t 5 >nul
start http://localhost:3000
