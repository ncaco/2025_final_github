# PostgreSQL 비밀번호 초기화 스크립트
# 관리자 권한으로 실행 필요

Write-Host "PostgreSQL 비밀번호 초기화 스크립트" -ForegroundColor Green
Write-Host "주의: 이 스크립트는 관리자 권한이 필요합니다." -ForegroundColor Yellow
Write-Host ""

# PostgreSQL 서비스 이름 확인
$serviceName = "postgresql-x64-18"
$pgBinPath = "C:\Program Files\PostgreSQL\18\bin"
$pgDataPath = "C:\Program Files\PostgreSQL\18\data"
$pgHbaPath = Join-Path $pgDataPath "pg_hba.conf"

# 1. pg_hba.conf 백업
Write-Host "1. pg_hba.conf 백업 중..." -ForegroundColor Cyan
$backupPath = "$pgHbaPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $pgHbaPath $backupPath -Force
Write-Host "   백업 완료: $backupPath" -ForegroundColor Green

# 2. pg_hba.conf 수정 (trust 모드로 변경)
Write-Host "2. pg_hba.conf 수정 중..." -ForegroundColor Cyan
$content = Get-Content $pgHbaPath
$newContent = $content | ForEach-Object {
    $line = $_
    # IPv4 localhost (127.0.0.1)
    if ($line -match '^host\s+all\s+all\s+127\.0\.0\.1/32\s+(scram-sha-256|md5|password|trust)') {
        $line -replace '\s+(scram-sha-256|md5|password|trust)$', ' trust'
    }
    # IPv6 localhost (::1)
    elseif ($line -match '^host\s+all\s+all\s+::1/128\s+(scram-sha-256|md5|password|trust)') {
        $line -replace '\s+(scram-sha-256|md5|password|trust)$', ' trust'
    }
    # localhost (모든 방식)
    elseif ($line -match '^host\s+all\s+all\s+localhost\s+(scram-sha-256|md5|password|trust)') {
        $line -replace '\s+(scram-sha-256|md5|password|trust)$', ' trust'
    }
    else {
        $line
    }
}
$newContent | Set-Content $pgHbaPath
Write-Host "   수정 완료" -ForegroundColor Green
Write-Host "   수정된 내용 확인:" -ForegroundColor Yellow
$newContent | Select-String -Pattern '^host.*127\.0\.0\.1|^host.*::1|^host.*localhost' | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }

# 3. PostgreSQL 서비스 재시작
Write-Host "3. PostgreSQL 서비스 재시작 중..." -ForegroundColor Cyan
Stop-Service $serviceName -Force
Start-Sleep -Seconds 2
Start-Service $serviceName
Start-Sleep -Seconds 5
Write-Host "   재시작 완료 (5초 대기)" -ForegroundColor Green

# 4. 새 비밀번호 입력 받기
Write-Host ""
$newPassword = Read-Host "새로운 postgres 비밀번호를 입력하세요" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($newPassword)
)

# 5. 비밀번호 변경
Write-Host "4. 비밀번호 변경 중..." -ForegroundColor Cyan
# trust 모드에서는 PGPASSWORD 환경 변수를 설정하지 않음
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
$sqlCommand = "ALTER USER postgres WITH PASSWORD '$plainPassword';"
# -h localhost를 명시적으로 지정하여 IPv4 연결 사용
& "$pgBinPath\psql.exe" -h localhost -U postgres -d postgres -c $sqlCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "   비밀번호 변경 완료!" -ForegroundColor Green
} else {
    Write-Host "   비밀번호 변경 실패. 수동으로 실행해주세요." -ForegroundColor Red
    Write-Host "   명령어: & '$pgBinPath\psql.exe' -U postgres -d postgres" -ForegroundColor Yellow
    Write-Host "   SQL: ALTER USER postgres WITH PASSWORD '새비밀번호';" -ForegroundColor Yellow
}

# 6. pg_hba.conf 원복
Write-Host "5. pg_hba.conf 원복 중..." -ForegroundColor Cyan
$restoreContent = $content | ForEach-Object {
    $line = $_
    # IPv4 localhost
    if ($line -match '^host\s+all\s+all\s+127\.0\.0\.1/32\s+trust') {
        $line -replace '\s+trust$', ' scram-sha-256'
    }
    # IPv6 localhost
    elseif ($line -match '^host\s+all\s+all\s+::1/128\s+trust') {
        $line -replace '\s+trust$', ' scram-sha-256'
    }
    # localhost
    elseif ($line -match '^host\s+all\s+all\s+localhost\s+trust') {
        $line -replace '\s+trust$', ' scram-sha-256'
    }
    else {
        $line
    }
}
$restoreContent | Set-Content $pgHbaPath
Write-Host "   원복 완료" -ForegroundColor Green

# 7. 서비스 재시작
Write-Host "6. PostgreSQL 서비스 재시작 중..." -ForegroundColor Cyan
Stop-Service $serviceName -Force
Start-Sleep -Seconds 2
Start-Service $serviceName
Start-Sleep -Seconds 3
Write-Host "   재시작 완료" -ForegroundColor Green

Write-Host ""
Write-Host "비밀번호 초기화 완료!" -ForegroundColor Green
Write-Host "새 비밀번호로 접속해보세요:" -ForegroundColor Yellow
Write-Host "  & '$pgBinPath\psql.exe' -U postgres" -ForegroundColor Cyan

