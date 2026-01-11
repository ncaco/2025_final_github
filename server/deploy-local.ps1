# 로컬 개발 환경 배포 스크립트
# 사용법: .\deploy-local.ps1

param(
    [switch]$Rebuild = $false,
    [switch]$Fast = $false
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "로컬 개발 환경 배포" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 환경 변수 파일 확인
if (-not (Test-Path ".env.local")) {
    Write-Host "오류: .env.local 파일이 없습니다." -ForegroundColor Red
    Write-Host "env.local.example 파일을 복사하여 .env.local 파일을 생성하세요." -ForegroundColor Yellow
    exit 1
}

# Docker Compose 실행
if ($Rebuild) {
    Write-Host "`n컨테이너 재빌드 중..." -ForegroundColor Yellow
    docker compose --env-file .env.local up -d --build
} elseif ($Fast) {
    Write-Host "`n빠른 재시작 중..." -ForegroundColor Yellow
    docker compose --env-file .env.local restart
} else {
    Write-Host "`n컨테이너 시작 중..." -ForegroundColor Yellow
    docker compose --env-file .env.local up -d
}

Write-Host "`n로컬 개발 환경 배포 완료!" -ForegroundColor Green
Write-Host "프론트엔드: http://localhost:3000" -ForegroundColor Cyan
Write-Host "백엔드 API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API 문서: http://localhost:8000/docs" -ForegroundColor Cyan
