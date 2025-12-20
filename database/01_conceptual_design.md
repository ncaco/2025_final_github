# 개념적 설계 (Conceptual Design)

요구사항 분석 결과를 바탕으로 엔티티, 속성, 관계를 정의하는 단계입니다.

## 설계 목표

- 엔티티 식별 및 정의
- 각 엔티티의 속성 정의
- 엔티티 간 관계 정의
- ERD 작성

## 참고 자료

- 요구사항 분석: [plan.md](plan.md)
- 설계 원칙: [README.md](README.md)

## 엔티티 목록

요구사항 분석 결과 식별된 주요 엔티티:

1. COMMON_USER (사용자)
2. COMMON_OAUTH_ACCOUNT (OAuth 계정)
3. COMMON_ROLE (역할)
4. COMMON_PERMISSION (권한)
5. COMMON_ROLE_PERMISSION (역할-권한 매핑)
6. COMMON_USER_ROLE (사용자-역할 매핑)
7. COMMON_REFRESH_TOKEN (리프레시 토큰)
8. COMMON_AUDIT_LOG (감사 로그)
9. COMMON_FILE (파일)
10. COMMON_LOCALE (다국어)

---

## 엔티티 상세 정의

### 1. COMMON_USER (사용자)

**목적**: 사용자 기본 정보 및 인증 정보 저장

**속성**:
- USER_ID (PK): 사용자 고유 식별자
- EMAIL: 이메일 주소 (UNIQUE, NOT NULL)
- USERNAME: 사용자명 (UNIQUE, NOT NULL)
- PASSWORD_HASH: 비밀번호 해시값 (NULL 가능 - OAuth 사용자)
- NAME: 이름 (실명)
- NICKNAME: 닉네임
- PHONE: 전화번호
- IS_ACTIVE: 활성 상태 (기본값: true)
- IS_EMAIL_VERIFIED: 이메일 인증 여부
- IS_PHONE_VERIFIED: 전화번호 인증 여부
- DELETED_AT: 삭제일시 (소프트 삭제용, NULL이면 활성)
- CREATED_AT: 생성일시
- UPDATED_AT: 수정일시

**관계**:
- 1:N → COMMON_OAUTH_ACCOUNT (한 사용자는 여러 OAuth 계정 보유 가능)
- M:N → COMMON_ROLE (사용자-역할 매핑)
- 1:N → COMMON_REFRESH_TOKEN (한 사용자는 여러 리프레시 토큰 보유 가능)
- 1:N → COMMON_AUDIT_LOG (한 사용자의 여러 활동 기록)
- 1:N → COMMON_FILE (한 사용자가 업로드한 여러 파일)

**비고**: 
- EMAIL과 USERNAME은 모두 UNIQUE 제약조건
- PASSWORD_HASH는 NULL 허용 (OAuth 전용 사용자의 경우)

---

### 2. COMMON_OAUTH_ACCOUNT (OAuth 계정)

**목적**: OAuth 제공자별 계정 정보 저장

**속성**:
- OAUTH_ACCOUNT_ID (PK): OAuth 계정 고유 식별자
- USER_ID (FK): 사용자 ID
- PROVIDER: 제공자 (GOOGLE, GITHUB, KAKAO, NAVER)
- PROVIDER_USER_ID: 제공자에서의 사용자 ID
- PROVIDER_EMAIL: 제공자에서 제공한 이메일
- PROVIDER_USERNAME: 제공자에서 제공한 사용자명
- ACCESS_TOKEN: 액세스 토큰 (암호화 저장)
- REFRESH_TOKEN: 리프레시 토큰 (암호화 저장, 제공자가 지원하는 경우)
- TOKEN_EXPIRES_AT: 토큰 만료일시
- CREATED_AT: 생성일시
- UPDATED_AT: 수정일시

**관계**:
- N:1 → COMMON_USER (여러 OAuth 계정이 한 사용자에 속함)

**비고**:
- PROVIDER와 PROVIDER_USER_ID 조합은 UNIQUE
- 토큰은 암호화하여 저장

---

### 3. COMMON_ROLE (역할)

**목적**: 시스템 내 역할 정의

**속성**:
- ROLE_ID (PK): 역할 고유 식별자
- ROLE_CODE: 역할 코드 (예: ADMIN, USER, MODERATOR)
- ROLE_NAME: 역할 이름
- DESCRIPTION: 역할 설명
- IS_ACTIVE: 활성 상태
- CREATED_AT: 생성일시
- UPDATED_AT: 수정일시

**관계**:
- M:N → COMMON_PERMISSION (역할-권한 매핑)
- M:N → COMMON_USER (사용자-역할 매핑)

**비고**:
- ROLE_CODE는 UNIQUE 제약조건

---

### 4. COMMON_PERMISSION (권한)

**목적**: 시스템 내 권한 정의

**속성**:
- PERMISSION_ID (PK): 권한 고유 식별자
- PERMISSION_CODE: 권한 코드 (예: USER_CREATE, USER_UPDATE, USER_DELETE)
- PERMISSION_NAME: 권한 이름
- DESCRIPTION: 권한 설명
- RESOURCE: 리소스 (예: USER, FILE, ADMIN)
- ACTION: 액션 (예: CREATE, READ, UPDATE, DELETE)
- IS_ACTIVE: 활성 상태
- CREATED_AT: 생성일시
- UPDATED_AT: 수정일시

**관계**:
- M:N → COMMON_ROLE (역할-권한 매핑)

**비고**:
- PERMISSION_CODE는 UNIQUE 제약조건
- RESOURCE와 ACTION 조합으로 권한 식별

---

### 5. COMMON_ROLE_PERMISSION (역할-권한 매핑)

**목적**: 역할과 권한의 다대다 관계 매핑

