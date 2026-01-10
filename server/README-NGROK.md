# ngrok을 사용한 서버 환경 설정

서버 환경에서 ngrok을 사용하여 외부 접속을 가능하게 하는 방법입니다.

## ✅ ngrok 인증 완료

authtoken이 성공적으로 설정되었습니다.

## 사용 방법

### 방법 1: 호스트에서 직접 실행 (추천)

가장 간단하고 안정적인 방법입니다.

```powershell
# 서버 디렉토리로 이동
cd server

# ngrok 터널 시작
.\ngrok-start.ps1
```

또는 직접 실행:
```powershell
ngrok http 80
```

**장점:**
- 설정이 간단함
- 호스트에서 직접 관리 가능
- 문제 발생 시 디버깅이 쉬움

**터널이 시작되면:**
- 터널 URL이 표시됩니다 (예: `https://xxxx-xxxx-xxxx.ngrok-free.app`)
- 웹 인터페이스: `http://localhost:4040` (터널 상태 확인)
- 이 URL로 외부에서 접속 가능합니다

### 방법 2: Docker Compose에 추가 (선택사항)

ngrok을 Docker 컨테이너로 실행하려면 `docker-compose.yml`에 다음을 추가할 수 있습니다:

```yaml
  ngrok:
    image: ngrok/ngrok:latest
    container_name: challenge_ngrok
    command: ["start", "--all", "--config", "/etc/ngrok.yml"]
    volumes:
      - ./ngrok.yml:/etc/ngrok.yml:ro
    ports:
      - "4040:4040"
    networks:
      - app-network
    restart: unless-stopped
```

하지만 호스트에서 실행하는 것이 더 간단하고 권장됩니다.

## ngrok 무료 플랜 제한사항

- **세션 시간**: 2시간 (자동 종료 후 재연결 필요)
- **URL 변경**: 매번 새로운 URL 생성 (고정 URL은 유료)
- **트래픽 제한**: 월 제한 있음

## ngrok 웹 인터페이스

터널이 실행 중일 때 `http://localhost:4040`에서:
- 요청/응답 로그 확인
- 터널 상태 모니터링
- 요청 재실행 (Replay)

## 자동 재연결 (선택사항)

ngrok 세션이 종료되면 자동으로 재연결하는 스크립트:

```powershell
# ngrok-auto-restart.ps1
while ($true) {
    Write-Host "ngrok 터널 시작..." -ForegroundColor Cyan
    ngrok http 80
    Write-Host "ngrok 세션이 종료되었습니다. 5초 후 재시작합니다..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}
```

## 프론트엔드 설정 업데이트

ngrok URL을 사용하려면 `.env.production` 파일의 `NEXT_PUBLIC_API_URL`을 업데이트해야 합니다:

```env
# ngrok URL 사용 시
NEXT_PUBLIC_API_URL=https://xxxx-xxxx-xxxx.ngrok-free.app/api/v1

# 또는 백엔드 전용 ngrok URL 사용
NEXT_PUBLIC_API_URL=https://backend-xxxx-xxxx-xxxx.ngrok-free.app
```

## 문제 해결

### ngrok이 시작되지 않는 경우
1. Docker 컨테이너가 실행 중인지 확인: `docker compose ps`
2. 포트 80이 사용 중인지 확인: `netstat -an | findstr ":80"`
3. ngrok 인증 확인: `ngrok config check`

### 터널 URL이 변경되는 경우
- 무료 플랜에서는 매번 새로운 URL이 생성됩니다
- 고정 URL이 필요하면 유료 플랜을 사용하세요

## 보안 주의사항

- ngrok 무료 플랜은 모든 요청이 공개적으로 로그에 기록됩니다
- 프로덕션 환경에서는 인증을 추가하거나 유료 플랜을 사용하세요
- 민감한 데이터를 다루는 경우 주의하세요
