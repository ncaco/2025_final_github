# 배포 상태 모니터링 스크립트
# 사용법: .\deploy-watch.ps1

Write-Host "👀 배포 상태 모니터링 중..." -ForegroundColor Cyan
Write-Host "Ctrl+C로 중단할 수 있습니다.`n" -ForegroundColor Yellow

try {
    while ($true) {
        Clear-Host
        Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') 상태" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan

        # 컨테이너 상태
        Write-Host "`n🐳 컨테이너 상태:" -ForegroundColor Yellow
        docker compose --env-file .env.production ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        # 컨테이너 로그 (최근 5줄씩)
        Write-Host "`n📝 최근 로그 (백엔드):" -ForegroundColor Yellow
        docker compose --env-file .env.production logs --tail=3 backend 2>$null

        Write-Host "`n📝 최근 로그 (프론트엔드):" -ForegroundColor Yellow
        docker compose --env-file .env.production logs --tail=3 frontend 2>$null

        # 리소스 사용량
        Write-Host "`n💻 리소스 사용량:" -ForegroundColor Yellow
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

        Start-Sleep -Seconds 5
    }
} catch {
    Write-Host "`n👋 모니터링을 중단합니다." -ForegroundColor Green
}