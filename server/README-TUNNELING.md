# 터널링 서비스를 사용한 외부 접속 설정

건물의 공유 IP를 사용하거나 라우터 설정을 변경할 수 없는 경우, 터널링 서비스를 사용하여 외부에서 접속할 수 있습니다.

## 옵션 1: ngrok (추천)

### 장점
- 무료 플랜 제공
- 빠른 설정
- HTTPS 자동 지원
- 간단한 사용법

### 설정 방법

1. **ngrok 설치**
   ```powershell
   # Chocolatey 사용
   choco install ngrok
   
   # 또는 Scoop 사용
   scoop install ngrok
   
   # 또는 직접 다운로드
   # https://ngrok.com/download
   ```

2. **ngrok 계정 생성 및 인증**
   - https://ngrok.com 에서 무료 계정 생성
   - 대시보드에서 authtoken 복사
   - PowerShell에서 실행:
     ```powershell
     ngrok config add-authtoken YOUR_AUTH_TOKEN
     ```

3. **터널 시작**
   ```powershell
   cd server
   .\ngrok-setup.ps1
   ```

4. **접속**
   - ngrok이 제공하는 URL (예: `https://xxxx-xxxx-xxxx.ngrok-free.app`)로 접속
   - 이 URL을 프론트엔드 도메인으로 사용 가능

### ngrok 무료 플랜 제한사항
- 세션당 2시간 제한 (재연결 필요)
- URL이 매번 변경됨 (고정 URL은 유료)
- 월 트래픽 제한

---

## 옵션 2: Cloudflare Tunnel (Cloudflared)

### 장점
- 완전 무료
- 무제한 트래픽
- 고정 도메인 사용 가능 (Cloudflare 도메인 필요)
- 더 안정적

### 설정 방법

1. **Cloudflared 설치**
   ```powershell
   # Chocolatey 사용
   choco install cloudflared
   
   # 또는 직접 다운로드
   # https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **터널 생성 및 실행**
   ```powershell
   # 로그인
   cloudflared tunnel login
   
   # 터널 생성
   cloudflared tunnel create my-tunnel
   
   # 터널 실행
   cloudflared tunnel run my-tunnel
   ```

3. **설정 파일 생성** (`~/.cloudflared/config.yml`)
   ```yaml
   tunnel: YOUR_TUNNEL_ID
   credentials-file: ~/.cloudflared/YOUR_TUNNEL_ID.json
   
   ingress:
     - hostname: your-domain.com
       service: http://localhost:80
     - service: http_status:404
   ```

---

## 옵션 3: 로컬 네트워크 접속

같은 건물/네트워크 내에서만 접속하는 경우:

1. **로컬 IP로 접속**
   - 프론트엔드: `http://192.168.0.15`
   - 백엔드 API: `http://192.168.0.15:8000`

2. **다른 기기에서 접속**
   - 같은 Wi-Fi 네트워크에 연결
   - 위의 로컬 IP로 접속

---

## 추천 설정

**개발/테스트 환경**: ngrok 사용 (빠르고 간단)
**프로덕션 환경**: Cloudflare Tunnel 사용 (안정적이고 무료)

---

## 주의사항

- 터널링 서비스는 중간 프록시 역할을 하므로 약간의 지연이 발생할 수 있습니다
- ngrok 무료 플랜은 세션이 종료되면 URL이 변경됩니다
- 프로덕션 환경에서는 고정 도메인을 사용하는 것이 좋습니다
