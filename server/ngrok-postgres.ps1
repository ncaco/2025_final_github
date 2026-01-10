# PostgreSQL용 ngrok TCP 터널 스크립트
# 사용법: .\ngrok-postgres.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL ngrok TCP 터널 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ngrok 설치 확인
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokPath) {
    Write-Host "오류: ngrok이 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "다운로드: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

# ngrok 인증 확인
Write-Host "`nngrok 인증 확인 중..." -ForegroundColor Yellow
$authCheck = ngrok config check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ngrok 인증이 필요합니다." -ForegroundColor Yellow
    Write-Host "다음 명령으로 인증하세요: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ ngrok 인증 완료" -ForegroundColor Green

# PostgreSQL 포트 확인
Write-Host "`nPostgreSQL 컨테이너 상태 확인 중..." -ForegroundColor Yellow
$postgresStatus = docker compose --env-file .env.production ps postgres --format "{{.Status}}"
if ($postgresStatus -notmatch "Up") {
    Write-Host "PostgreSQL 컨테이너가 실행 중이 아닙니다." -ForegroundColor Red
    Write-Host "다음 명령으로 시작하세요: docker compose --env-file .env.production up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ PostgreSQL 실행 중" -ForegroundColor Green

# ngrok TCP 터널 시작
Write-Host "`nngrok TCP 터널 시작 중..." -ForegroundColor Yellow
Write-Host "로컬 포트: 5432" -ForegroundColor Cyan
Write-Host "터널이 생성되면 외부 URL이 표시됩니다." -ForegroundColor Cyan
Write-Host "`n중지하려면 Ctrl+C를 누르세요.`n" -ForegroundColor Yellow

# ngrok TCP 터널 시작
ngrok tcp 5432