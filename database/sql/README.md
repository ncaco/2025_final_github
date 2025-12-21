# SQL 스크립트 가이드

데이터베이스 스키마 생성 및 초기 데이터 삽입을 위한 SQL 스크립트입니다.

**데이터베이스**: PostgreSQL 12 이상

## 파일 구조

```
sql/
├── ddl.sql      # 데이터 정의 언어 (테이블 생성, 인덱스, 외래키)
├── dml.sql      # 데이터 조작 언어 (초기 데이터 삽입)
├── dcl.sql      # 데이터 제어 언어 (사용자 권한 관리)
└── README.md    # 이 파일
```

## 실행 순서

### Windows 환경 설정 (필요시)

PostgreSQL이 설치되어 있지만 `psql` 명령어가 인식되지 않는 경우:

**방법 1: 현재 세션에서 PATH 추가**
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

**방법 2: 전체 경로로 실행**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE common_db WITH ENCODING 'UTF8';"
```

**방법 3: 영구적으로 PATH 추가**
1. 시스템 환경 변수 편집
2. `Path` 변수에 `C:\Program Files\PostgreSQL\18\bin` 추가
3. PowerShell 재시작

### 1. 데이터베이스 생성
PostgreSQL에서 데이터베이스를 먼저 생성합니다.

**Linux/Mac:**
```bash
psql -U postgres -c "CREATE DATABASE common_db WITH ENCODING 'UTF8' LC_COLLATE='ko_KR.UTF-8' LC_CTYPE='ko_KR.UTF-8' TEMPLATE template0;"
```

**Windows (PATH 설정 후):**
```powershell
psql -U postgres -c "CREATE DATABASE common_db WITH ENCODING 'UTF8';"
```

**Windows (전체 경로):**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE common_db WITH ENCODING 'UTF8';"
```

또는 psql에서:

```sql
CREATE DATABASE common_db
    WITH ENCODING 'UTF8'
    LC_COLLATE='ko_KR.UTF-8'
    LC_CTYPE='ko_KR.UTF-8'
    TEMPLATE template0;
```

### 2. DDL 실행 (필수)
테이블 구조를 생성합니다.

**Linux/Mac:**
```bash
psql -U postgres -d common_db -f ddl.sql
```

**Windows (PATH 설정 후):**
```powershell
psql -U postgres -d common_db -f database\sql\ddl.sql
```

