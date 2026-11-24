# GSoC Navigator OS - Single Command Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         GSoC NAVIGATOR OS 2027 - PLATFORM LAUNCHER       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Starting Backend Server (FastAPI + Background Worker)..." -ForegroundColor Yellow
Set-Location "C:\Users\madha\gsoc-navigator-os\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
