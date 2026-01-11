# 프로덕션 서버 배포 스크립트
# 사용법:
#   .\deploy.ps1              # 전체 재빌드 (기본값)
#   .\deploy.ps1 -Fast        # 빠른 재시작 (코드 변경만 있는 경우)
#   .\deploy.ps1 -Rebuild     # 증분 재빌드 (의존성 변경 있는 경우)

param(
    [switch]$Fast,
    [switch]$Rebuild
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "프로덕션 서버 배포 시작" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 환경 변수 파일 확인
if (-not (Test-Path ".env.production")) {
    Write-Host "오류: .env.production 파일이 없습니다." -ForegroundColor Red
    Write-Host ".env.production.example 파일을 복사하여 .env.production 파일을 생성하세요." -ForegroundColor Yellow
    exit 1
}

# Docker 및 Docker Compose 설치 확인
Write-Host "`nDocker 설치 확인 중..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker 설치됨: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "Docker Desktop을 설치하세요: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

try {
    $composeVersion = docker compose version
    Write-Host "✓ Docker Compose 설치됨: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose가 설치되지 않았습니다." -ForegroundColor Red
    exit 1
}

# 배포 모드에 따른 처리
if ($Fast) {
    Write-Host "`n🚀 빠른 배포 모드: 컨테이너만 재시작합니다..." -ForegroundColor Yellow
    Write-Host "💡 변경사항이 백엔드/프론트엔드 코드에만 있는 경우 사용하세요." -ForegroundColor Cyan
    docker compose --env-file .env.production restart
} elseif ($Rebuild) {
    Write-Host "`n🔄 증분 재빌드 모드: 캐시를 활용하여 빌드합니다..." -ForegroundColor Yellow
    Write-Host "💡 의존성 변경이 있는 경우 사용하세요." -ForegroundColor Cyan
    docker compose --env-file .env.production down
    docker compose --env-file .env.production build
} else {
    Write-Host "`n🔨 전체 재빌드 모드: 캐시를 무시하고 완전 재빌드합니다..." -ForegroundColor Yellow
    Write-Host "💡 환경 설정 변경이나 시스템 업데이트 시 사용하세요." -ForegroundColor Cyan
    Write-Host "💡 빠른 배포를 원한다면 .\deploy.ps1 -Fast를 사용하세요." -ForegroundColor Cyan
    docker compose --env-file .env.production down
    docker compose --env-file .env.production build --no-cache
}

# 컨테이너 시작 (Fast 모드가 아닌 경우에만)
if (-not $Fast) {
    Write-Host "`n컨테이너 시작 중..." -ForegroundColor Yellow
    docker compose --env-file .env.production up -d
}

# 컨테이너 상태 확인 (Fast 모드가 아닌 경우에만)
if (-not $Fast) {
    Write-Host "`n컨테이너 상태 확인 중..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    docker compose --env-file .env.production ps
}

Write-Host "`n========================================" -ForegroundColor Cyan
if ($Fast) {
    Write-Host "🚀 빠른 배포 완료!" -ForegroundColor Green
} elseif ($Rebuild) {
    Write-Host "🔄 증분 재빌드 완료!" -ForegroundColor Green
} else {
    Write-Host "🔨 전체 재빌드 완료!" -ForegroundColor Green
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. Let's Encrypt 인증서 발급을 위해 다음 명령을 실행하세요:" -ForegroundColor White
Write-Host "   docker compose exec certbot certbot certonly --webroot -w /var/www/certbot -d yourdomain.ddns.net -d api.yourdomain.ddns.net --email your-email@example.com --agree-tos --no-eff-email" -ForegroundColor Gray
Write-Host "`n2. 인증서 발급 후 nginx 설정 파일의 도메인을 실제 도메인으로 변경하세요." -ForegroundColor White
Write-Host "3. nginx 컨테이너를 재시작하세요: docker compose restart nginx" -ForegroundColor White
Write-Host "`n로그 확인: .\logs.ps1" -ForegroundColor Cyan