**속성**:
- ROLE_PERMISSION_ID (PK): 매핑 고유 식별자
- ROLE_ID (FK): 역할 ID
- PERMISSION_ID (FK): 권한 ID
- CREATED_AT: 생성일시

**관계**:
- N:1 → COMMON_ROLE
- N:1 → COMMON_PERMISSION

**비고**:
- ROLE_ID와 PERMISSION_ID 조합은 UNIQUE 제약조건

---

### 6. COMMON_USER_ROLE (사용자-역할 매핑)

**목적**: 사용자와 역할의 다대다 관계 매핑

**속성**:
- USER_ROLE_ID (PK): 매핑 고유 식별자
- USER_ID (FK): 사용자 ID
- ROLE_ID (FK): 역할 ID
- ASSIGNED_BY: 할당한 사용자 ID (선택사항)
- ASSIGNED_AT: 할당일시
- EXPIRES_AT: 만료일시 (NULL이면 무기한)
- CREATED_AT: 생성일시

**관계**:
- N:1 → COMMON_USER
- N:1 → COMMON_ROLE

**비고**:
- USER_ID와 ROLE_ID 조합은 UNIQUE 제약조건
- 역할 만료 기능 지원

---

### 7. COMMON_REFRESH_TOKEN (리프레시 토큰)

**목적**: JWT 리프레시 토큰 관리

**속성**:
- REFRESH_TOKEN_ID (PK): 토큰 고유 식별자
- USER_ID (FK): 사용자 ID
- TOKEN_HASH: 토큰 해시값 (실제 토큰은 저장하지 않음)
- DEVICE_INFO: 디바이스 정보 (선택사항)
- IP_ADDRESS: IP 주소
- EXPIRES_AT: 만료일시
- IS_REVOKED: 취소 여부
- REVOKED_AT: 취소일시
- CREATED_AT: 생성일시
- LAST_USED_AT: 마지막 사용일시

**관계**:
- N:1 → USER

**비고**:
- 토큰은 해시값으로만 저장 (보안)
- 취소된 토큰은 재사용 불가

---

### 8. COMMON_AUDIT_LOG (감사 로그)

**목적**: 모든 사용자 활동 기록

**속성**:
- AUDIT_LOG_ID (PK): 로그 고유 식별자
- USER_ID (FK): 사용자 ID (NULL 가능 - 시스템 작업)
- ACTION_TYPE: 액션 타입 (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, API_CALL 등)
- RESOURCE_TYPE: 리소스 타입 (USER, FILE, ROLE 등)
- RESOURCE_ID: 리소스 ID
- OLD_VALUE: 변경 전 값 (JSON 형식)
- NEW_VALUE: 변경 후 값 (JSON 형식)
- IP_ADDRESS: IP 주소
- USER_AGENT: User Agent
- REQUEST_METHOD: HTTP 메서드 (GET, POST, PUT, DELETE 등)
- REQUEST_PATH: 요청 경로
- STATUS_CODE: HTTP 상태 코드
- ERROR_MESSAGE: 에러 메시지 (에러 발생 시)
- CREATED_AT: 생성일시

**관계**:
- N:1 → COMMON_USER (NULL 가능)

**비고**:
- 모든 활동을 기록하므로 대용량 데이터 예상
- 파티셔닝 또는 아카이빙 전략 필요

---

### 9. COMMON_FILE (파일)

**목적**: 업로드된 파일 메타데이터 저장

**속성**:
- FILE_ID (PK): 파일 고유 식별자
- USER_ID (FK): 업로드한 사용자 ID
- FILE_NAME: 원본 파일명
- FILE_PATH: 저장 경로
- FILE_SIZE: 파일 크기 (바이트)
- MIME_TYPE: MIME 타입
- FILE_EXTENSION: 파일 확장자
- STORAGE_TYPE: 저장소 타입 (LOCAL, S3 등)
- IS_PUBLIC: 공개 여부
- DELETED_AT: 삭제일시 (소프트 삭제)
- CREATED_AT: 생성일시
- UPDATED_AT: 수정일시

**관계**:
- N:1 → COMMON_USER

**비고**:
- 실제 파일은 별도 스토리지에 저장
- 소프트 삭제 지원

---

### 10. COMMON_LOCALE (다국어)

**목적**: 다국어 지원을 위한 번역 데이터

**속성**:
- LOCALE_ID (PK): 번역 고유 식별자
- LANGUAGE_CODE: 언어 코드 (ko, en, ja 등)
- RESOURCE_TYPE: 리소스 타입 (LABEL, MESSAGE, ERROR 등)
- RESOURCE_KEY: 리소스 키
- RESOURCE_VALUE: 번역된 값
- CREATED_AT: 생성일시
- UPDATED_AT: 수정일시

**관계**:
- 없음 (독립적인 참조 테이블)

**비고**:
- LANGUAGE_CODE, RESOURCE_TYPE, RESOURCE_KEY 조합은 UNIQUE
- 동적 다국어 지원

---

## 엔티티 관계도 (ERD) 요약

```
COMMON_USER (1) ──< (N) COMMON_OAUTH_ACCOUNT
COMMON_USER (M) ──< (N) COMMON_USER_ROLE >── (M) COMMON_ROLE
COMMON_ROLE (M) ──< (N) COMMON_ROLE_PERMISSION >── (M) COMMON_PERMISSION
COMMON_USER (1) ──< (N) COMMON_REFRESH_TOKEN
COMMON_USER (1) ──< (N) COMMON_AUDIT_LOG
COMMON_USER (1) ──< (N) COMMON_FILE
COMMON_LOCALE (독립)
```

## 다음 단계

개념적 설계 완료 후:
1. 논리적 설계 (정규화)
2. 물리적 설계 (데이터 타입, 인덱스 등)
3. DDL 작성

