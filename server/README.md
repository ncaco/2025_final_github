# 프로덕션 서버 배포 가이드

이 디렉토리는 Docker Compose를 사용하여 Next.js, FastAPI, PostgreSQL을 컨테이너화하고, Nginx 리버스 프록시를 통해 DDNS 도메인과 Let's Encrypt SSL 인증서를 적용한 프로덕션 서버 환경을 구축합니다.

## 아키텍처

```
인터넷 → DDNS → 라우터 포트 포워딩 → Nginx (SSL 종료) → Frontend/Backend → PostgreSQL
```

## 사전 요구사항

1. **Docker Desktop** 설치 (Windows)
   - https://www.docker.com/products/docker-desktop 에서 다운로드
   - WSL 2 백엔드 사용 권장

2. **DDNS 도메인** 등록
   - DuckDNS (https://www.duckdns.org/) - 무료
   - No-IP (https://www.noip.com/) - 무료/유료
   - 기타 DDNS 서비스

3. **라우터 포트 포워딩** 설정
   - 외부 포트 80 → 노트북 IP:80
   - 외부 포트 443 → 노트북 IP:443

4. **Windows 방화벽** 설정
   - 포트 80 (HTTP) 허용
   - 포트 443 (HTTPS) 허용

## 설치 및 배포

### 1. 환경 변수 설정

`env.production.example` 파일을 복사하여 `.env.production` 파일을 생성하세요:

```powershell
Copy-Item env.production.example .env.production
```

`.env.production` 파일을 열어 다음 값들을 실제 값으로 변경하세요:

- `POSTGRES_PASSWORD`: 강력한 데이터베이스 비밀번호
- `SECRET_KEY`: 최소 32자 이상의 랜덤 문자열 (JWT 서명용)
- `CORS_ORIGINS`: 프론트엔드 도메인 (예: `https://yourdomain.ddns.net`)
- `NEXT_PUBLIC_API_URL`: 백엔드 API 도메인 (예: `https://api.yourdomain.ddns.net`)
- `FRONTEND_DOMAIN`: 프론트엔드 DDNS 도메인
- `BACKEND_DOMAIN`: 백엔드 API DDNS 도메인
- `CERTBOT_EMAIL`: Let's Encrypt 인증서 만료 알림용 이메일

### 2. Nginx 설정 파일 수정

`nginx/conf.d/default.conf` 파일을 열어 도메인을 실제 DDNS 도메인으로 변경하세요:

```nginx
# 프론트엔드 도메인 변경
server_name yourdomain.ddns.net;

# 백엔드 API 도메인 변경
server_name api.yourdomain.ddns.net;
```

### 3. 초기 배포

```powershell
# 배포 스크립트 실행
.\deploy.ps1
```

또는 수동으로:

```powershell
# Docker 이미지 빌드 및 컨테이너 시작
docker compose up -d --build
```

### 4. Let's Encrypt 인증서 발급

초기 배포 후 인증서를 발급받아야 합니다:

**방법 1: 자동 스크립트 사용 (권장)**

```powershell
# .env.production 파일에 도메인 정보가 설정되어 있는 경우
.\setup-certbot.ps1

# 또는 직접 도메인 지정
.\setup-certbot.ps1 -FrontendDomain "yourdomain.ddns.net" -BackendDomain "api.yourdomain.ddns.net" -Email "your-email@example.com"
```

**방법 2: 수동 명령 실행**

```powershell
# 인증서 발급 (도메인을 실제 도메인으로 변경)
docker compose exec certbot certbot certonly --webroot \
  -w /var/www/certbot \
  -d yourdomain.ddns.net \
  -d api.yourdomain.ddns.net \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

인증서 발급 후:
1. `nginx/conf.d/default.conf` 파일에서 HTTP 리다이렉트 주석을 해제하세요
2. Nginx 컨테이너를 재시작하세요:

```powershell
docker compose restart nginx
```

## 서비스 관리

### 서비스 시작

```powershell
.\start.ps1
```

또는:

```powershell
docker compose up -d
```

### 서비스 중지

```powershell
.\stop.ps1
```

또는:

```powershell
docker compose down
```

### 로그 확인

모든 서비스 로그:

```powershell
.\logs.ps1
```

특정 서비스 로그:

```powershell
.\logs.ps1 backend
.\logs.ps1 frontend
.\logs.ps1 nginx
.\logs.ps1 postgres
```

또는:

```powershell
docker compose logs -f [서비스명]
```

## 서비스 접속

배포 완료 후 다음 URL로 접속할 수 있습니다:

- **프론트엔드**: https://yourdomain.ddns.net
- **백엔드 API**: https://api.yourdomain.ddns.net
- **API 문서**: https://api.yourdomain.ddns.net/docs

## 문제 해결

### 포트가 이미 사용 중인 경우

다른 애플리케이션이 포트를 사용 중일 수 있습니다:

```powershell
# 포트 사용 확인
netstat -ano | findstr :80
netstat -ano | findstr :443

# 프로세스 종료 (PID는 netstat 결과에서 확인)
taskkill /PID [PID] /F
```

### 인증서 발급 실패

1. **도메인이 올바르게 설정되었는지 확인**
   - DDNS 서비스에서 IP가 올바르게 업데이트되었는지 확인
   - 라우터 포트 포워딩이 올바르게 설정되었는지 확인

2. **방화벽 확인**
   - Windows 방화벽에서 포트 80, 443이 열려있는지 확인

3. **인증서 재발급**
   ```powershell
   docker compose exec certbot certbot renew --force-renewal
   ```

### 데이터베이스 연결 오류

1. **컨테이너 상태 확인**
   ```powershell
   docker compose ps
   ```

2. **데이터베이스 로그 확인**
   ```powershell
   docker compose logs postgres
   ```

3. **환경 변수 확인**
   - `.env.production` 파일의 `DATABASE_URL`이 올바른지 확인
   - `POSTGRES_PASSWORD`가 올바르게 설정되었는지 확인

### 프론트엔드가 백엔드에 연결되지 않는 경우

1. **환경 변수 확인**
   - `NEXT_PUBLIC_API_URL`이 올바른 백엔드 도메인으로 설정되었는지 확인
   - HTTPS를 사용하는지 확인

2. **CORS 설정 확인**
   - 백엔드의 `CORS_ORIGINS`에 프론트엔드 도메인이 포함되어 있는지 확인

## 보안 고려사항

1. **환경 변수 보안**
   - `.env.production` 파일은 절대 Git에 커밋하지 마세요
   - `.gitignore`에 추가되어 있는지 확인하세요

2. **비밀번호 강도**
   - `POSTGRES_PASSWORD`와 `SECRET_KEY`는 충분히 강력한 값을 사용하세요
   - 최소 32자 이상의 랜덤 문자열을 권장합니다

3. **SSL/TLS**
   - 모든 통신은 HTTPS로 암호화됩니다
   - Let's Encrypt 인증서는 90일마다 자동 갱신됩니다

4. **방화벽**
   - 필요한 포트만 열어두세요
   - 불필요한 포트는 닫아두세요

## 인증서 자동 갱신

Certbot 컨테이너가 자동으로 인증서를 갱신합니다. 매일 12시간마다 갱신을 확인하며, 만료 30일 전에 자동으로 갱신합니다.

수동으로 갱신하려면:

```powershell
docker compose exec certbot certbot renew
```

## 데이터 백업

PostgreSQL 데이터는 Docker 볼륨에 저장됩니다. 백업하려면:

```powershell
# 데이터베이스 백업
docker compose exec postgres pg_dump -U postgres common_db > backup.sql

# 데이터베이스 복원
docker compose exec -T postgres psql -U postgres common_db < backup.sql
```

## 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Let's Encrypt 공식 문서](https://letsencrypt.org/docs/)
- [DuckDNS 공식 문서](https://www.duckdns.org/)
