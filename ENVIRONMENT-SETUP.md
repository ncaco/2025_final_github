# 환경별 설정 가이드

이 문서는 프로젝트의 로컬(local), 개발(dev), 프로덕션(production) 환경별 설정 방법을 설명합니다.

## 목차

1. [환경 개요](#환경-개요)
2. [로컬 환경 설정](#로컬-환경-설정)
3. [개발 환경 설정](#개발-환경-설정)
4. [프로덕션 환경 설정](#프로덕션-환경-설정)
5. [환경별 빌드 및 배포](#환경별-빌드-및-배포)
6. [보안 주의사항](#보안-주의사항)

## 환경 개요

### Local (로컬 개발 환경)
- **용도**: 개발자의 로컬 머신에서 개발 및 테스트
- **데이터베이스**: 로컬 PostgreSQL (포트 5432)
- **API 서버**: `http://localhost:8000`
- **프론트엔드**: `http://localhost:3000`
- **특징**: 디버그 모드 활성화, CORS 완전 개방

### Development (개발 서버 환경)
- **용도**: 개발 서버에서의 통합 테스트
- **데이터베이스**: Docker 컨테이너 내 PostgreSQL
- **API 서버**: `https://dev-api.yourdomain.com`
- **프론트엔드**: `https://dev.yourdomain.com`
- **특징**: 프로덕션과 유사하지만 디버그 모드 활성화

### Production (프로덕션 환경)
- **용도**: 실제 서비스 운영
- **데이터베이스**: Docker 컨테이너 내 PostgreSQL
- **API 서버**: `https://ncaco-api.duckdns.net`
- **프론트엔드**: `https://ncaco.duckdns.net`
- **특징**: 디버그 모드 비활성화, 보안 강화, SSL 필수

## 로컬 환경 설정

### 1. 환경 변수 파일 생성

각 디렉토리에서 예제 파일을 복사하여 실제 환경 변수 파일을 생성합니다:

```powershell
# Backend
cd backend
Copy-Item env.local.example env.local
# env.local 파일을 열어 실제 값으로 수정

# Frontend
cd ../frontend
Copy-Item env.local.example .env.local
# .env.local 파일을 열어 실제 값으로 수정

# Server (Docker)
cd ../server
Copy-Item env.local.example .env.local
# .env.local 파일을 열어 실제 값으로 수정
```

### 2. 로컬 데이터베이스 설정

로컬 PostgreSQL이 설치되어 있어야 합니다:

```powershell
# PostgreSQL 설치 확인
psql --version

# 데이터베이스 생성
psql -U postgres -c "CREATE DATABASE common_db;"
psql -U postgres -c "CREATE USER app_user WITH PASSWORD 'your_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE common_db TO app_user;"
```

### 3. Backend 실행

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

### 4. Frontend 실행

```powershell
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 5. 환경 변수 확인

**backend/env.local** 주요 설정:
- `DATABASE_URL`: 로컬 PostgreSQL 연결 정보
- `DEBUG=True`: 디버그 모드 활성화
- `CORS_ORIGINS`: 로컬 개발 서버 허용

**frontend/.env.local** 주요 설정:
- `NEXT_PUBLIC_API_URL=http://localhost:8000`: 로컬 백엔드 API

## 개발 환경 설정

### 1. 환경 변수 파일 생성

```powershell
# Backend
cd backend
Copy-Item env.dev.example .env.dev

# Frontend
cd ../frontend
Copy-Item env.dev.example .env.dev

# Server
cd ../server
Copy-Item env.dev.example .env.dev
```

### 2. Docker Compose로 배포

```powershell
cd server

# 개발 환경 배포
.\deploy-dev.ps1
# 또는
docker compose --env-file .env.dev up -d --build
```

### 3. 환경 변수 확인

**server/.env.dev** 주요 설정:
- `DEBUG=true`: 개발 모드 활성화
- `FRONTEND_DOMAIN`: 개발 서버 도메인
- `BACKEND_DOMAIN`: 개발 API 서버 도메인

## 프로덕션 환경 설정

### 1. 환경 변수 파일 생성

```powershell
cd server
Copy-Item env.production.example .env.production
# .env.production 파일을 열어 실제 값으로 수정
```

**중요**: 다음 항목을 반드시 변경하세요:
- `POSTGRES_PASSWORD`: 강력한 비밀번호로 변경
- `SECRET_KEY`: 최소 64자 이상의 랜덤 문자열로 변경
- `FRONTEND_DOMAIN`: 실제 도메인으로 변경
- `BACKEND_DOMAIN`: 실제 API 도메인으로 변경
- `CERTBOT_EMAIL`: 실제 이메일 주소로 변경

### 2. SECRET_KEY 생성

```powershell
# Python으로 강력한 시크릿 키 생성
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 3. 프로덕션 배포

```powershell
cd server

# 프로덕션 배포
.\deploy.ps1
# 또는
.\deploy-production.ps1
```

### 4. SSL 인증서 발급

```powershell
# Let's Encrypt 인증서 발급
.\setup-certbot.ps1
```

### 5. 환경 변수 확인

**server/.env.production** 주요 설정:
- `DEBUG=false`: 프로덕션 모드
- `SECRET_KEY`: 강력한 랜덤 문자열
- `CORS_ORIGINS`: 프로덕션 도메인만 허용

## 환경별 빌드 및 배포

### 로컬 환경

```powershell
# Backend만 실행
cd backend
python run.py

# Frontend만 실행
cd frontend
npm run dev

# 또는 Docker Compose 사용
cd server
.\deploy-local.ps1
```

### 개발 환경

```powershell
cd server
.\deploy-dev.ps1
```

### 프로덕션 환경

```powershell
cd server

# 전체 재빌드
.\deploy.ps1

# 빠른 재시작 (코드 변경만 있는 경우)
.\deploy.ps1 -Fast

# 증분 재빌드 (의존성 변경 있는 경우)
.\deploy.ps1 -Rebuild
```

## 보안 주의사항

### ⚠️ Git에 포함되지 않아야 하는 파일

다음 파일들은 **절대** Git에 커밋하지 마세요:

1. **환경 변수 파일** (실제 값 포함):
   - `.env`, `.env.local`, `.env.dev`, `.env.production`
   - `backend/env.local`, `backend/.env.*`
   - `frontend/.env.local`, `frontend/.env.*`
   - `server/.env.*`, `server/env.*`

2. **SSL 인증서 및 키**:
   - `*.pem`, `*.key`, `*.crt`
   - `server/nginx/ssl/`

3. **비밀 키 및 토큰**:
   - `*.secret`, `*.token`
   - DuckDNS 토큰 파일

4. **데이터베이스 덤프**:
   - `*.sql`, `*.dump`, `*.backup`

### ✅ Git에 포함되어야 하는 파일

다음 파일들은 Git에 포함되어야 합니다 (예제 파일):

- `*.example` 파일들
- `env.*.example` 파일들
- `.env.*.example` 파일들

### 보안 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 실제 비밀번호/키가 예제 파일에 포함되지 않았는지 확인
- [ ] 프로덕션 `SECRET_KEY`가 강력한 랜덤 문자열인지 확인
- [ ] 프로덕션 `DEBUG=false`로 설정되어 있는지 확인
- [ ] CORS 설정이 적절한 도메인만 허용하는지 확인
- [ ] SSL 인증서가 올바르게 설정되어 있는지 확인 (프로덕션)

### Git에서 실수로 커밋된 파일 제거

만약 실수로 중요한 파일을 커밋했다면:

```powershell
# Git에서 제거 (로컬 파일은 유지)
git rm --cached backend/env.local
git rm --cached server/.env.production

# .gitignore에 추가 확인
# 커밋
git commit -m "Remove sensitive files from git tracking"
```

## 환경별 설정 파일 구조

```
프로젝트 루트/
├── backend/
│   ├── env.local.example      # 로컬 환경 예제
│   ├── env.dev.example        # 개발 환경 예제
│   ├── env.production.example # 프로덕션 환경 예제
│   └── env.local              # 실제 로컬 환경 (gitignore)
│
├── frontend/
│   ├── env.local.example      # 로컬 환경 예제
│   ├── env.dev.example        # 개발 환경 예제
│   ├── env.production.example # 프로덕션 환경 예제
│   └── .env.local             # 실제 로컬 환경 (gitignore)
│
└── server/
    ├── env.local.example      # 로컬 환경 예제
    ├── env.dev.example        # 개발 환경 예제
    ├── env.production.example # 프로덕션 환경 예제
    ├── .env.local             # 실제 로컬 환경 (gitignore)
    └── .env.production        # 실제 프로덕션 환경 (gitignore)
```

## 문제 해결

### 환경 변수가 로드되지 않는 경우

1. 파일 이름 확인: `.env.local` vs `env.local`
2. 파일 위치 확인: 올바른 디렉토리에 있는지 확인
3. 애플리케이션 재시작: 환경 변수 변경 후 재시작 필요

### Git에 중요한 파일이 포함된 경우

```powershell
# Git 추적에서 제거
git rm --cached <파일경로>

# .gitignore 확인 및 업데이트
# 변경사항 커밋
git commit -m "Remove sensitive files"
```

## 추가 리소스

- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [Docker 배포 가이드](../server/README.md)
