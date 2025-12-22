# 백엔드

FastAPI 기반 백엔드 API 서버입니다.

## 기술 스택

- **FastAPI**: 고성능 Python 웹 프레임워크
- **Python**: 백엔드 개발 언어 (v3.11 이상 권장)
- **uv**: 빠른 Python 패키지 관리자 (의존성 관리)
- **RESTful API**: 표준 REST API 설계 원칙 준수

## 사전 요구사항

- **Python** (v3.11 이상 권장)
- **uv** (Python 패키지 관리자)
- **PostgreSQL** (데이터베이스)

### uv 설치

```powershell
# Windows PowerShell
pip install uv
```

## 설치 및 실행

### 1. 의존성 설치

**방법 1: uv 가상 환경 사용 (권장)**

```powershell
# 백엔드 디렉토리로 이동
cd backend

# 가상 환경 생성
uv venv

# 가상 환경 활성화 (PowerShell)
.venv\Scripts\Activate.ps1

# 의존성 설치
uv pip install -r requirements.txt
```

**방법 2: uv 시스템 설치**

```powershell
cd backend

# 시스템에 직접 설치 (가상 환경 없이)
uv pip install -r requirements.txt --system
```

**방법 3: 일반 pip 사용**

```powershell
cd backend

# 가상 환경 생성 (선택사항)
python -m venv venv

# 가상 환경 활성화 (PowerShell)
venv\Scripts\Activate.ps1

# 의존성 설치
pip install -r requirements.txt
```

**참고**: PowerShell에서 스크립트 실행 정책 오류가 발생하면:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 2. 환경 변수 설정

`backend` 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 데이터베이스 설정
DATABASE_URL=postgresql://postgres:password@localhost:5432/common_db

# 애플리케이션 설정
APP_NAME=2026 Challenge API
APP_VERSION=1.0.0
DEBUG=True

# 서버 설정
HOST=0.0.0.0
PORT=8000

# 보안 설정
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS 설정
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

**주의**: `SECRET_KEY`는 프로덕션 환경에서 반드시 강력한 랜덤 문자열로 변경하세요.

### 3. 데이터베이스 설정

데이터베이스 설정은 [database/README.md](../database/README.md)를 참고하세요.

### 4. 서버 실행

**방법 1: run.py 사용 (권장)**
```powershell
cd backend
python run.py
```

**방법 2: uvicorn 직접 실행**
```powershell
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**방법 3: 프로젝트 루트에서 실행**
```powershell
cd ./backend; python run.py
```

### 5. 접속

서버가 실행되면 다음 URL에서 접속할 수 있습니다:

- **백엔드 API**: http://localhost:8000
- **API 문서 (Swagger UI)**: http://localhost:8000/docs
- **API 문서 (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health
- **루트**: http://localhost:8000/

### 6. API 엔드포인트

#### 인증 (Auth)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/refresh` - 토큰 갱신

#### 사용자 (Users)
- `GET /api/v1/users/me` - 현재 사용자 정보 조회
- `GET /api/v1/users` - 사용자 목록 조회
- `GET /api/v1/users/{user_id}` - 사용자 상세 조회
- `PUT /api/v1/users/{user_id}` - 사용자 정보 수정
- `DELETE /api/v1/users/{user_id}` - 사용자 삭제 (소프트 삭제)