**Windows (전체 경로):**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d common_db -f database\sql\ddl.sql
```

**또는 psql에서:**
```sql
\c common_db
\i database/sql/ddl.sql
```

### 3. DML 실행 (선택)
초기 데이터(시드 데이터)를 삽입합니다.

**Linux/Mac:**
```bash
psql -U postgres -d common_db -f dml.sql
```

**Windows:**
```powershell
psql -U postgres -d common_db -f database\sql\dml.sql
```

**또는 psql에서:**
```sql
\c common_db
\i database/sql/dml.sql
```

### 4. DCL 실행 (선택)
데이터베이스 사용자 및 권한을 설정합니다.

**Linux/Mac:**
```bash
psql -U postgres -d common_db -f dcl.sql
```

**Windows:**
```powershell
psql -U postgres -d common_db -f database\sql\dcl.sql
```

**또는 psql에서:**
```sql
\c common_db
\i database/sql/dcl.sql
```

## 파일별 상세 설명

### ddl.sql
- **목적**: 데이터베이스 스키마 정의
- **내용**:
  - 10개 테이블 생성
  - Primary Key, Unique Key, Index 설정
  - Foreign Key 제약조건 설정
  - UPD_DT 자동 업데이트 트리거 함수 생성
- **주의사항**:
  - 외래키 제약조건으로 인해 테이블 생성 순서가 중요합니다.
  - `COMMON_USER` 테이블이 먼저 생성되어야 합니다.
  - `SERIAL` 타입은 자동으로 시퀀스를 생성합니다.
  - `ON UPDATE CURRENT_TIMESTAMP`는 트리거로 구현되었습니다.

### dml.sql
- **목적**: 초기 데이터 삽입
- **내용**:
  - 역할 데이터 (ADMIN, USER, MODERATOR)
  - 권한 데이터 (사용자, 파일, 관리자, 역할 관련 권한)
  - 역할-권한 매핑 데이터
  - 초기 사용자 계정 (관리자, 테스트 사용자)
  - 사용자-역할 매핑 데이터
  - 다국어 리소스 데이터 (한국어, 영어)
- **주의사항**:
  - 비밀번호는 예시 해시값입니다. 실제 운영 환경에서는 반드시 변경하세요.
  - `ON CONFLICT ... DO UPDATE`를 사용하여 중복 실행 시에도 안전합니다.
  - `TRUE`/`FALSE`는 PostgreSQL의 BOOLEAN 타입입니다.

### dcl.sql
- **목적**: 데이터베이스 사용자 및 권한 관리
- **내용**:
  - 애플리케이션 사용자 생성 (`app_user`)
  - 읽기 전용 사용자 생성 (`readonly_user`)
  - 백업 사용자 생성 (`backup_user`)
  - 개발자 사용자 생성 (`dev_user`)
- **주의사항**:
  - 비밀번호는 예시입니다. 실제 운영 환경에서는 강력한 비밀번호를 사용하세요.
  - 최소 권한 원칙을 따르세요.
  - 운영 환경에서는 불필요한 사용자를 삭제하세요.
  - `pg_hba.conf` 파일에서 접근 제어를 설정해야 합니다.
  - PostgreSQL은 권한 변경이 즉시 적용되므로 `FLUSH PRIVILEGES`가 필요 없습니다.

## 초기 계정 정보

### 관리자 계정
- **USER_ID**: `ADMIN_001`
- **이메일**: `admin@example.com`
- **사용자명**: `admin`
- **비밀번호**: `admin123!` (예시 - 실제로는 해시화되어 저장)
- **역할**: ADMIN (모든 권한)

### 테스트 사용자 계정
- **USER_ID**: `USER_001`
- **이메일**: `user@example.com`
- **사용자명**: `user`
- **비밀번호**: `user123!` (예시 - 실제로는 해시화되어 저장)
- **역할**: USER (기본 권한)

**⚠️ 중요**: 초기 계정의 비밀번호는 첫 로그인 시 반드시 변경하세요!

## 데이터베이스 사용자 계정

### app_user
- **용도**: 애플리케이션에서 사용
- **권한**: SELECT, INSERT, UPDATE, DELETE
- **접근**: 모든 호스트 (`%`), localhost

### readonly_user
- **용도**: 리포트, 분석 등 읽기 전용 작업
- **권한**: SELECT만
- **접근**: 모든 호스트 (`%`), localhost

### backup_user
- **용도**: 데이터베이스 백업 작업
- **권한**: SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER
- **접근**: localhost만

### dev_user
- **용도**: 개발 환경에서 사용
- **권한**: 모든 권한 (ALL PRIVILEGES)
- **접근**: localhost만
- **주의**: 개발 환경 전용, 운영 환경에서는 사용하지 마세요.

## 스크립트 실행 예시

### 전체 스크립트 실행
```bash
# 1. 데이터베이스 생성
psql -U postgres -c "CREATE DATABASE common_db WITH ENCODING 'UTF8';"

# 2. DDL 실행
psql -U postgres -d common_db -f ddl.sql

# 3. DML 실행
psql -U postgres -d common_db -f dml.sql

# 4. DCL 실행
psql -U postgres -d common_db -f dcl.sql
```

### psql 클라이언트에서 실행
```sql
-- 데이터베이스 연결
\c common_db

-- DDL 실행
\i ddl.sql

-- DML 실행
\i dml.sql

-- DCL 실행
\i dcl.sql
```

### 환경 변수 사용
```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=your_password
export PGDATABASE=common_db

psql -f ddl.sql
psql -f dml.sql
psql -f dcl.sql
```

## 롤백 방법

### 테이블 삭제
```sql
\c common_db

