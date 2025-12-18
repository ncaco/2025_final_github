## 데이터베이스 구조 (PostgreSQL + Prisma 기준)

이 문서는 프로젝트의 **단일 진실 소스(Single Source of Truth)** 로서 DB 스키마를 정의합니다.  
실제 구현은 `frontend/prisma/schema.prisma` 를 기준으로 하며, 스키마 변경 시 반드시 이 문서를 함께 업데이트합니다.

---

### 1. 기본 설정

- **DBMS**: PostgreSQL
- **접속 문자열 환경 변수**: `DATABASE_URL`
- **타임존 전략**: 모든 시간 필드는 UTC 기준 `TIMESTAMP WITH TIME ZONE` 으로 저장하고, 애플리케이션 레벨에서 타임존 변환

---

### 2. User 및 인증 관련 테이블

NextAuth.js(현 Auth.js) + Prisma 공식 스키마를 기반으로 하되, 관리자 대시보드에 필요한 최소 필드만 우선 정의합니다.

#### 2.1 `users` 테이블

- **설명**: 관리자/일반 사용자를 포함한 모든 로그인 가능한 사용자 계정

| 컬럼명      | 타입                      | 제약 조건                                 | 설명                                   |
|------------|---------------------------|-------------------------------------------|----------------------------------------|
| id         | `UUID`                    | PK, 기본값 `gen_random_uuid()`           | 사용자 ID                              |
| name       | `VARCHAR(255)`           | NULL 허용                                 | 표시 이름                              |
| email      | `VARCHAR(320)`           | UNIQUE, NOT NULL                          | 이메일(로그인 ID)                     |
| email_verified | `TIMESTAMPTZ`        | NULL 허용                                 | 이메일 인증 시각                       |
| image      | `TEXT`                    | NULL 허용                                 | 프로필 이미지 URL                      |
| role       | `VARCHAR(32)`            | NOT NULL, 기본값 `'VIEWER'`              | 권한 역할 (`ADMIN`, `MANAGER`, `VIEWER` 등) |
| status     | `VARCHAR(32)`            | NOT NULL, 기본값 `'ACTIVE'`              | 계정 상태 (`ACTIVE`, `INACTIVE`, `SUSPENDED` 등) |
| hashed_password | `TEXT`              | NULL 허용                                 | Credential 로그인용 해시 비밀번호      |
| created_at | `TIMESTAMPTZ`            | NOT NULL, 기본값 `NOW()`                 | 생성 시각                              |
| updated_at | `TIMESTAMPTZ`            | NOT NULL, 기본값 `NOW()`                 | 수정 시각(트리거/애플리케이션에서 관리) |

#### 2.2 `accounts` 테이블 (OAuth / 외부 계정 연동)

- **설명**: Google 등 외부 OAuth 제공자 계정과 `users` 매핑

| 컬럼명       | 타입            | 제약 조건                    | 설명                                   |
|-------------|-----------------|------------------------------|----------------------------------------|
| id          | `BIGSERIAL`     | PK                           | 계정 레코드 ID                         |
| user_id     | `UUID`          | FK → `users(id)`, NOT NULL   | 소유 사용자 ID                         |
| type        | `VARCHAR(255)` | NOT NULL                     | 계정 유형 (`oauth`, `credentials` 등) |
| provider    | `VARCHAR(255)` | NOT NULL                     | 제공자 ID (`google`, `github` 등)     |
| provider_account_id | `VARCHAR(255)` | NOT NULL, UNIQUE 조합 (`provider`, `provider_account_id`) | 제공자 내 계정 식별자 |
| refresh_token | `TEXT`        | NULL 허용                    | 리프레시 토큰                          |
| access_token  | `TEXT`        | NULL 허용                    | 접근 토큰                              |
| expires_at    | `BIGINT`      | NULL 허용                    | 만료 시각(Epoch seconds)              |
| token_type    | `VARCHAR(255)` | NULL 허용                   | 토큰 타입                              |
| scope         | `TEXT`        | NULL 허용                    | OAuth scope                            |
| id_token      | `TEXT`        | NULL 허용                    | ID 토큰                                |
| session_state | `TEXT`        | NULL 허용                    | 세션 상태                              |

#### 2.3 `sessions` 테이블

- **설명**: 세션 기반 인증을 사용하는 경우(쿠키/DB 세션) 세션 정보를 저장

| 컬럼명      | 타입            | 제약 조건                        | 설명                       |
|------------|-----------------|----------------------------------|----------------------------|
| id         | `BIGSERIAL`     | PK                               | 세션 레코드 ID            |
| session_token | `VARCHAR(255)` | UNIQUE, NOT NULL               | 세션 토큰                 |
| user_id    | `UUID`          | FK → `users(id)`, NOT NULL       | 사용자 ID                  |
| expires    | `TIMESTAMPTZ`   | NOT NULL                         | 세션 만료 시각            |
| created_at | `TIMESTAMPTZ`   | NOT NULL, 기본값 `NOW()`         | 생성 시각                  |

#### 2.4 `verification_tokens` 테이블

- **설명**: 이메일 인증 / 비밀번호 재설정 등에서 사용되는 1회성 토큰

| 컬럼명      | 타입            | 제약 조건                        | 설명                                   |
|------------|-----------------|----------------------------------|----------------------------------------|
| identifier | `VARCHAR(255)` | NOT NULL                         | 이메일 또는 기타 식별자               |
| token      | `VARCHAR(255)` | NOT NULL, UNIQUE                 | 토큰 값                               |
| expires    | `TIMESTAMPTZ`   | NOT NULL                         | 만료 시각                              |

- PK 제약:
  - 복합 기본 키 `(identifier, token)`

---

### 3. 인덱스 및 제약 정리

- `users_email_unique` : `users(email)` UNIQUE
- `accounts_provider_providerAccountId_unique` : `accounts(provider, provider_account_id)` UNIQUE
- `sessions_sessionToken_unique` : `sessions(session_token)` UNIQUE
- `verification_tokens_token_unique` : `verification_tokens(token)` UNIQUE
- `users_role_idx` : `users(role)` 일반 인덱스 (역할별 조회 최적화)
- `users_status_idx` : `users(status)` 일반 인덱스 (상태별 필터링 최적화)

---

### 4. 향후 확장 포인트 (초기 버전에서는 선택)

- `organizations` / `projects` 테이블로 멀티테넌시 또는 프로젝트 단위 관리 기능 확장
- 대시보드 지표용 `metrics` / `events` 테이블 추가 (일별 방문자 수, 매출, 사용량 등)

이 확장 테이블들은 실제로 필요해지는 시점에 스키마를 확정하고, `db_structure.md` 와 `schema.prisma` 를 동시에 업데이트합니다.


