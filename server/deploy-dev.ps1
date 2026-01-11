# 개발 서버 환경 배포 스크립트
# 사용법: .\deploy-dev.ps1 [-Rebuild] [-Fast]

param(
    [switch]$Rebuild = $false,
    [switch]$Fast = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "개발 서버 환경 배포" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 환경 변수 파일 확인
if (-not (Test-Path ".env.dev")) {
    Write-Host "오류: .env.dev 파일이 없습니다." -ForegroundColor Red
    Write-Host "env.dev.example 파일을 복사하여 .env.dev 파일을 생성하세요." -ForegroundColor Yellow
    exit 1
}

# Docker Compose 실행
if ($Rebuild) {
    Write-Host "`n컨테이너 재빌드 중..." -ForegroundColor Yellow
    docker compose --env-file .env.dev up -d --build
} elseif ($Fast) {
    Write-Host "`n빠른 재시작 중..." -ForegroundColor Yellow
    docker compose --env-file .env.dev restart
} else {
    Write-Host "`n컨테이너 시작 중..." -ForegroundColor Yellow
    docker compose --env-file .env.dev up -d
}

Write-Host "`n개발 서버 환경 배포 완료!" -ForegroundColor Green
Write-Host "환경 변수 파일: .env.dev" -ForegroundColor Cyan
