# 논리적 설계 (Logical Design)

개념적 설계 결과를 바탕으로 정규화를 수행하고 테이블 구조를 정의하는 단계입니다.

**참고**: 모든 컬럼명은 공공데이터 공통표준7차 제·개정(2024.11월)의 표준용어사전에 따라 표준 용어로 작성되었습니다.

## 설계 목표

- 정규화 수행 (1NF, 2NF, 3NF, BCNF)
- 테이블 구조 최종 정의
- 관계 무결성 규칙 정의
- 정규화 검증

## 참고 자료

- 개념적 설계: [01_conceptual_design.md](01_conceptual_design.md)
- 설계 원칙: [README.md](README.md)

## 정규화 원칙

### 제1정규형 (1NF)
- 모든 속성은 원자값(Atomic Value)이어야 함
- 중복된 그룹이 없어야 함

### 제2정규형 (2NF)
- 1NF를 만족
- 부분 함수 종속성 제거 (완전 함수 종속성만 허용)

### 제3정규형 (3NF)
- 2NF를 만족
- 이행 함수 종속성 제거

### BCNF (Boyce-Codd Normal Form)
- 3NF를 만족
- 모든 결정자가 후보키여야 함

---

## 테이블별 정규화 검토 및 논리적 설계

### 1. COMMON_USER (사용자)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_USER_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_USER_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| USER_ID | VARCHAR(100) | UNIQUE, NOT NULL | 사용자 고유 식별자 |
| EML | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 주소 |
| USERNAME | VARCHAR(100) | UNIQUE, NOT NULL | 사용자명 |
| PWD_HASH | VARCHAR(255) | NULL | 비밀번호 해시값 |
| NM | VARCHAR(100) | NULL | 이름 (실명) |
| NICKNAME | VARCHAR(100) | NULL | 닉네임 |
| TELNO | VARCHAR(20) | NULL | 전화번호 |
| ACTV_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 상태 |
| EML_VRF_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 이메일 인증 여부 |
| TELNO_VRF_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 전화번호 인증 여부 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| UPD_DT | TIMESTAMP | NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| UPD_BY | VARCHAR(100) | NULL | 수정자 ID |
| UPD_BY_NM | VARCHAR(100) | NULL | 수정자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- 외래키 없음 (최상위 엔티티)

---

### 2. COMMON_OAUTH_ACCOUNT (OAuth 계정)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_OAUTH_ACCOUNT_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_OAUTH_ACCOUNT_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| OAUTH_ACCOUNT_ID | VARCHAR(100) | UNIQUE, NOT NULL | OAuth 계정 고유 식별자 |
| USER_ID | VARCHAR(100) | FK → COMMON_USER.USER_ID, NOT NULL | 사용자 ID |
| PROVIDER | VARCHAR(50) | NOT NULL | 제공자 (GOOGLE, GITHUB, KAKAO, NAVER) |
| PROVIDER_USER_ID | VARCHAR(255) | NOT NULL | 제공자에서의 사용자 ID |
| PROVIDER_EML | VARCHAR(255) | NULL | 제공자에서 제공한 이메일 |
| PROVIDER_USERNAME | VARCHAR(100) | NULL | 제공자에서 제공한 사용자명 |
| ACCESS_TOKEN | TEXT | NULL | 액세스 토큰 (암호화 저장) |
| REFRESH_TOKEN | TEXT | NULL | 리프레시 토큰 (암호화 저장) |
| TOKEN_EXPR_DT | TIMESTAMP | NULL | 토큰 만료일시 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| UPD_DT | TIMESTAMP | NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| UPD_BY | VARCHAR(100) | NULL | 수정자 ID |
| UPD_BY_NM | VARCHAR(100) | NULL | 수정자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)
- UNIQUE 제약조건: (PROVIDER, PROVIDER_USER_ID)

**비고**: COMMON_ROLE 테이블에 누락된 컬럼 추가됨

---

