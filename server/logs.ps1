# 로그 확인 스크립트
# 사용법: .\logs.ps1 [서비스명]
# 예: .\logs.ps1 backend
# 예: .\logs.ps1 (모든 서비스 로그)

param(
    [string]$Service = ""
)

if ($Service -eq "") {
    Write-Host "모든 서비스 로그 표시 중..." -ForegroundColor Yellow
    Write-Host "종료하려면 Ctrl+C를 누르세요.`n" -ForegroundColor Gray
    docker compose --env-file .env.production logs -f
} else {
    Write-Host "$Service 서비스 로그 표시 중..." -ForegroundColor Yellow
    Write-Host "종료하려면 Ctrl+C를 누르세요.`n" -ForegroundColor Gray
    docker compose --env-file .env.production logs -f $Service
}
