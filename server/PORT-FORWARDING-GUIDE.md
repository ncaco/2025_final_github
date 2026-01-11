# 포트 포워딩 설정 가이드 (DuckDNS 사용)

## 개요

DuckDNS 도메인(`ncaco.duckdns.net`)을 사용하여 외부에서 서버에 접근하려면 라우터에서 포트 포워딩을 설정해야 합니다.

## 필요한 포트

| 서비스 | 포트 | 프로토콜 | 설명 |
|--------|------|----------|------|
| HTTP | 80 | TCP | 웹 서비스 (Let's Encrypt 인증용) |
| HTTPS | 443 | TCP | HTTPS 웹 서비스 |
| SSH (선택) | 22 | TCP | 원격 관리용 (선택사항) |

## 단계별 설정

### 1단계: 서버의 로컬 IP 주소 확인

**Windows에서:**
```powershell
ipconfig
```

**확인할 정보:**
- IPv4 주소: 예) `192.168.1.100`
- 서브넷 마스크: 예) `255.255.255.0`
- 기본 게이트웨이: 예) `192.168.1.1` (라우터 IP)

### 2단계: 라우터 관리 페이지 접속

1. 웹 브라우저에서 라우터 IP 주소 입력 (예: `192.168.1.1`)
2. 라우터 관리자 계정으로 로그인
   - 기본 계정: `admin` / `admin` 또는 `admin` / `password`
   - 라우터 제조사에 따라 다름

### 3단계: 포트 포워딩 설정

라우터 제조사별 설정 위치:

#### 일반적인 위치:
- **포트 포워딩** 또는 **Port Forwarding**
- **Virtual Server** 또는 **가상 서버**
- **NAT 설정** → **포트 포워딩**
- **고급 설정** → **포트 포워딩**

#### 설정 항목:

**포트 80 (HTTP):**
```
서비스 이름: HTTP
외부 포트: 80
내부 IP: [서버의 로컬 IP] (예: 192.168.1.100)
내부 포트: 80
프로토콜: TCP
상태: 활성화
```

**포트 443 (HTTPS):**
```
서비스 이름: HTTPS
외부 포트: 443
내부 IP: [서버의 로컬 IP] (예: 192.168.1.100)
내부 포트: 443
프로토콜: TCP
상태: 활성화
```

### 4단계: DuckDNS 설정 확인

1. **DuckDNS 웹사이트 접속**: https://www.duckdns.org/
2. **로그인** 후 도메인 확인
3. **현재 IP 주소 확인**:
   ```powershell
   # 공인 IP 주소 확인
   Invoke-RestMethod -Uri "https://api.ipify.org"
   ```
4. **DuckDNS IP 업데이트** (자동 또는 수동)
   - 자동 업데이트 스크립트 사용 권장

### 5단계: 방화벽 설정

