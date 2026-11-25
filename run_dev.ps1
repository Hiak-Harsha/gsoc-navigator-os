# GSoC Navigator OS - Single Command Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   GSoC NAVIGATOR OS 2027 - LOCAL + OLLAMA LAUNCHER       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Allow local browser -> Ollama calls if serving locally
$env:OLLAMA_ORIGINS = "*"

Write-Host "[1/2] Checking local Ollama (llama3.2:latest)..." -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2
    Write-Host "      Ollama active at http://127.0.0.1:11434" -ForegroundColor Green
} catch {
    Write-Host "      Ollama not detected on 11434; hybrid heuristic fallback enabled." -ForegroundColor DarkYellow
}

Write-Host "[2/2] Starting Backend Server (FastAPI + Live PR Sentinel + Ollama)..." -ForegroundColor Yellow
Set-Location "C:\Users\madha\gsoc-navigator-os\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
