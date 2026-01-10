# ngrok 도메인 설정 스크립트
# DuckDNS 도메인을 ngrok에 직접 연결합니다 (Pro 플랜 필요)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ngrok 도메인 설정" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ngrok Pro 플랜 확인
Write-Host "⚠️  이 기능은 ngrok Pro 플랜($8/월)이 필요합니다." -ForegroundColor Yellow
Write-Host ""
Write-Host "ngrok Pro 플랜 구독:" -ForegroundColor Cyan
Write-Host "  https://dashboard.ngrok.com/billing/plans" -ForegroundColor White
Write-Host ""

# 사용자 확인
$confirm = Read-Host "ngrok Pro 플랜을 구독하셨나요? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "ngrok Pro 플랜을 구독한 후 다시 실행하세요." -ForegroundColor Yellow
    exit 1
}

# DuckDNS 도메인 입력
Write-Host ""
Write-Host "DuckDNS 도메인을 입력하세요:" -ForegroundColor Cyan
Write-Host "  예: ncaco.duckdns.org" -ForegroundColor White
$domain = Read-Host "도메인"

if ([string]::IsNullOrWhiteSpace($domain)) {
    Write-Host "도메인이 입력되지 않았습니다." -ForegroundColor Red
    exit 1
}

# ngrok 설치 확인
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokInstalled) {
    Write-Host "ngrok이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "설치 방법: choco install ngrok" -ForegroundColor Yellow
    exit 1
}

# Docker 컨테이너 상태 확인
Write-Host ""
Write-Host "Docker 컨테이너 상태 확인 중..." -ForegroundColor Cyan
$containers = docker compose --env-file .env.production ps --format json 2>$null | ConvertFrom-Json
$nginxRunning = $containers | Where-Object { $_.Service -eq "nginx" -and $_.State -eq "running" }

if (-not $nginxRunning) {
    Write-Host "nginx 컨테이너가 실행 중이지 않습니다." -ForegroundColor Yellow
    Write-Host "서버를 시작하시겠습니까? (Y/N)" -ForegroundColor Yellow
    $startServer = Read-Host
    
    if ($startServer -eq "Y" -or $startServer -eq "y") {
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

# ngrok 도메인으로 터널 시작
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ngrok 도메인 터널 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "도메인: $domain" -ForegroundColor White
Write-Host "로컬 포트: 80" -ForegroundColor White
Write-Host ""
Write-Host "터널이 시작되면:" -ForegroundColor Yellow
Write-Host "  - https://$domain 으로 직접 접속 가능합니다" -ForegroundColor Green
Write-Host "  - DuckDNS에서 도메인 IP를 ngrok이 제공하는 IP로 업데이트해야 합니다" -ForegroundColor Yellow
Write-Host ""
Write-Host "터널을 중지하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
Write-Host ""
Write-Host "웹 인터페이스: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""

# ngrok 실행
ngrok http 80 --domain=$domain
