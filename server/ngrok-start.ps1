# ngrok 터널 시작 스크립트
# 서버 환경에서 ngrok을 사용하여 로컬 서버를 외부에 노출합니다

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ngrok 터널 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ngrok 설치 확인
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "ngrok이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "설치 방법:" -ForegroundColor Yellow
    Write-Host "1. Chocolatey: choco install ngrok" -ForegroundColor White
    Write-Host "2. 직접 다운로드: https://ngrok.com/download" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Docker 컨테이너 상태 확인
Write-Host "Docker 컨테이너 상태 확인 중..." -ForegroundColor Cyan
$containers = docker compose --env-file .env.production ps --format json 2>$null | ConvertFrom-Json
$nginxRunning = $containers | Where-Object { $_.Service -eq "nginx" -and $_.State -eq "running" }

if (-not $nginxRunning) {
    Write-Host "nginx 컨테이너가 실행 중이지 않습니다." -ForegroundColor Yellow
    Write-Host "서버를 시작하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "서버 시작 중..." -ForegroundColor Cyan
        .\start.ps1
        Start-Sleep -Seconds 5
    } else {
        Write-Host "서버를 먼저 시작하세요: .\start.ps1" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "nginx 컨테이너가 실행 중입니다." -ForegroundColor Green
Write-Host ""

# ngrok 설정 확인
Write-Host "ngrok 설정 확인 중..." -ForegroundColor Cyan
$ngrokConfig = ngrok config check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ngrok 설정이 올바르지 않습니다." -ForegroundColor Red
    Write-Host "ngrok config add-authtoken YOUR_TOKEN 을 실행하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "ngrok 설정이 올바릅니다." -ForegroundColor Green
Write-Host ""

# ngrok 터널 시작
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ngrok 터널 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "로컬 포트 80을 외부에 노출합니다." -ForegroundColor White
Write-Host ""
Write-Host "터널이 시작되면 다음과 같은 URL이 표시됩니다:" -ForegroundColor Yellow
Write-Host "  Forwarding: https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:80" -ForegroundColor White
Write-Host ""
Write-Host "이 URL을 사용하여 외부에서 접속할 수 있습니다." -ForegroundColor Green
Write-Host ""
Write-Host "터널을 중지하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
Write-Host ""
Write-Host "웹 인터페이스: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""

# ngrok 실행
ngrok http 80
