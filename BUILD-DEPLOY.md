# 빌드 및 배포 가이드

이 문서는 프로젝트의 환경별 빌드 및 배포 방법을 설명합니다.

## 목차

1. [빌드 스크립트 개요](#빌드-스크립트-개요)
2. [로컬 환경 빌드](#로컬-환경-빌드)
3. [개발 환경 배포](#개발-환경-배포)
4. [프로덕션 환경 배포](#프로덕션-환경-배포)
5. [환경별 스크립트 비교](#환경별-스크립트-비교)

## 빌드 스크립트 개요

모든 배포 스크립트는 `server/` 디렉토리에 위치합니다:

```
server/
├── deploy-local.ps1      # 로컬 환경 배포
├── deploy-dev.ps1        # 개발 환경 배포
├── deploy-production.ps1 # 프로덕션 환경 배포
├── deploy.ps1            # 프로덕션 환경 배포 (기본)
├── start.ps1             # 컨테이너 시작
├── stop.ps1              # 컨테이너 중지
└── logs.ps1              # 로그 확인
```

## 로컬 환경 빌드

### Backend (로컬 실행)

```powershell
cd backend

# 가상 환경 생성 및 활성화
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate  # Linux/Mac

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
python run.py
# 또는
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (로컬 실행)

```powershell
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### Docker Compose (로컬)

```powershell
cd server

# 환경 변수 파일 생성
Copy-Item env.local.example .env.local
# .env.local 파일 수정

# 배포
.\deploy-local.ps1

# 옵션:
.\deploy-local.ps1 -Rebuild  # 재빌드
.\deploy-local.ps1 -Fast     # 빠른 재시작
```

## 개발 환경 배포

### 1. 환경 변수 설정

```powershell
cd server
Copy-Item env.dev.example .env.dev
# .env.dev 파일을 실제 값으로 수정
```

### 2. 배포 실행

```powershell
# 기본 배포
.\deploy-dev.ps1

# 옵션:
.\deploy-dev.ps1 -Rebuild  # 컨테이너 재빌드
.\deploy-dev.ps1 -Fast     # 빠른 재시작
```

### 3. 배포 확인

```powershell
# 컨테이너 상태 확인
docker compose --env-file .env.dev ps

# 로그 확인
docker compose --env-file .env.dev logs -f
```

## 프로덕션 환경 배포

### 1. 환경 변수 설정

```powershell
cd server
Copy-Item env.production.example .env.production
# .env.production 파일을 실제 값으로 수정
```

**중요 설정 항목:**
- `POSTGRES_PASSWORD`: 강력한 비밀번호
- `SECRET_KEY`: 최소 64자 이상의 랜덤 문자열
- `DEBUG=false`: 프로덕션 모드
- `FRONTEND_DOMAIN`: 실제 도메인
- `BACKEND_DOMAIN`: 실제 API 도메인

### 2. SECRET_KEY 생성

```powershell
# Python으로 강력한 시크릿 키 생성
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 3. 배포 실행

```powershell
# 전체 재빌드 (기본)
.\deploy.ps1

# 빠른 재시작 (코드 변경만 있는 경우)
.\deploy.ps1 -Fast

# 증분 재빌드 (의존성 변경 있는 경우)
.\deploy.ps1 -Rebuild
```

### 4. SSL 인증서 발급

```powershell
# Let's Encrypt 인증서 발급
.\setup-certbot.ps1
```

### 5. 배포 확인

```powershell
# 컨테이너 상태 확인
docker compose --env-file .env.production ps

# 로그 확인
.\logs.ps1
# 또는
docker compose --env-file .env.production logs -f
```

## 환경별 스크립트 비교

### deploy-local.ps1

**용도**: 로컬 개발 환경 (Docker Compose)

**환경 파일**: `.env.local`

**특징**:
- 로컬 개발에 최적화
- 빠른 재시작 지원
- 디버그 모드 활성화

**사용 예시**:
```powershell
.\deploy-local.ps1           # 기본 시작
.\deploy-local.ps1 -Fast     # 빠른 재시작
.\deploy-local.ps1 -Rebuild # 재빌드
```

### deploy-dev.ps1

**용도**: 개발 서버 환경

**환경 파일**: `.env.dev`

**특징**:
- 개발 서버 배포
- 프로덕션과 유사한 환경
- 디버그 모드 활성화

**사용 예시**:
```powershell
.\deploy-dev.ps1           # 기본 배포
.\deploy-dev.ps1 -Fast     # 빠른 재시작
.\deploy-dev.ps1 -Rebuild  # 재빌드
```

### deploy.ps1 / deploy-production.ps1

**용도**: 프로덕션 환경

**환경 파일**: `.env.production`

**특징**:
- 프로덕션 배포
- 보안 강화
- 디버그 모드 비활성화
- SSL 인증서 지원

**배포 모드**:

1. **전체 재빌드** (기본):
   ```powershell
   .\deploy.ps1
   ```
   - 캐시 무시하고 완전 재빌드
   - 환경 설정 변경 시 사용

2. **빠른 재시작** (`-Fast`):
   ```powershell
   .\deploy.ps1 -Fast
   ```
   - 컨테이너만 재시작
   - 코드 변경만 있는 경우 사용

3. **증분 재빌드** (`-Rebuild`):
   ```powershell
   .\deploy.ps1 -Rebuild
   ```
   - 캐시 활용하여 빌드
   - 의존성 변경 시 사용

## 공통 유틸리티 스크립트

### start.ps1

컨테이너 시작:

```powershell
.\start.ps1
```

### stop.ps1

컨테이너 중지:

```powershell
.\stop.ps1
```

### logs.ps1

로그 확인:

```powershell
.\logs.ps1
# 또는 특정 서비스만
docker compose --env-file .env.production logs -f backend
```

## 배포 체크리스트

### 배포 전 확인사항

- [ ] 환경 변수 파일이 올바르게 설정되었는지 확인
- [ ] `SECRET_KEY`가 강력한 랜덤 문자열인지 확인 (프로덕션)
- [ ] `DEBUG=false`로 설정되어 있는지 확인 (프로덕션)
- [ ] CORS 설정이 적절한 도메인만 허용하는지 확인
- [ ] 데이터베이스 연결 정보가 올바른지 확인
- [ ] 포트 포워딩이 올바르게 설정되었는지 확인 (프로덕션)

### 배포 후 확인사항

- [ ] 모든 컨테이너가 정상 실행 중인지 확인
- [ ] 프론트엔드 접속 가능한지 확인
- [ ] 백엔드 API 응답 확인
- [ ] 데이터베이스 연결 확인
- [ ] SSL 인증서가 올바르게 설정되었는지 확인 (프로덕션)
- [ ] 로그에 오류가 없는지 확인

## 문제 해결

### 컨테이너가 시작되지 않는 경우

```powershell
# 로그 확인
docker compose --env-file .env.production logs

# 컨테이너 상태 확인
docker compose --env-file .env.production ps -a

# 환경 변수 확인
docker compose --env-file .env.production config
```

### 포트 충돌 오류

```powershell
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :80
netstat -ano | findstr :443
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# 프로세스 종료 (PID 확인 후)
taskkill /PID <PID> /F
```

### 데이터베이스 연결 오류

```powershell
# PostgreSQL 컨테이너 확인
docker compose --env-file .env.production ps postgres

# 데이터베이스 연결 테스트
docker compose --env-file .env.production exec postgres psql -U app_user -d common_db
```

## 추가 리소스

- [환경 설정 가이드](./ENVIRONMENT-SETUP.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