### 3. COMMON_ROLE (역할)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_ROLE_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_ROLE_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| ROLE_ID | VARCHAR(100) | UNIQUE, NOT NULL | 역할 고유 식별자 |
| ROLE_CD | VARCHAR(50) | UNIQUE, NOT NULL | 역할 코드 (ADMIN, USER, MODERATOR) |
| ROLE_NM | VARCHAR(100) | NOT NULL | 역할 이름 |
| DSC | TEXT | NULL | 역할 설명 |
| ACTV_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 상태 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| UPD_DT | TIMESTAMP | NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| UPD_BY | VARCHAR(100) | NULL | 수정자 ID |
| UPD_BY_NM | VARCHAR(100) | NULL | 수정자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- 외래키 없음 (독립 엔티티)

---

### 4. COMMON_PERMISSION (권한)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_PERMISSION_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_PERMISSION_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| PERMISSION_ID | VARCHAR(100) | UNIQUE, NOT NULL | 권한 고유 식별자 |
| PERMISSION_CD | VARCHAR(100) | UNIQUE, NOT NULL | 권한 코드 (USER_CREATE, USER_UPDATE 등) |
| PERMISSION_NM | VARCHAR(100) | NOT NULL | 권한 이름 |
| DSC | TEXT | NULL | 권한 설명 |
| RSRC | VARCHAR(50) | NOT NULL | 리소스 (USER, FILE, ADMIN 등) |
| ACT | VARCHAR(50) | NOT NULL | 액션 (CREATE, READ, UPDATE, DELETE) |
| ACTV_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 활성 상태 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| UPD_DT | TIMESTAMP | NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| UPD_BY | VARCHAR(100) | NULL | 수정자 ID |
| UPD_BY_NM | VARCHAR(100) | NULL | 수정자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- 외래키 없음 (독립 엔티티)

---

### 5. COMMON_ROLE_PERMISSION (역할-권한 매핑)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_ROLE_PERMISSION_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_ROLE_PERMISSION_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| ROLE_PERMISSION_ID | VARCHAR(100) | UNIQUE, NOT NULL | 매핑 고유 식별자 |
| ROLE_ID | VARCHAR(100) | FK → COMMON_ROLE.ROLE_ID, NOT NULL | 역할 ID |
| PERMISSION_ID | VARCHAR(100) | FK → COMMON_PERMISSION.PERMISSION_ID, NOT NULL | 권한 ID |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- ROLE_ID → COMMON_ROLE.ROLE_ID (CASCADE DELETE)
- PERMISSION_ID → COMMON_PERMISSION.PERMISSION_ID (CASCADE DELETE)
- UNIQUE 제약조건: (ROLE_ID, PERMISSION_ID)

---

### 6. COMMON_USER_ROLE (사용자-역할 매핑)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_USER_ROLE_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_USER_ROLE_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| USER_ROLE_ID | VARCHAR(100) | UNIQUE, NOT NULL | 매핑 고유 식별자 |
| USER_ID | VARCHAR(100) | FK → COMMON_USER.USER_ID, NOT NULL | 사용자 ID |
| ROLE_ID | VARCHAR(100) | FK → COMMON_ROLE.ROLE_ID, NOT NULL | 역할 ID |
| ASGN_BY | VARCHAR(100) | FK → COMMON_USER.USER_ID, NULL | 할당한 사용자 ID |
| ASGN_DT | TIMESTAMP | NULL | 할당일시 |
| EXPR_DT | TIMESTAMP | NULL | 만료일시 (NULL이면 무기한) |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| UPD_DT | TIMESTAMP | NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| UPD_BY | VARCHAR(100) | NULL | 수정자 ID |
| UPD_BY_NM | VARCHAR(100) | NULL | 수정자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)
- ROLE_ID → COMMON_ROLE.ROLE_ID (CASCADE DELETE)
- ASSIGNED_BY → COMMON_USER.USER_ID (SET NULL)
- UNIQUE 제약조건: (USER_ID, ROLE_ID)

---

