# DuckDNS 도메인을 ngrok URL로 리다이렉트하는 방법

## 원하는 구조

```
https://ncaco.duckdns.org/ 
  → https://infinitively-mealier-carmen.ngrok-free.dev 
    → localhost:80
```

## 문제점

현재 상황에서는 **포트 포워딩이 안 되어 있어서** DuckDNS 도메인으로 직접 접속할 수 없습니다.

- DuckDNS: `ncaco.duckdns.org` → `121.174.177.37` (건물 공유 IP)
- 포트 포워딩 없음 → 접속 시 라우터 관리 페이지 표시
- 따라서 직접 리다이렉트 불가능

## 해결 방법

### 방법 1: ngrok 도메인 기능 사용 (가장 간단, 유료)

ngrok Pro 플랜($8/월)에서 DuckDNS 도메인을 직접 사용할 수 있습니다.

**설정 방법:**

1. **ngrok 계정 업그레이드**
   - https://dashboard.ngrok.com/billing/plans
   - Pro 플랜 선택 ($8/월)

2. **도메인 설정**
   ```bash
   # ngrok 설정 파일 편집
   ngrok config edit
   ```
   
   또는:
   ```bash
   # DuckDNS 도메인으로 터널 시작
   ngrok http 80 --domain=ncaco.duckdns.org
   ```

3. **DuckDNS 설정**
   - DuckDNS에서 `ncaco.duckdns.org`를 ngrok이 제공하는 IP로 업데이트
   - ngrok 대시보드에서 도메인 IP 확인

**결과:**
- `https://ncaco.duckdns.org`로 직접 접속 가능
- ngrok을 통하지 않고도 접속 가능
- SSL 인증서 자동 관리

---

### 방법 2: Cloudflare Workers 사용 (무료, 복잡)

Cloudflare Workers를 사용하여 DuckDNS 도메인에서 ngrok URL로 리다이렉트할 수 있습니다.

**설정 방법:**

1. **Cloudflare 계정 생성**
   - https://dash.cloudflare.com/sign-up

2. **Workers 생성**
   ```javascript
   // redirect-worker.js
   export default {
     async fetch(request) {
       const url = new URL(request.url);
       
       // ngrok URL로 리다이렉트
       const ngrokUrl = 'https://infinitively-mealier-carmen.ngrok-free.dev';
       const redirectUrl = `${ngrokUrl}${url.pathname}${url.search}`;
       
       return Response.redirect(redirectUrl, 301);
     }
   }
   ```

3. **도메인 연결**
   - Cloudflare에서 DuckDNS 도메인 추가
   - Workers를 도메인에 연결

**문제점:**
- DuckDNS는 `duckdns.org`의 서브도메인
- Cloudflare에서 `duckdns.org`를 관리할 수 없음
- 따라서 이 방법은 작동하지 않음

---

### 방법 3: 별도 리다이렉트 서버 구축 (복잡)

포트 포워딩이 가능한 별도 서버에서 리다이렉트 서비스를 운영합니다.

**필요 사항:**
- 포트 포워딩 가능한 서버
- DuckDNS 도메인을 해당 서버로 설정
- 리다이렉트 서버 구축

**구현 예시 (Nginx):**
```nginx
server {
    listen 80;
    server_name ncaco.duckdns.org;
    
    location / {
        return 301 https://infinitively-mealier-carmen.ngrok-free.dev$request_uri;
    }
}
```

**문제점:**
- 현재 환경에서는 포트 포워딩 불가능
- 별도 서버 필요

---

### 방법 4: 프론트엔드에서 클라이언트 사이드 리다이렉트 (제한적)

프론트엔드 코드에서 DuckDNS 도메인으로 접속했을 때 ngrok URL로 리다이렉트합니다.

**구현:**

`frontend/app/layout.tsx` 또는 `frontend/middleware.ts`:
```typescript
// 클라이언트 사이드 리다이렉트
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  if (hostname === 'ncaco.duckdns.org') {
    window.location.href = 'https://infinitively-mealier-carmen.ngrok-free.dev';
  }
}
```

**문제점:**
- DuckDNS 도메인으로 접속 자체가 불가능 (포트 포워딩 없음)
- 따라서 이 방법도 작동하지 않음

---

## 추천 방법

**현재 상황에서는 방법 1 (ngrok 도메인 기능)만 가능합니다.**

### ngrok Pro 플랜 사용

1. **ngrok Pro 플랜 구독** ($8/월)
   - https://dashboard.ngrok.com/billing/plans

2. **도메인 설정**
   ```bash
   ngrok http 80 --domain=ncaco.duckdns.org
   ```

3. **DuckDNS IP 업데이트**
   - ngrok 대시보드에서 도메인 IP 확인
   - DuckDNS에서 해당 IP로 업데이트

**결과:**
- `https://ncaco.duckdns.org`로 직접 접속 가능
- ngrok을 통한 안정적인 연결
- SSL 인증서 자동 관리

---

## 대안: 현재 방법 유지

포트 포워딩이 불가능한 현재 상황에서는:

1. **ngrok URL 직접 사용**
   - `https://infinitively-mealier-carmen.ngrok-free.dev`
   - 가장 간단하고 안정적

2. **향후 개선**
   - 포트 포워딩 가능한 환경으로 이동
   - 또는 ngrok Pro 플랜으로 업그레이드

---

## 요약

| 방법 | 비용 | 난이도 | 가능 여부 |
|------|------|--------|----------|
| ngrok 도메인 기능 | $8/월 | 쉬움 | ✅ 가능 |
| Cloudflare Workers | 무료 | 중간 | ❌ 불가능 (DuckDNS 제약) |
| 별도 리다이렉트 서버 | 서버 비용 | 어려움 | ❌ 불가능 (포트 포워딩 없음) |
| 클라이언트 사이드 리다이렉트 | 무료 | 쉬움 | ❌ 불가능 (접속 자체 불가) |

**결론:** 포트 포워딩이 불가능한 현재 환경에서는 ngrok Pro 플랜의 도메인 기능을 사용하는 것이 유일한 해결책입니다.
