# ngrok 사용 가이드

## 현재 상태

✅ **백엔드 API는 정상 작동 중입니다!**

## 접속 방법

### 1. 브라우저에서 접속

ngrok 무료 플랜은 첫 방문 시 보안 경고 페이지를 표시합니다.

**프론트엔드:**
- URL: `https://infinitively-mealier-carmen.ngrok-free.dev`
- 경고 페이지가 나타나면 **"Visit Site"** 버튼을 클릭하세요

**백엔드 API:**
- Health Check: `https://infinitively-mealier-carmen.ngrok-free.dev/api/v1/health`
- API 문서: `https://infinitively-mealier-carmen.ngrok-free.dev/docs`
- ReDoc: `https://infinitively-mealier-carmen.ngrok-free.dev/redoc`

### 2. API 클라이언트/Postman 사용

ngrok 경고 페이지를 우회하려면 요청 헤더에 다음을 추가하세요:

```
ngrok-skip-browser-warning: true
```

**예시 (PowerShell):**
```powershell
$headers = @{
    "ngrok-skip-browser-warning" = "true"
}
Invoke-WebRequest -Uri "https://infinitively-mealier-carmen.ngrok-free.dev/api/v1/health" -Headers $headers
```

**예시 (curl):**
```bash
curl -H "ngrok-skip-browser-warning: true" https://infinitively-mealier-carmen.ngrok-free.dev/api/v1/health
```

**예시 (JavaScript/Fetch):**
```javascript
fetch('https://infinitively-mealier-carmen.ngrok-free.dev/api/v1/health', {
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
})
```

### 3. 프론트엔드 설정

프론트엔드에서 백엔드 API를 호출할 때도 헤더를 추가해야 합니다.

**Next.js API 클라이언트 설정 예시:**

`frontend/lib/api/client.ts` 파일을 수정:

```typescript
const client = {
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options?.headers,
        'ngrok-skip-browser-warning': 'true', // ngrok 경고 페이지 우회
      },
    });
    // ...
  },
  // POST, PUT, DELETE도 동일하게 헤더 추가
};
```

## 백엔드 API 엔드포인트

### 인증
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/refresh` - 토큰 갱신

### Health Check
- `GET /api/v1/health` - 서버 상태 확인

### API 문서
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc

## ngrok 경고 페이지 해결 방법

### 방법 1: 헤더 추가 (권장)
모든 API 요청에 `ngrok-skip-browser-warning: true` 헤더 추가

### 방법 2: ngrok 유료 플랜 사용
유료 플랜은 경고 페이지가 없습니다.

### 방법 3: 브라우저에서 수동 클릭
경고 페이지가 나타나면 "Visit Site" 버튼을 클릭

## 현재 ngrok URL

**터널 URL:** `https://infinitively-mealier-carmen.ngrok-free.dev`

⚠️ **주의:** ngrok 무료 플랜은 세션이 종료되면 URL이 변경됩니다.

## 터널 상태 확인

웹 인터페이스: `http://localhost:4040`
- 요청/응답 로그 확인
- 터널 상태 모니터링

## 문제 해결

### 백엔드 API가 응답하지 않는 경우

1. **서버 상태 확인:**
   ```powershell
   docker compose ps
   ```

2. **nginx 로그 확인:**
   ```powershell
   docker compose logs nginx --tail 50
   ```

3. **백엔드 로그 확인:**
   ```powershell
   docker compose logs backend --tail 50
   ```

4. **직접 테스트:**
   ```powershell
   # 로컬에서 직접 테스트
   Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health"
   
   # ngrok을 통해 테스트 (헤더 포함)
   $headers = @{"ngrok-skip-browser-warning"="true"}
   Invoke-WebRequest -Uri "https://infinitively-mealier-carmen.ngrok-free.dev/api/v1/health" -Headers $headers
   ```