### 7. COMMON_REFRESH_TOKEN (리프레시 토큰)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_REFRESH_TOKEN_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_REFRESH_TOKEN_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| REFRESH_TOKEN_ID | VARCHAR(100) | UNIQUE, NOT NULL | 토큰 고유 식별자 |
| USER_ID | VARCHAR(100) | FK → COMMON_USER.USER_ID, NOT NULL | 사용자 ID |
| TOKEN_HASH | VARCHAR(255) | UNIQUE, NOT NULL | 토큰 해시값 |
| DVC_INFO | VARCHAR(255) | NULL | 디바이스 정보 |
| IP_ADDR | VARCHAR(45) | NULL | IP 주소 (IPv6 지원) |
| EXPR_DT | TIMESTAMP | NOT NULL | 만료일시 |
| RVK_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 취소 여부 |
| RVK_DT | TIMESTAMP | NULL | 취소일시 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| LAST_USE_DT | TIMESTAMP | NULL | 마지막 사용일시 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)

---

### 8. COMMON_AUDIT_LOG (감사 로그)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_AUDIT_LOG_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_AUDIT_LOG_SN | BIGINT | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| AUDIT_LOG_ID | VARCHAR(100) | UNIQUE, NOT NULL | 로그 고유 식별자 |
| USER_ID | VARCHAR(100) | FK → COMMON_USER.USER_ID, NULL | 사용자 ID (NULL 가능) |
| ACT_TYP | VARCHAR(50) | NOT NULL | 액션 타입 (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, API_CALL) |
| RSRC_TYP | VARCHAR(50) | NULL | 리소스 타입 (USER, FILE, ROLE 등) |
| RSRC_ID | VARCHAR(100) | NULL | 리소스 ID |
| OLD_VAL | JSON | NULL | 변경 전 값 (JSON 형식) |
| NEW_VAL | JSON | NULL | 변경 후 값 (JSON 형식) |
| IP_ADDR | VARCHAR(45) | NULL | IP 주소 |
| USER_AGENT | TEXT | NULL | User Agent |
| REQ_MTHD | VARCHAR(10) | NULL | HTTP 메서드 (GET, POST, PUT, DELETE) |
| REQ_PATH | VARCHAR(500) | NULL | 요청 경로 |
| STTS_CD | INTEGER | NULL | HTTP 상태 코드 |
| ERR_MSG | TEXT | NULL | 에러 메시지 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- USER_ID → COMMON_USER.USER_ID (SET NULL)

#### 비고
- 대용량 데이터 예상 (파티셔닝 고려)
- 인덱스: (USER_ID, CRT_DT), (ACT_TYP, CRT_DT), (RSRC_TYP, RSRC_ID)

---

### 9. COMMON_FILE (파일)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_FILE_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_FILE_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| FILE_ID | VARCHAR(100) | UNIQUE, NOT NULL | 파일 고유 식별자 |
| USER_ID | VARCHAR(100) | FK → COMMON_USER.USER_ID, NOT NULL | 업로드한 사용자 ID |
| FILE_NM | VARCHAR(255) | NOT NULL | 원본 파일명 |
| FILE_PATH | VARCHAR(500) | NOT NULL | 저장 경로 |
| FILE_SZ | BIGINT | NOT NULL | 파일 크기 (바이트) |
| MIME_TYP | VARCHAR(100) | NULL | MIME 타입 |
| FILE_EXT | VARCHAR(10) | NULL | 파일 확장자 |
| STG_TYP | VARCHAR(20) | NOT NULL, DEFAULT 'LOCAL' | 저장소 타입 (LOCAL, S3 등) |
| PUB_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 공개 여부 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| UPD_DT | TIMESTAMP | NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| UPD_BY | VARCHAR(100) | NULL | 수정자 ID |
| UPD_BY_NM | VARCHAR(100) | NULL | 수정자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)

---

### 10. COMMON_LOCALE (다국어)

#### 정규화 검토
- ✅ 1NF: 모든 속성이 원자값
- ✅ 2NF: 기본키(COMMON_LOCALE_SN)에 완전 함수 종속
- ✅ 3NF: 이행 함수 종속성 없음
- ✅ BCNF: 결정자 모두 후보키

