# DuckDNS 도메인을 ngrok과 연결하는 방법

## 현재 상황

- **DuckDNS 도메인**: `ncaco.duckdns.org` → `121.174.177.37` (건물 공유 IP)
- **ngrok URL**: `https://infinitively-mealier-carmen.ngrok-free.dev`
- **문제**: 포트 포워딩이 안 되어 있어서 DuckDNS 도메인으로 직접 접속 불가

## 해결 방법

### 방법 1: ngrok의 도메인 기능 사용 (추천)

ngrok 유료 플랜에서 커스텀 도메인을 설정할 수 있습니다.

**장점:**
- DuckDNS 도메인을 직접 사용 가능
- 안정적이고 빠름
- SSL 인증서 자동 관리

**설정 방법:**

1. **ngrok 계정 업그레이드** (유료 플랜 필요)
   - https://dashboard.ngrok.com/billing/plans

2. **도메인 설정**
   ```bash
   # ngrok 설정 파일에 도메인 추가
   ngrok config edit
   ```
   
   또는:
   ```bash
   # 도메인으로 터널 시작
   ngrok http 80 --domain=ncaco.duckdns.org
   ```

3. **DuckDNS 설정**
   - DuckDNS에서 `ncaco.duckdns.org`를 ngrok이 제공하는 IP로 업데이트
   - ngrok 대시보드에서 도메인 IP 확인

**비용:**
- ngrok Pro: $8/월
- ngrok Team: $40/월

---

### 방법 2: nginx에서 ngrok URL로 리다이렉트 (제한적)

포트 포워딩이 안 되어 있어서 실제로는 작동하지 않지만, 설정 방법은 다음과 같습니다:

**nginx 설정:**
```nginx
server {
    listen 80;
    server_name ncaco.duckdns.org;
    
    # ngrok URL로 리다이렉트
    location / {
        return 301 https://infinitively-mealier-carmen.ngrok-free.dev$request_uri;
    }
}
```

**문제점:**
- 포트 포워딩이 안 되어 있어서 DuckDNS 도메인으로 접속해도 라우터 페이지가 나옴
- 실제로 작동하지 않음

---

### 방법 3: Cloudflare Tunnel 사용 (무료 대안)

Cloudflare Tunnel을 사용하면 무료로 커스텀 도메인을 사용할 수 있습니다.

**장점:**
- 완전 무료
- DuckDNS 도메인 사용 가능
- SSL 인증서 자동 관리

**설정 방법:**

1. **Cloudflare 계정 생성**
   - https://dash.cloudflare.com/sign-up

2. **도메인 추가** (DuckDNS 도메인)
   - Cloudflare에서 `duckdns.org`를 관리할 수 없으므로
   - 별도 도메인을 구매하거나
   - Cloudflare Tunnel의 임시 도메인 사용

3. **Cloudflared 설치 및 설정**
   ```powershell
   # 설치
   choco install cloudflared
   
   # 로그인
   cloudflared tunnel login
   
   # 터널 생성
   cloudflared tunnel create my-tunnel
   
   # 설정 파일 생성
   # ~/.cloudflared/config.yml
   tunnel: YOUR_TUNNEL_ID
   credentials-file: ~/.cloudflared/YOUR_TUNNEL_ID.json
   
   ingress:
     - hostname: ncaco.duckdns.org
       service: http://localhost:80
     - service: http_status:404
   
   # 터널 실행
   cloudflared tunnel run my-tunnel
   ```

---

### 방법 4: 프론트엔드에서 ngrok URL 사용

가장 간단한 방법은 프론트엔드 코드에서 ngrok URL을 사용하는 것입니다.

**설정:**

1. **환경 변수 업데이트**
   ```env
   # .env.production
   NEXT_PUBLIC_API_URL=https://infinitively-mealier-carmen.ngrok-free.dev/api/v1
   ```

2. **프론트엔드 빌드 및 재배포**
   ```powershell
   docker compose --env-file .env.production build frontend
   docker compose --env-file .env.production up -d frontend
   ```

**장점:**
- 추가 비용 없음
- 빠르게 적용 가능

**단점:**
- ngrok URL이 변경되면 재배포 필요
- DuckDNS 도메인을 직접 사용할 수 없음

---

## 추천 방법

**현재 상황에서는 방법 4 (프론트엔드에서 ngrok URL 사용)를 추천합니다.**

이유:
- 추가 비용 없음
- 빠르게 적용 가능
- 안정적으로 작동

**향후 개선:**
- ngrok 유료 플랜으로 업그레이드하여 DuckDNS 도메인 직접 사용
- 또는 Cloudflare Tunnel 사용

---

## 자동화 스크립트

ngrok URL이 변경될 때마다 자동으로 환경 변수를 업데이트하는 스크립트:

```powershell
# update-ngrok-url.ps1
$ngrokUrl = (Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels").tunnels[0].public_url
$apiUrl = "$ngrokUrl/api/v1"

Write-Host "현재 ngrok URL: $ngrokUrl" -ForegroundColor Cyan
Write-Host "API URL: $apiUrl" -ForegroundColor Green

# .env.production 파일 업데이트
$envFile = ".env.production"
$content = Get-Content $envFile -Raw
$content = $content -replace "NEXT_PUBLIC_API_URL=.*", "NEXT_PUBLIC_API_URL=$apiUrl"
Set-Content -Path $envFile -Value $content

Write-Host "환경 변수가 업데이트되었습니다." -ForegroundColor Green
Write-Host "프론트엔드를 재배포하세요: docker compose build frontend && docker compose up -d frontend" -ForegroundColor Yellow
```