-- 외래키 제약조건 때문에 역순으로 삭제
DROP TABLE IF EXISTS COMMON_LOCALE CASCADE;
DROP TABLE IF EXISTS COMMON_FILE CASCADE;
DROP TABLE IF EXISTS COMMON_AUDIT_LOG CASCADE;
DROP TABLE IF EXISTS COMMON_REFRESH_TOKEN CASCADE;
DROP TABLE IF EXISTS COMMON_USER_ROLE CASCADE;
DROP TABLE IF EXISTS COMMON_ROLE_PERMISSION CASCADE;
DROP TABLE IF EXISTS COMMON_PERMISSION CASCADE;
DROP TABLE IF EXISTS COMMON_ROLE CASCADE;
DROP TABLE IF EXISTS COMMON_OAUTH_ACCOUNT CASCADE;
DROP TABLE IF EXISTS COMMON_USER CASCADE;

-- 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

### 데이터베이스 삭제
```sql
-- 다른 세션에서 연결이 없어야 함
\c postgres
DROP DATABASE IF EXISTS common_db;
```

### 사용자 삭제
```sql
DROP USER IF EXISTS app_user;
DROP USER IF EXISTS readonly_user;
DROP USER IF EXISTS backup_user;
DROP USER IF EXISTS dev_user;
```

## 주의사항

1. **운영 환경**: 
   - 초기 계정 비밀번호를 반드시 변경하세요.
   - 불필요한 사용자 계정을 삭제하세요.
   - 강력한 비밀번호 정책을 적용하세요.

2. **보안**:
   - `pg_hba.conf` 파일에서 접근 제어를 설정하세요.
   - 데이터베이스 접근은 방화벽으로 제한하세요.
   - SSL/TLS 연결을 사용하세요 (`sslmode=require`).
   - 정기적으로 사용자 권한을 검토하세요.

3. **백업**:
   - 스크립트 실행 전에 기존 데이터베이스를 백업하세요.
   - `pg_dump`를 사용하여 정기적인 백업 스케줄을 설정하세요.
   ```bash
   pg_dump -U postgres -d common_db > backup.sql
   ```

4. **성능**:
   - 대용량 데이터 삽입 시 배치 처리를 고려하세요.
   - 인덱스는 데이터 삽입 후 생성하는 것이 더 빠를 수 있습니다.
   - `VACUUM ANALYZE`를 정기적으로 실행하세요.

5. **PostgreSQL 특성**:
   - `SERIAL` 타입은 자동으로 시퀀스를 생성합니다.
   - `ON UPDATE CURRENT_TIMESTAMP`는 트리거로 구현되었습니다.
   - `JSON` 타입은 `JSONB`로 사용하는 것이 성능상 유리합니다.

## 문제 해결

### 외래키 제약조건 오류
- 테이블 생성 순서를 확인하세요.
- `COMMON_USER` 테이블이 먼저 생성되어야 합니다.
- `CASCADE` 옵션을 사용하여 관련 객체를 함께 삭제할 수 있습니다.

### 중복 키 오류
- DML 스크립트는 `ON CONFLICT ... DO UPDATE`를 사용하므로 중복 실행이 가능합니다.
- DDL 스크립트는 `IF NOT EXISTS`를 사용하므로 중복 실행이 가능합니다.

### 권한 오류
- DCL 스크립트는 `postgres` 슈퍼유저 권한으로 실행해야 합니다.
- PostgreSQL은 권한 변경이 즉시 적용되므로 `FLUSH PRIVILEGES`가 필요 없습니다.

### 연결 오류
- `pg_hba.conf` 파일에서 접근 권한을 확인하세요.
- 데이터베이스가 실행 중인지 확인하세요: `pg_isready`
- 포트가 올바른지 확인하세요 (기본값: 5432)

### 시퀀스 오류
- `SERIAL` 타입 사용 시 자동으로 시퀀스가 생성됩니다.
- 시퀀스 권한이 부여되었는지 확인하세요.

## 추가 리소스

- 논리적 설계: [../02_logical_design.md](../02_logical_design.md)
- 물리적 설계: [../04_physical_design.md](../04_physical_design.md)
- 데이터베이스 설계 원칙: [../README.md](../README.md)

