# FastAPI 백엔드 설정 가이드

이 문서는 FastAPI 백엔드를 처음 설정하는 방법을 안내합니다.

## 사전 요구사항

1. **Python 3.11 이상** 설치
2. **PostgreSQL** 설치 및 실행
3. **uv** 설치 (선택사항, 빠른 패키지 관리자)

## 단계별 설정

### 1. uv 설치 (선택사항)

```powershell
pip install uv
```

### 2. 데이터베이스 설정

PostgreSQL이 실행 중이어야 합니다. 데이터베이스 생성 및 스키마 설정은 `database/sql/` 디렉토리의 SQL 스크립트를 참고하세요.

```powershell
# 데이터베이스 생성
psql -U postgres -c "CREATE DATABASE common_db WITH ENCODING 'UTF8';"

# DDL 실행
psql -U postgres -d common_db -f database\sql\ddl.sql

# DML 실행 (초기 데이터)
psql -U postgres -d common_db -f database\sql\dml.sql
```

### 3. 백엔드 의존성 설치

**방법 1: uv 가상 환경 사용 (권장)**

```powershell
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

### 4. 환경 변수 설정

`backend/.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/common_db
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
```

**SECRET_KEY 생성 방법 (PowerShell):**

```powershell
# 방법 1: 전용 스크립트 사용 (가장 쉬움)
python generate_secret_key.py

# 방법 2: Python 한 줄 명령어
python -c "import secrets; print(secrets.token_urlsafe(64))"

# 방법 3: PowerShell에서 직접 실행
python -c "import secrets; key = secrets.token_urlsafe(64); Write-Host \"SECRET_KEY=$key\""
```

생성된 SECRET_KEY를 `.env` 파일의 `SECRET_KEY=` 뒤에 붙여넣으세요.

### 5. 서버 실행

```powershell
# 방법 1: run.py 사용
python run.py

# 방법 2: uvicorn 직접 실행
uvicorn app.main:app --reload
```

### 6. 확인

브라우저에서 다음 URL을 열어 확인하세요:

- API 문서: http://localhost:8000/docs
- 헬스 체크: http://localhost:8000/api/v1/health

## 문제 해결

### 데이터베이스 연결 오류

- PostgreSQL이 실행 중인지 확인
- `DATABASE_URL`이 올바른지 확인
- 데이터베이스가 생성되었는지 확인

### 패키지 설치 오류

- Python 버전이 3.11 이상인지 확인
- 가상 환경을 사용하는 경우 활성화되었는지 확인

### 포트 충돌

- 다른 애플리케이션이 8000 포트를 사용 중인지 확인
- `.env` 파일에서 `PORT` 값을 변경

