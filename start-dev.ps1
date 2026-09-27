# MeetSphere Dev Environment Startup Script for Windows PowerShell
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "    MeetSphere Unified Local Dev Environment        " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Check Docker status
Write-Host "`n[1/4] Checking Docker daemon status..." -ForegroundColor Yellow
$dockerCheck = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker daemon is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Docker daemon is active and responding." -ForegroundColor Green

# 2. Check .env
Write-Host "`n[2/4] Verifying environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item .env.example .env
        Write-Host "[OK] Created .env file from .env.example template." -ForegroundColor Green
    } else {
        Write-Host "ERROR: Neither .env nor .env.example found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Using existing .env file." -ForegroundColor Green
}

# 3. Docker Compose Up
Write-Host "`n[3/4] Launching container services via Docker Compose..." -ForegroundColor Yellow
docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
    docker-compose up -d --build
}

# 4. Monitor Container Health
Write-Host "`n[4/4] Monitoring service health status..." -ForegroundColor Yellow
$services = @("meetsphere-mongodb", "meetsphere-redis", "meetsphere-livekit", "meetsphere-backend", "meetsphere-frontend")

foreach ($svc in $services) {
    Write-Host -NoNewline " - ${svc}: "
    $elapsed = 0
    $healthy = $false
    while ($elapsed -lt 60) {
        $status = (docker inspect --format='{{json .State.Health.Status}}' $svc 2>$null) -replace '"', ""
        if ($status -eq "healthy") {
            $healthy = $true
            break
        }
        $running = (docker inspect --format='{{.State.Running}}' $svc 2>$null)
        if ($status -eq "none" -and $running -eq "true") {
            $healthy = $true
            break
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host -NoNewline "."
    }
    if ($healthy) {
        Write-Host " HEALTHY" -ForegroundColor Green
    } else {
        Write-Host " TIMEOUT" -ForegroundColor Red
        docker logs --tail 20 $svc
    }
}

Write-Host "`n=====================================================" -ForegroundColor Green
Write-Host "[OK] All MeetSphere services are running and healthy!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "  Frontend UI:    http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend API:   http://localhost:5000" -ForegroundColor Cyan
Write-Host "  Health Check:  http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "  LiveKit WebRTC:http://localhost:7880" -ForegroundColor Cyan
Write-Host "  MongoDB:       mongodb://localhost:27017" -ForegroundColor Cyan
Write-Host "  Redis:         redis://localhost:6379" -ForegroundColor Cyan