**Windows 방화벽:**
```powershell
# HTTP 포트 허용
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# HTTPS 포트 허용
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

**또는 GUI에서:**
1. Windows 보안 → 방화벽 및 네트워크 보호
2. 고급 설정
3. 인바운드 규칙 → 새 규칙
4. 포트 선택 → TCP → 특정 로컬 포트: `80, 443`
5. 연결 허용 → 모든 프로필 → 이름: "Web Server"

### 6단계: 포트 포워딩 테스트

**외부에서 접속 테스트:**
```powershell
# 다른 네트워크에서 테스트 (모바일 데이터 사용)
# 브라우저에서 접속
http://ncaco.duckdns.net
```

**포트 확인:**
```powershell
# 포트가 열려있는지 확인
Test-NetConnection -ComputerName ncaco.duckdns.net -Port 80
Test-NetConnection -ComputerName ncaco.duckdns.net -Port 443
```

## 라우터 제조사별 가이드

### TP-Link
1. 관리 페이지 접속: `192.168.1.1` 또는 `192.168.0.1`
2. **고급** → **NAT 포워딩** → **가상 서버**
3. **추가** 버튼 클릭
4. 설정 입력 후 저장

### ASUS
1. 관리 페이지 접속: `192.168.1.1`
2. **고급 설정** → **WAN** → **가상 서버/포트 포워딩**
3. **포트 포워딩 목록**에서 추가

### Netgear
1. 관리 페이지 접속: `192.168.1.1` 또는 `routerlogin.net`
2. **고급** → **고급 설정** → **포트 포워딩/포트 트리거**
3. **포트 포워딩 추가** 클릭

### D-Link
1. 관리 페이지 접속: `192.168.0.1`
2. **고급** → **포트 포워딩**
3. **포트 포워딩 규칙 추가**

### 공유기 (일반)
1. 관리 페이지 접속 (라우터 뒷면에 표시된 IP)
2. **포트 포워딩** 또는 **가상 서버** 메뉴 찾기
3. 새 규칙 추가

## DuckDNS 자동 업데이트 스크립트

**Windows 작업 스케줄러 사용:**

```powershell
# duckdns-update.ps1
$domain = "ncaco"
$token = "YOUR_DUCKDNS_TOKEN"
$ip = (Invoke-RestMethod -Uri "https://api.ipify.org")

$url = "https://www.duckdns.org/update?domains=$domain&token=$token&ip=$ip"
$response = Invoke-RestMethod -Uri $url

Write-Host "DuckDNS 업데이트: $response" -ForegroundColor Green
Write-Host "현재 IP: $ip" -ForegroundColor Cyan
```

**작업 스케줄러 설정:**
1. 작업 스케줄러 열기
2. 기본 작업 만들기
3. 트리거: 로그온 시 또는 매일 특정 시간
4. 작업: PowerShell 스크립트 실행
5. 스크립트 경로: `C:\path\to\duckdns-update.ps1`

## 문제 해결

### 포트 포워딩이 작동하지 않는 경우

**1. 라우터 설정 확인:**
- 포트 포워딩 규칙이 올바르게 설정되었는지 확인
- 내부 IP 주소가 정확한지 확인
- 규칙이 활성화되어 있는지 확인

**2. 서버 IP 주소 확인:**
```powershell
ipconfig
```
- 서버의 IP가 변경되었을 수 있음
- 고정 IP 설정 권장

**3. 방화벽 확인:**
```powershell
# Windows 방화벽 규칙 확인
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*HTTP*" -or $_.DisplayName -like "*HTTPS*"}
```

**4. Docker 포트 매핑 확인:**
```powershell
docker compose --env-file .env.production ps
```
- nginx 컨테이너가 포트 80, 443을 올바르게 매핑하고 있는지 확인

**5. 공인 IP 확인:**
```powershell
# 현재 공인 IP
Invoke-RestMethod -Uri "https://api.ipify.org"

# DuckDNS에 설정된 IP
nslookup ncaco.duckdns.net
```

### 공유 IP 환경 (건물 공유 인터넷)

건물에서 공유 IP를 사용하는 경우:
- 포트 포워딩이 관리자 권한이 필요할 수 있음
- 관리자에게 포트 포워딩 요청 필요
- 또는 ngrok/Cloudflare Tunnel 같은 터널링 서비스 사용

## 보안 권장사항

1. **강력한 패스워드 사용**: 라우터 관리자 계정
2. **SSH 키 인증**: SSH 사용 시 패스워드 대신 키 사용
3. **방화벽 규칙**: 필요한 포트만 열기
4. **정기 업데이트**: 라우터 펌웨어 업데이트
5. **VPN 사용**: 가능하면 VPN을 통한 접근 권장

## 다음 단계

포트 포워딩 설정 완료 후:
1. Let's Encrypt 인증서 발급
2. nginx HTTPS 설정 활성화
3. 도메인으로 접속 테스트

자세한 내용은 `DUCKDNS-REDIRECT-SETUP.md` 파일을 참고하세요.