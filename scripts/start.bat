@echo off
REM Password Manager - Start Script for Windows
REM This script starts both the backend and frontend servers

echo Starting Password Manager...

REM Start backend in a new window
start "Password Manager Backend" cmd /k "cd backend && go run cmd/server/main.go"

REM Start frontend in a new window
start "Password Manager Frontend" cmd /k "cd frontend && npm run dev"

echo Backend and frontend servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Close this window to stop both servers
pause
