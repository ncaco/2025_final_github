# ngrok 설정 스크립트
# ngrok을 사용하여 로컬 서버를 외부에 노출합니다

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ngrok 터널링 설정" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ngrok 설치 확인
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "ngrok이 설치되어 있지 않습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "설치 방법:" -ForegroundColor Cyan
    Write-Host "1. https://ngrok.com/download 에서 Windows용 다운로드" -ForegroundColor White
    Write-Host "2. 또는 Chocolatey 사용: choco install ngrok" -ForegroundColor White
    Write-Host "3. 또는 Scoop 사용: scoop install ngrok" -ForegroundColor White
    Write-Host ""
    Write-Host "ngrok 계정 생성 및 인증:" -ForegroundColor Cyan
    Write-Host "1. https://ngrok.com 에서 무료 계정 생성" -ForegroundColor White
    Write-Host "2. 다운로드한 authtoken을 사용하여 인증:" -ForegroundColor White
    Write-Host "   ngrok config add-authtoken YOUR_AUTH_TOKEN" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "ngrok이 설치되어 있습니다." -ForegroundColor Green
Write-Host ""

# Docker 컨테이너 상태 확인
Write-Host "Docker 컨테이너 상태 확인 중..." -ForegroundColor Cyan
$containers = docker compose --env-file .env.production ps --format json | ConvertFrom-Json
$nginxRunning = $containers | Where-Object { $_.Service -eq "nginx" -and $_.State -eq "running" }

if (-not $nginxRunning) {
    Write-Host "nginx 컨테이너가 실행 중이지 않습니다." -ForegroundColor Red
    Write-Host "먼저 서버를 시작하세요: .\start.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "nginx 컨테이너가 실행 중입니다." -ForegroundColor Green
Write-Host ""

# ngrok 터널 시작
Write-Host "ngrok 터널 시작 중..." -ForegroundColor Cyan
Write-Host "로컬 포트 80을 외부에 노출합니다." -ForegroundColor White
Write-Host ""
Write-Host "터널이 시작되면 다음과 같은 URL이 표시됩니다:" -ForegroundColor Yellow
Write-Host "  Forwarding: https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:80" -ForegroundColor White
Write-Host ""
Write-Host "이 URL을 사용하여 외부에서 접속할 수 있습니다." -ForegroundColor Green
Write-Host ""
Write-Host "터널을 중지하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
Write-Host ""

# ngrok 실행
ngrok http 80
