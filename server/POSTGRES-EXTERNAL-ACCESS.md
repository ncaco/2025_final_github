# PostgreSQL 외부 접근 가이드

## 현재 설정

- **포트**: 5432 (호스트 → 컨테이너 매핑됨)
- **데이터베이스**: `common_db`
- **사용자**: `app_user`
- **패스워드**: `app_password_123`

## 접근 방법

### 1. 로컬 호스트에서 접근 (같은 컴퓨터)

#### PowerShell에서:
```powershell
# Docker를 통한 접근 (권장)
docker compose --env-file .env.production exec postgres psql -U app_user -d common_db

# 또는 직접 접근 (psql이 설치된 경우)
psql -h localhost -p 5432 -U app_user -d common_db
```

#### 연결 문자열:
```
postgresql://app_user:app_password_123@localhost:5432/common_db
```

### 2. 같은 네트워크의 다른 컴퓨터에서 접근

#### 서버 IP 주소 확인:
```powershell
# Windows에서
ipconfig

# Linux/Mac에서
ifconfig
# 또는
ip addr
```

#### 접근 방법:
```powershell
# psql 사용
psql -h [서버IP주소] -p 5432 -U app_user -d common_db

# 예시: 서버 IP가 192.168.1.100인 경우
psql -h 192.168.1.100 -p 5432 -U app_user -d common_db
```

#### 연결 문자열:
```
postgresql://app_user:app_password_123@[서버IP주소]:5432/common_db
```

### 3. 인터넷을 통한 외부 접근 (ngrok TCP 터널)

#### 보안 주의사항:
⚠️ **PostgreSQL을 인터넷에 직접 노출하는 것은 매우 위험합니다!**
- 가능하면 SSH 터널이나 VPN을 사용하세요
- 개발/테스트 목적으로만 사용하세요
- 프로덕션 환경에서는 절대 사용하지 마세요

#### ngrok TCP 터널 사용:

**1단계: ngrok TCP 터널 시작**
```powershell
cd server
.\ngrok-postgres.ps1
```

또는 직접 실행:
```powershell
ngrok tcp 5432
```

**2단계: ngrok에서 제공하는 외부 URL 확인**
터널이 시작되면 다음과 같은 URL이 표시됩니다:
```
Forwarding  tcp://0.tcp.ngrok.io:12345 -> localhost:5432
```

**3단계: 외부에서 접근**
```powershell
# ngrok URL 사용 (예: 0.tcp.ngrok.io:12345)
psql -h 0.tcp.ngrok.io -p 12345 -U app_user -d common_db
```

#### 연결 문자열:
```
postgresql://app_user:app_password_123@0.tcp.ngrok.io:12345/common_db
```

### 4. SSH 터널 사용 (가장 안전한 방법)

#### 서버에서 SSH 서버 설정:
```powershell
# Windows에서 OpenSSH 서버 활성화
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

#### 클라이언트에서 SSH 터널 생성:
```bash
# Linux/Mac
ssh -L 5432:localhost:5432 user@server-ip

# Windows (Git Bash 또는 WSL)
ssh -L 5432:localhost:5432 user@server-ip
```

#### 로컬에서 접근:
```powershell
psql -h localhost -p 5432 -U app_user -d common_db
```

## 데이터베이스 클라이언트 도구 사용

### DBeaver
1. 새 연결 생성
2. PostgreSQL 선택
3. 연결 정보 입력:
   - Host: `localhost` (로컬) 또는 `[서버IP]` (원격)
   - Port: `5432`
   - Database: `common_db`
   - Username: `app_user`
   - Password: `app_password_123`

### pgAdmin
1. 새 서버 추가
2. Connection 탭에서:
   - Host: `localhost` 또는 `[서버IP]`
   - Port: `5432`
   - Database: `common_db`
   - Username: `app_user`
   - Password: `app_password_123`

### TablePlus / DataGrip
연결 문자열 사용:
```
postgresql://app_user:app_password_123@localhost:5432/common_db
```

## 방화벽 설정

### Windows 방화벽:
```powershell
# 인바운드 규칙 추가
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Allow
```

### Linux (ufw):
```bash
sudo ufw allow 5432/tcp
```

### Linux (iptables):
```bash
sudo iptables -A INPUT -p tcp --dport 5432 -j ACCEPT
```

## 보안 권장사항

1. **강력한 패스워드 사용**: 기본 패스워드를 변경하세요
2. **IP 화이트리스트**: 특정 IP에서만 접근 허용
3. **SSL/TLS 사용**: 암호화된 연결 사용
4. **방화벽 설정**: 불필요한 포트 노출 방지
5. **SSH 터널 사용**: 가장 안전한 방법
6. **VPN 사용**: 회사/개인 VPN 네트워크 활용

## 문제 해결

### 연결 실패 시:
1. PostgreSQL 컨테이너가 실행 중인지 확인:
   ```powershell
   docker compose --env-file .env.production ps postgres
   ```

2. 포트가 열려있는지 확인:
   ```powershell
   netstat -an | Select-String "5432"
   ```

3. 방화벽 설정 확인

4. PostgreSQL 로그 확인:
   ```powershell
   docker compose --env-file .env.production logs postgres
   ```

### 패스워드 인증 실패:
1. 환경 변수 확인:
   ```powershell
   docker compose --env-file .env.production exec postgres env | Select-String "POSTGRES_PASSWORD"
   ```

2. 패스워드 재설정:
   ```powershell
   docker compose --env-file .env.production exec postgres psql -U app_user -d common_db -c "ALTER USER app_user WITH PASSWORD '새로운_패스워드';"
   ```