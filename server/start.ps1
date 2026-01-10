# 서비스 시작 스크립트
# 사용법: .\start.ps1

Write-Host "서비스 시작 중..." -ForegroundColor Yellow

# 환경 변수 파일 확인
if (-not (Test-Path ".env.production")) {
    Write-Host "오류: .env.production 파일이 없습니다." -ForegroundColor Red
    exit 1
}

# 컨테이너 시작 (환경 변수 파일 지정)
docker compose --env-file .env.production up -d

# 컨테이너 상태 확인
Write-Host "`n컨테이너 상태:" -ForegroundColor Cyan
docker compose ps

Write-Host "`n서비스가 시작되었습니다." -ForegroundColor Green
Write-Host "로그 확인: .\logs.ps1" -ForegroundColor Cyan