## 프로젝트 구조

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 애플리케이션 진입점
│   ├── database.py          # 데이터베이스 연결
│   ├── dependencies.py      # 의존성 주입
│   ├── api/                 # API 라우터
│   │   ├── __init__.py
│   │   └── v1/              # API 버전 1
│   │       ├── __init__.py
│   │       ├── router.py    # 라우터 통합
│   │       └── endpoints/   # 엔드포인트
│   │           ├── __init__.py
│   │           ├── auth.py  # 인증 엔드포인트
│   │           ├── users.py # 사용자 엔드포인트
│   │           └── health.py # 헬스 체크
│   ├── core/                # 핵심 설정
│   │   ├── __init__.py
│   │   ├── config.py        # 설정 파일
│   │   └── security.py      # 보안 관련
│   ├── models/              # 데이터베이스 모델 (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── base.py          # 기본 모델
│   │   ├── user.py          # 사용자 모델
│   │   ├── role.py          # 역할 모델
│   │   ├── permission.py    # 권한 모델
│   │   └── ...              # 기타 모델들
│   └── schemas/             # Pydantic 스키마
│       ├── __init__.py
│       ├── user.py          # 사용자 스키마
│       ├── auth.py          # 인증 스키마
│       ├── role.py          # 역할 스키마
│       └── permission.py    # 권한 스키마
├── tests/                   # 테스트 파일
├── .env                     # 환경 변수 (생성 필요)
├── .gitignore              # Git 무시 파일
├── requirements.txt         # Python 의존성
├── pyproject.toml           # 프로젝트 설정
├── run.py                   # 서버 실행 스크립트
└── README.md
```

## 코딩 컨벤션

### Python 명명 규칙

- **함수명**: 스네이크 케이스 (예: `get_user_data`, `calculate_profit`)
- **클래스명**: 파스칼 케이스 (예: `UserService`, `StockCalculator`)
- **변수명**: 스네이크 케이스 (예: `user_name`, `total_amount`)
- **상수**: 대문자 스네이크 케이스 (예: `MAX_RETRY_COUNT`, `API_BASE_URL`)
- **모듈명**: 소문자 스네이크 케이스 (예: `user_service.py`, `api_client.py`)

### 코드 스타일 예시

```python
# 함수 예시
from typing import Optional
from pydantic import BaseModel

class UserResponse(BaseModel):
    user_id: int
    user_name: str
    email: str

def get_user_by_id(user_id: int) -> Optional[UserResponse]:
    """사용자 ID로 사용자 정보 조회"""
    # 구현 코드
    pass

# 클래스 예시
class UserService:
    def __init__(self, db_session):
        self.db = db_session
    
    def create_user(self, user_data: dict) -> UserResponse:
        """새 사용자 생성"""
        # 구현 코드
        pass
```

## API 문서

FastAPI는 자동으로 Swagger UI와 ReDoc을 제공합니다.

### Swagger UI

- URL: http://localhost:8000/docs
- 인터랙티브 API 문서 및 테스트 인터페이스

### ReDoc

- URL: http://localhost:8000/redoc
- 읽기 전용 API 문서

### API 엔드포인트 예시

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="2026 Challenge API",
    description="2026 챌린지 프로젝트 API",
    version="1.0.0"
)

class HealthResponse(BaseModel):
    status: str
    message: str

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "ok",
        "message": "Server is running"
    }

@app.get("/api/users/{user_id}")
async def get_user(user_id: int):
    """사용자 정보 조회"""
    # 구현 코드
    pass
```

## 데이터베이스 연결

SQLAlchemy를 사용한 데이터베이스 연결 예시:

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/dbname")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """의존성 주입을 위한 데이터베이스 세션"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

FastAPI에서 사용:

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.get("/api/users")
async def get_users(db: Session = Depends(get_db)):
    """모든 사용자 조회"""
    users = db.query(User).all()
    return users
```

## 환경 변수

환경 변수는 `.env` 파일에 정의하거나 시스템 환경 변수로 설정할 수 있습니다.

```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    backend_port: int = 8000
    backend_host: str = "localhost"
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 의존성 관리

### requirements.txt 사용

```powershell
# 의존성 설치
uv pip install -r requirements.txt

# 의존성 추가
uv pip install package-name
uv pip freeze > requirements.txt
```

### pyproject.toml 사용 (권장)

```toml
[project]
name = "backend"
version = "1.0.0"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy>=2.0.0",
    "pydantic>=2.0.0",
    "pydantic-settings>=2.0.0",
]
```

```powershell
# 의존성 설치
uv pip install -e .
```

## 테스트

```powershell
# pytest 사용 예시
pytest tests/

# 특정 테스트 실행
pytest tests/test_users.py

# 커버리지 확인
pytest --cov=app tests/
```

## 배포

### 프로덕션 실행

```powershell
# 프로덕션 모드로 실행 (리로드 없음)
uvicorn main:app --host 0.0.0.0 --port 8000

# 또는 gunicorn 사용
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker 사용

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# uv 설치
RUN pip install uv

# 의존성 설치
COPY requirements.txt .
RUN uv pip install -r requirements.txt

# 애플리케이션 복사
COPY . .

# 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [Python 공식 문서](https://docs.python.org/)
- [uv 공식 문서](https://github.com/astral-sh/uv)
- [SQLAlchemy 공식 문서](https://docs.sqlalchemy.org/)
- [Pydantic 공식 문서](https://docs.pydantic.dev/)

