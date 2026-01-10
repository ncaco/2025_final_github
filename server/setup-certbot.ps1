# Let's Encrypt 인증서 초기 설정 스크립트
# 사용법: .\setup-certbot.ps1

param(
    [string]$FrontendDomain = "ncaco.duckdns.net",
    [string]$BackendDomain = "ncaco-api.duckdns.net",
    [string]$Email = "ncaco97@gmail.com"
)

# 환경 변수 파일에서 값 읽기
if (Test-Path ".env.production") {
    $envContent = Get-Content ".env.production" -Raw
    if ($envContent -match "FRONTEND_DOMAIN=([^\r\n]+)") {
        $FrontendDomain = $matches[1].Trim()
    }
    if ($envContent -match "BACKEND_DOMAIN=([^\r\n]+)") {
        $BackendDomain = $matches[1].Trim()
    }
    if ($envContent -match "CERTBOT_EMAIL=([^\r\n]+)") {
        $Email = $matches[1].Trim()
    }
}

if ([string]::IsNullOrEmpty($FrontendDomain) -or [string]::IsNullOrEmpty($BackendDomain) -or [string]::IsNullOrEmpty($Email)) {
    Write-Host "오류: 도메인 및 이메일 정보가 필요합니다." -ForegroundColor Red
    Write-Host "사용법: .\setup-certbot.ps1 -FrontendDomain 'yourdomain.ddns.net' -BackendDomain 'api.yourdomain.ddns.net' -Email 'your-email@example.com'" -ForegroundColor Yellow
    Write-Host "또는 .env.production 파일에 FRONTEND_DOMAIN, BACKEND_DOMAIN, CERTBOT_EMAIL을 설정하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host "Let's Encrypt 인증서 발급 시작..." -ForegroundColor Cyan
Write-Host "프론트엔드 도메인: $FrontendDomain" -ForegroundColor Yellow
Write-Host "백엔드 도메인: $BackendDomain" -ForegroundColor Yellow
Write-Host "이메일: $Email" -ForegroundColor Yellow
Write-Host ""

# Docker 컨테이너 실행 확인
Write-Host "Docker 컨테이너 상태 확인 중..." -ForegroundColor Yellow
$containers = docker compose --env-file .env.production ps -q
if (-not $containers) {
    Write-Host "오류: Docker 컨테이너가 실행되지 않았습니다." -ForegroundColor Red
    Write-Host "먼저 .\deploy.ps1 또는 .\start.ps1을 실행하여 컨테이너를 시작하세요." -ForegroundColor Yellow
    exit 1
}

# 인증서 발급
docker compose --env-file .env.production exec certbot certbot certonly `
    --webroot `
    -w /var/www/certbot `
    -d $FrontendDomain `
    -d $BackendDomain `
    --email $Email `
    --agree-tos `
    --no-eff-email

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n인증서 발급 완료!" -ForegroundColor Green
    Write-Host "nginx 컨테이너를 재시작합니다..." -ForegroundColor Yellow
    docker compose --env-file .env.production restart nginx
    Write-Host "완료!" -ForegroundColor Green
} else {
    Write-Host "`n인증서 발급 실패. 로그를 확인하세요." -ForegroundColor Red
    Write-Host "로그 확인: docker compose logs certbot" -ForegroundColor Yellow
}
