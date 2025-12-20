# 데이터베이스

이 디렉토리는 데이터베이스 스키마 설계 문서 및 마이그레이션 파일을 포함합니다.

## 기술 스택

- **PostgreSQL**: 관계형 데이터베이스 관리 시스템
- **공공데이터 공통표준7차 제·개정(2024.11월)**: 데이터베이스 설계 표준 참고

## 스키마 설계 원칙

1. **공공데이터 공통표준7차 제·개정(2024.11월)** 준수
2. 모든 테이블, 컬럼, 변수명은 **스네이크 케이스** 사용
3. 모든 영문은 **대문자** 사용
4. 정규화 원칙 준수
5. 적절한 인덱스 설정

## 명명 규칙

### 데이터베이스 명명 규칙
- **테이블명**: 스네이크 케이스 (예: `USER_PROFILE`, `ORDER_HISTORY`)
- **컬럼명**: 스네이크 케이스 (예: `USER_ID`, `CREATED_AT`)
- **변수명**: 스네이크 케이스 (예: `USER_NAME`, `TOTAL_AMOUNT`)
- **영문**: 모든 영문은 **대문자** 사용 (예: `USER_ID`, `CREATED_AT`)

### 예시

```sql
-- 테이블 생성 예시
CREATE TABLE USER_PROFILE (
    USER_ID SERIAL PRIMARY KEY,
    USER_NAME VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(255) UNIQUE NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 예시
CREATE INDEX IDX_USER_PROFILE_EMAIL ON USER_PROFILE(EMAIL);
```

## 데이터베이스 설정

### 1. PostgreSQL 설치

PostgreSQL이 설치되어 있지 않은 경우, [PostgreSQL 공식 사이트](https://www.postgresql.org/download/)에서 다운로드하여 설치하세요.

### 2. 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스를 생성합니다.

```powershell
# PostgreSQL 접속 (psql 사용)
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE dbname;

# 데이터베이스 선택
\c dbname
```

### 3. 환경 변수 설정

프로젝트 루트의 `.env` 파일에 데이터베이스 연결 정보를 설정합니다.

```env
# 데이터베이스 설정
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```

## 마이그레이션

데이터베이스 스키마 변경 시 마이그레이션 파일을 생성하고 적용합니다.

### Alembic 사용 예시

```powershell
# 마이그레이션 파일 생성
alembic revision --autogenerate -m "create user table"

# 마이그레이션 적용
alembic upgrade head

# 마이그레이션 롤백
alembic downgrade -1
```

### 마이그레이션 파일 구조

```
database/
├── migrations/
│   ├── versions/
│   │   ├── 001_create_user_table.py
│   │   └── 002_add_email_index.py
│   ├── env.py
│   └── script.py.mako
└── README.md
```

## 데이터베이스 연결

### 백엔드에서 PostgreSQL 연결

#### SQLAlchemy 사용 예시

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/dbname")

# 엔진 생성
engine = create_engine(DATABASE_URL, echo=True)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 베이스 클래스 생성
Base = declarative_base()

# 의존성 주입을 위한 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### FastAPI에서 사용 예시

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.get("/api/users")
async def get_users(db: Session = Depends(get_db)):
    # 데이터베이스 쿼리 수행
    users = db.query(User).all()
    return users
```

## 공공데이터 표준 참고

이 프로젝트는 **공공데이터 공통표준7차 제·개정(2024.11월)** 문서를 참고하여 데이터베이스를 설계합니다.

참고 문서: `공공데이터 공통표준7차 제·개정(2024.11월).xlsx`

### 주요 원칙

1. **표준화된 명명 규칙**: 공공데이터 표준에 따른 일관된 명명 규칙 적용
2. **데이터 타입 표준화**: 공공데이터 표준에 정의된 데이터 타입 사용
3. **메타데이터 관리**: 테이블 및 컬럼에 대한 설명과 메타데이터 관리

## 스키마 문서화

데이터베이스 스키마는 다음 형식으로 문서화합니다:

- **ERD**: Entity Relationship Diagram
- **테이블 정의서**: 각 테이블의 구조와 제약조건
- **데이터 사전**: 컬럼별 상세 설명

## 백업 및 복구

### 데이터베이스 백업

```powershell
# pg_dump를 사용한 백업
pg_dump -U username -d dbname -F c -f backup.dump

# SQL 형식으로 백업
pg_dump -U username -d dbname > backup.sql
```

### 데이터베이스 복구

```powershell
# 백업 파일로부터 복구
pg_restore -U username -d dbname -c backup.dump

# SQL 파일로부터 복구
psql -U username -d dbname < backup.sql
```

## 참고 자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [SQLAlchemy 공식 문서](https://docs.sqlalchemy.org/)
- [Alembic 공식 문서](https://alembic.sqlalchemy.org/)
- 공공데이터 공통표준7차 제·개정(2024.11월)

