# 포트 포워딩 테스트 스크립트
# 사용법: .\test-port-forwarding.ps1

param(
    [string]$Domain = "ncaco.duckdns.net"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "포트 포워딩 테스트" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 현재 공인 IP 확인
Write-Host "`n현재 공인 IP 확인 중..." -ForegroundColor Yellow
try {
    $publicIP = Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 5
    Write-Host "✓ 공인 IP: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "✗ 공인 IP 확인 실패" -ForegroundColor Red
}

# DuckDNS IP 확인
Write-Host "`nDuckDNS 도메인 IP 확인 중..." -ForegroundColor Yellow
try {
    $dnsIP = (Resolve-DnsName -Name $Domain -Type A -ErrorAction Stop).IPAddress
    Write-Host "✓ $Domain IP: $dnsIP" -ForegroundColor Green
    
    if ($publicIP -and $dnsIP -ne $publicIP) {
        Write-Host "⚠ 경고: DuckDNS IP($dnsIP)와 공인 IP($publicIP)가 다릅니다." -ForegroundColor Yellow
        Write-Host "  DuckDNS를 업데이트하세요." -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ DNS 확인 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 포트 80 테스트
Write-Host "`n포트 80 (HTTP) 테스트 중..." -ForegroundColor Yellow
try {
    $port80 = Test-NetConnection -ComputerName $Domain -Port 80 -WarningAction SilentlyContinue
    if ($port80.TcpTestSucceeded) {
        Write-Host "✓ 포트 80 접속 가능" -ForegroundColor Green
        
        # HTTP 응답 확인
        try {
            $response = Invoke-WebRequest -Uri "http://$Domain" -TimeoutSec 5 -UseBasicParsing
            Write-Host "✓ HTTP 응답: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "⚠ HTTP 요청 실패: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ 포트 80 접속 불가" -ForegroundColor Red
        Write-Host "  포트 포워딩 설정을 확인하세요." -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ 포트 80 테스트 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 포트 443 테스트
Write-Host "`n포트 443 (HTTPS) 테스트 중..." -ForegroundColor Yellow
try {
    $port443 = Test-NetConnection -ComputerName $Domain -Port 443 -WarningAction SilentlyContinue
    if ($port443.TcpTestSucceeded) {
        Write-Host "✓ 포트 443 접속 가능" -ForegroundColor Green
        
        # HTTPS 응답 확인
        try {
            $response = Invoke-WebRequest -Uri "https://$Domain" -TimeoutSec 5 -UseBasicParsing -SkipCertificateCheck
            Write-Host "✓ HTTPS 응답: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "⚠ HTTPS 요청 실패: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ 포트 443 접속 불가" -ForegroundColor Red
        Write-Host "  포트 포워딩 설정을 확인하세요." -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ 포트 443 테스트 실패: $($_.Exception.Message)" -ForegroundColor Red
}

# 로컬 서버 상태 확인
Write-Host "`n로컬 서버 상태 확인 중..." -ForegroundColor Yellow
try {
    $containers = docker compose --env-file .env.production ps --format "{{.Name}}\t{{.Status}}"
    Write-Host $containers
} catch {
    Write-Host "✗ Docker 컨테이너 상태 확인 실패" -ForegroundColor Red
}

# 로컬 포트 확인
Write-Host "`n로컬 포트 확인 중..." -ForegroundColor Yellow
$localPorts = Get-NetTCPConnection -LocalPort 80,443 -ErrorAction SilentlyContinue | 
    Select-Object LocalAddress, LocalPort, State
if ($localPorts) {
    Write-Host $localPorts | Format-Table
} else {
    Write-Host "⚠ 포트 80, 443이 열려있지 않습니다." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "테스트 완료" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n다음 단계:" -ForegroundColor Yellow
Write-Host "1. 포트 포워딩이 설정되어 있다면 라우터 설정 확인" -ForegroundColor White
Write-Host "2. 방화벽에서 포트 80, 443 허용 확인" -ForegroundColor White
Write-Host "3. DuckDNS IP 업데이트 확인" -ForegroundColor White
Write-Host "4. 상세 가이드: .\PORT-FORWARDING-GUIDE.md" -ForegroundColor White