# 서비스 중지 스크립트
# 사용법: .\stop.ps1

Write-Host "서비스 중지 중..." -ForegroundColor Yellow

# 컨테이너 중지 (환경 변수 파일 지정)
docker compose --env-file .env.production down

Write-Host "서비스가 중지되었습니다." -ForegroundColor Green