#### 최종 테이블 구조

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|------------|---------|------|
| COMMON_LOCALE_SN | INTEGER | PK, NOT NULL, AUTO_INCREMENT | 일련번호 (Primary Key) |
| LOCALE_ID | VARCHAR(100) | UNIQUE, NOT NULL | 번역 고유 식별자 |
| LANG_CD | VARCHAR(10) | NOT NULL | 언어 코드 (ko, en, ja 등) |
| RSRC_TYP | VARCHAR(50) | NOT NULL | 리소스 타입 (LABEL, MESSAGE, ERROR 등) |
| RSRC_KEY | VARCHAR(255) | NOT NULL | 리소스 키 |
| RSRC_VAL | TEXT | NOT NULL | 번역된 값 |
| DEL_DT | TIMESTAMP | NULL | 삭제일시 (소프트 삭제) |
| DEL_BY | VARCHAR(100) | NULL | 삭제자 ID |
| DEL_BY_NM | VARCHAR(100) | NULL | 삭제자 이름 |
| DEL_YN | BOOLEAN | NOT NULL, DEFAULT FALSE | 삭제여부 |
| CRT_DT | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| CRT_BY | VARCHAR(100) | NULL | 생성자 ID |
| CRT_BY_NM | VARCHAR(100) | NULL | 생성자 이름 |
| UPD_DT | TIMESTAMP | NULL, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| UPD_BY | VARCHAR(100) | NULL | 수정자 ID |
| UPD_BY_NM | VARCHAR(100) | NULL | 수정자 이름 |
| USE_YN | BOOLEAN | NOT NULL, DEFAULT TRUE | 사용여부 |

#### 관계 무결성
- 외래키 없음 (독립 엔티티)
- UNIQUE 제약조건: (LANG_CD, RSRC_TYP, RSRC_KEY)

---

## 정규화 검증 요약

모든 테이블이 다음 정규화 수준을 만족합니다:
- ✅ 제1정규형 (1NF)
- ✅ 제2정규형 (2NF)
- ✅ 제3정규형 (3NF)
- ✅ BCNF (Boyce-Codd Normal Form)

## 관계 무결성 규칙

### 외래키 제약조건 정리

1. **COMMON_OAUTH_ACCOUNT**
   - USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)

2. **COMMON_ROLE_PERMISSION**
   - ROLE_ID → COMMON_ROLE.ROLE_ID (CASCADE DELETE)
   - PERMISSION_ID → COMMON_PERMISSION.PERMISSION_ID (CASCADE DELETE)

3. **COMMON_USER_ROLE**
   - USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)
   - ROLE_ID → COMMON_ROLE.ROLE_ID (CASCADE DELETE)
   - ASGN_BY → COMMON_USER.USER_ID (SET NULL)

4. **COMMON_REFRESH_TOKEN**
   - USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)

5. **COMMON_AUDIT_LOG**
   - USER_ID → COMMON_USER.USER_ID (SET NULL)

6. **COMMON_FILE**
   - USER_ID → COMMON_USER.USER_ID (CASCADE DELETE)

### UNIQUE 제약조건 정리

1. **COMMON_USER**: (USER_ID), (EML), (USERNAME)
2. **COMMON_OAUTH_ACCOUNT**: (OAUTH_ACCOUNT_ID), (PROVIDER, PROVIDER_USER_ID)
3. **COMMON_ROLE**: (ROLE_ID), (ROLE_CD)
4. **COMMON_PERMISSION**: (PERMISSION_ID), (PERMISSION_CD)
5. **COMMON_ROLE_PERMISSION**: (ROLE_PERMISSION_ID), (ROLE_ID, PERMISSION_ID)
6. **COMMON_USER_ROLE**: (USER_ROLE_ID), (USER_ID, ROLE_ID)
7. **COMMON_REFRESH_TOKEN**: (REFRESH_TOKEN_ID), (TOKEN_HASH)
8. **COMMON_AUDIT_LOG**: (AUDIT_LOG_ID)
9. **COMMON_FILE**: (FILE_ID)
10. **COMMON_LOCALE**: (LOCALE_ID), (LANG_CD, RSRC_TYP, RSRC_KEY)

## 다음 단계

논리적 설계 완료 후:
1. 물리적 설계 (데이터 타입 세부 정의, 인덱스 설계)
2. DDL 작성

