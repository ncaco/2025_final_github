# 개발용 빠른 배포 스크립트
# 사용법: .\deploy-dev.ps1

Write-Host "========================================" -ForegroundColor Green
Write-Host "🚀 개발용 빠른 배포 시작" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# 기존 컨테이너 상태 확인
Write-Host "`n컨테이너 상태 확인 중..." -ForegroundColor Yellow
$containers = docker compose --env-file .env.production ps --format "table {{.Names}}\t{{.Status}}"
Write-Host $containers

# 백엔드만 재빌드 (프론트엔드 변경이 없는 경우)
$rebuildBackend = Read-Host "`n백엔드만 재빌드하시겠습니까? (y/N)"
if ($rebuildBackend -eq 'y' -or $rebuildBackend -eq 'Y') {
    Write-Host "`n백엔드만 재빌드 중..." -ForegroundColor Yellow
    docker compose --env-file .env.production build backend
    docker compose --env-file .env.production up -d backend
} else {
    # 전체 컨테이너 재시작
    Write-Host "`n전체 컨테이너 재시작 중..." -ForegroundColor Yellow
    docker compose --env-file .env.production restart
}

# 상태 확인
Write-Host "`n배포 상태 확인 중..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
docker compose --env-file .env.production ps

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "🚀 개발용 배포 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green