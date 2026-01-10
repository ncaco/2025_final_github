# PostgreSQL 접속 스크립트
# 사용법: .\connect-postgres.ps1 [SQL명령어]

param(
    [string]$Command = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PostgreSQL 접속" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# PostgreSQL 컨테이너 상태 확인
$postgresStatus = docker compose --env-file .env.production ps postgres --format "{{.Status}}"
if ($postgresStatus -notmatch "Up") {
    Write-Host "PostgreSQL 컨테이너가 실행 중이 아닙니다." -ForegroundColor Red
    Write-Host "다음 명령으로 시작하세요: docker compose --env-file .env.production up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n연결 정보:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  Database: common_db" -ForegroundColor White
Write-Host "  Username: app_user" -ForegroundColor White
Write-Host "  Password: app_password_123" -ForegroundColor White

if ($Command) {
    Write-Host "`nSQL 명령 실행 중..." -ForegroundColor Yellow
    docker compose --env-file .env.production exec -T postgres psql -U app_user -d common_db -c $Command
} else {
    Write-Host "`n대화형 모드로 접속합니다..." -ForegroundColor Yellow
    Write-Host "종료하려면 \q 또는 exit를 입력하세요.`n" -ForegroundColor Cyan
    docker compose --env-file .env.production exec -it postgres psql -U app_user -d common_db
}