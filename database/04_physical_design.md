# 물리적 설계 (Physical Design)

논리적 설계 결과를 바탕으로 실제 데이터베이스에 구현 가능한 물리적 구조를 정의하는 단계입니다.

**참고**: 모든 컬럼명은 공공데이터 공통표준7차 제·개정(2024.11월)의 표준용어사전에 따라 표준 용어로 작성되었습니다.

## 설계 목표

- 데이터베이스 엔진별 데이터 타입 세부 정의
- 인덱스 설계 및 최적화
- 파티셔닝 전략 수립
- 성능 최적화 고려사항
- 저장소 및 백업 전략

## 참고 자료

- 논리적 설계: [02_logical_design.md](02_logical_design.md)
- 개념적 설계: [01_conceptual_design.md](01_conceptual_design.md)
- 설계 원칙: [README.md](README.md)

## 데이터베이스 환경

### 데이터베이스 엔진
- **엔진**: MySQL 8.0 이상 (또는 MariaDB 10.5 이상)
- **문자셋**: `utf8mb4`
- **콜레이션**: `utf8mb4_unicode_ci`
- **저장소 엔진**: `InnoDB` (트랜잭션 지원, 외래키 제약조건 지원)

### 데이터베이스 설정 권장사항

```sql
-- 문자셋 설정
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- InnoDB 설정 최적화
innodb_buffer_pool_size = 시스템 메모리의 70-80%
innodb_log_file_size = 적절한 크기 설정
innodb_flush_log_at_trx_commit = 2 (성능 우선 시)
```

---

## 데이터 타입 매핑 규칙

### 정수형
- `INTEGER` → `INT` (32비트, -2,147,483,648 ~ 2,147,483,647)
- `BIGINT` → `BIGINT` (64비트, 대용량 데이터용)

### 문자열
- `VARCHAR(n)` → `VARCHAR(n) CHARACTER SET utf8mb4`
- `TEXT` → `TEXT CHARACTER SET utf8mb4`

### 날짜/시간
- `TIMESTAMP` → `TIMESTAMP` (1970-01-01 ~ 2038-01-19)
- 대안: `DATETIME` (더 넓은 범위 필요 시)

### 불린
- `BOOLEAN` → `TINYINT(1)` (0: FALSE, 1: TRUE)

### JSON
- `JSON` → `JSON` (MySQL 5.7+)

---

## 테이블별 물리적 설계

### 1. COMMON_USER (사용자)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 사용자 ID |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4 | 이메일 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 사용자명 |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4 | 비밀번호 해시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 이름 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 닉네임 |
| VARCHAR(20) | VARCHAR(20) | CHARACTER SET utf8mb4 | 전화번호 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 활성 상태 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 이메일 인증 여부 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 전화번호 인증 여부 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_USER_SN)

-- Unique Indexes
UNIQUE KEY uk_user_user_id (USER_ID)
UNIQUE KEY uk_user_eml (EML)
UNIQUE KEY uk_user_username (USERNAME)

-- 일반 인덱스 (조회 성능 최적화)
INDEX idx_user_actv_yn (ACTV_YN)
INDEX idx_user_del_yn (DEL_YN)
INDEX idx_user_crt_dt (CRT_DT)
INDEX idx_user_eml_vrf_yn (EML_VRF_YN)
```

#### 성능 고려사항
- 사용자 로그인 시 `USER_ID`, `EML`, `USERNAME` 조회가 빈번하므로 UNIQUE 인덱스 필수
- 활성 사용자 조회를 위한 `ACTV_YN` 인덱스
- 소프트 삭제 필터링을 위한 `DEL_YN` 인덱스

---

### 2. COMMON_OAUTH_ACCOUNT (OAuth 계정)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | OAuth 계정 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 사용자 ID |
| VARCHAR(50) | VARCHAR(50) | CHARACTER SET utf8mb4 | 제공자 |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4 | 제공자 사용자 ID |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4, NULL | 제공자 이메일 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 제공자 사용자명 |
| TEXT | TEXT | CHARACTER SET utf8mb4, NULL | 액세스 토큰 (암호화) |
| TEXT | TEXT | CHARACTER SET utf8mb4, NULL | 리프레시 토큰 (암호화) |
| TIMESTAMP | TIMESTAMP | NULL | 토큰 만료일시 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_OAUTH_ACCOUNT_SN)

-- Unique Indexes
UNIQUE KEY uk_oauth_account_id (OAUTH_ACCOUNT_ID)
UNIQUE KEY uk_oauth_provider_user (PROVIDER, PROVIDER_USER_ID)

-- Foreign Key Index
INDEX idx_oauth_user_id (USER_ID)

-- 일반 인덱스
INDEX idx_oauth_del_yn (DEL_YN)
INDEX idx_oauth_provider (PROVIDER)
```

#### 외래키 제약조건

```sql
CONSTRAINT fk_oauth_user_id 
    FOREIGN KEY (USER_ID) 
    REFERENCES COMMON_USER(USER_ID) 
    ON DELETE CASCADE
    ON UPDATE CASCADE
```

#### 성능 고려사항
- OAuth 로그인 시 `PROVIDER`와 `PROVIDER_USER_ID` 조합으로 조회하므로 복합 UNIQUE 인덱스 필수
- 토큰은 암호화하여 저장 (애플리케이션 레벨에서 처리)

---

### 3. COMMON_ROLE (역할)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 역할 ID |
| VARCHAR(50) | VARCHAR(50) | CHARACTER SET utf8mb4 | 역할 코드 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 역할 이름 |
| TEXT | TEXT | CHARACTER SET utf8mb4, NULL | 역할 설명 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 활성 상태 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_ROLE_SN)

-- Unique Indexes
UNIQUE KEY uk_role_role_id (ROLE_ID)
UNIQUE KEY uk_role_role_cd (ROLE_CD)

-- 일반 인덱스
INDEX idx_role_actv_yn (ACTV_YN)
INDEX idx_role_del_yn (DEL_YN)
```

#### 성능 고려사항
- 역할 코드로 빈번한 조회가 예상되므로 UNIQUE 인덱스 필수
- 데이터량이 적을 것으로 예상되나 인덱스는 유지

---

### 4. COMMON_PERMISSION (권한)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 권한 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 권한 코드 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 권한 이름 |
| TEXT | TEXT | CHARACTER SET utf8mb4, NULL | 권한 설명 |
| VARCHAR(50) | VARCHAR(50) | CHARACTER SET utf8mb4 | 리소스 |
| VARCHAR(50) | VARCHAR(50) | CHARACTER SET utf8mb4 | 액션 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 활성 상태 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_PERMISSION_SN)

-- Unique Indexes
UNIQUE KEY uk_permission_permission_id (PERMISSION_ID)
UNIQUE KEY uk_permission_permission_cd (PERMISSION_CD)

-- 일반 인덱스
INDEX idx_permission_rsrc_act (RSRC, ACT)
INDEX idx_permission_actv_yn (ACTV_YN)
INDEX idx_permission_del_yn (DEL_YN)
```

#### 성능 고려사항
- 리소스와 액션 조합으로 권한 검색이 빈번하므로 복합 인덱스 추가

---

### 5. COMMON_ROLE_PERMISSION (역할-권한 매핑)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 매핑 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 역할 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 권한 ID |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_ROLE_PERMISSION_SN)

-- Unique Indexes
UNIQUE KEY uk_role_permission_id (ROLE_PERMISSION_ID)
UNIQUE KEY uk_role_permission_mapping (ROLE_ID, PERMISSION_ID)

-- Foreign Key Indexes
INDEX idx_role_permission_role_id (ROLE_ID)
INDEX idx_role_permission_permission_id (PERMISSION_ID)

-- 일반 인덱스
INDEX idx_role_permission_del_yn (DEL_YN)
```

#### 외래키 제약조건

```sql
CONSTRAINT fk_role_permission_role_id 
    FOREIGN KEY (ROLE_ID) 
    REFERENCES COMMON_ROLE(ROLE_ID) 
    ON DELETE CASCADE
    ON UPDATE CASCADE

CONSTRAINT fk_role_permission_permission_id 
    FOREIGN KEY (PERMISSION_ID) 
    REFERENCES COMMON_PERMISSION(PERMISSION_ID) 
    ON DELETE CASCADE
    ON UPDATE CASCADE
```

#### 성능 고려사항
- 역할별 권한 조회가 빈번하므로 `ROLE_ID` 인덱스 필수
- 중복 매핑 방지를 위한 복합 UNIQUE 인덱스

---

### 6. COMMON_USER_ROLE (사용자-역할 매핑)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 매핑 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 사용자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 역할 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 할당한 사용자 ID |
| TIMESTAMP | TIMESTAMP | NULL | 할당일시 |
| TIMESTAMP | TIMESTAMP | NULL | 만료일시 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_USER_ROLE_SN)

-- Unique Indexes
UNIQUE KEY uk_user_role_id (USER_ROLE_ID)
UNIQUE KEY uk_user_role_mapping (USER_ID, ROLE_ID)

-- Foreign Key Indexes
INDEX idx_user_role_user_id (USER_ID)
INDEX idx_user_role_role_id (ROLE_ID)
INDEX idx_user_role_asgn_by (ASGN_BY)

-- 일반 인덱스
INDEX idx_user_role_expr_dt (EXPR_DT)
INDEX idx_user_role_del_yn (DEL_YN)
INDEX idx_user_role_use_yn (USE_YN)
```

#### 외래키 제약조건

```sql
CONSTRAINT fk_user_role_user_id 
    FOREIGN KEY (USER_ID) 
    REFERENCES COMMON_USER(USER_ID) 
    ON DELETE CASCADE
    ON UPDATE CASCADE

CONSTRAINT fk_user_role_role_id 
    FOREIGN KEY (ROLE_ID) 
    REFERENCES COMMON_ROLE(ROLE_ID) 
    ON DELETE CASCADE
    ON UPDATE CASCADE

CONSTRAINT fk_user_role_asgn_by 
    FOREIGN KEY (ASGN_BY) 
    REFERENCES COMMON_USER(USER_ID) 
    ON DELETE SET NULL
    ON UPDATE CASCADE
```

#### 성능 고려사항
- 사용자별 역할 조회가 매우 빈번하므로 `USER_ID` 인덱스 필수
- 만료된 역할 필터링을 위한 `EXPR_DT` 인덱스
- 활성 역할만 조회를 위한 `USE_YN` 인덱스

---

### 7. COMMON_REFRESH_TOKEN (리프레시 토큰)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 토큰 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 사용자 ID |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4 | 토큰 해시값 |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4, NULL | 디바이스 정보 |
| VARCHAR(45) | VARCHAR(45) | CHARACTER SET utf8mb4, NULL | IP 주소 |
| TIMESTAMP | TIMESTAMP | NOT NULL | 만료일시 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 취소 여부 |
| TIMESTAMP | TIMESTAMP | NULL | 취소일시 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | NULL | 마지막 사용일시 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_REFRESH_TOKEN_SN)

-- Unique Indexes
UNIQUE KEY uk_refresh_token_id (REFRESH_TOKEN_ID)
UNIQUE KEY uk_refresh_token_hash (TOKEN_HASH)

-- Foreign Key Index
INDEX idx_refresh_token_user_id (USER_ID)

-- 일반 인덱스
INDEX idx_refresh_token_expr_dt (EXPR_DT)
INDEX idx_refresh_token_rvk_yn (RVK_YN)
INDEX idx_refresh_token_del_yn (DEL_YN)
INDEX idx_refresh_token_user_expr (USER_ID, EXPR_DT)
```

#### 외래키 제약조건

```sql
CONSTRAINT fk_refresh_token_user_id 
    FOREIGN KEY (USER_ID) 
    REFERENCES COMMON_USER(USER_ID) 
    ON DELETE CASCADE
    ON UPDATE CASCADE
```

#### 성능 고려사항
- 토큰 검증 시 `TOKEN_HASH`로 조회하므로 UNIQUE 인덱스 필수
- 만료된 토큰 정리를 위한 `EXPR_DT` 인덱스
- 사용자별 토큰 조회를 위한 복합 인덱스 `(USER_ID, EXPR_DT)`
- 정기적인 만료 토큰 삭제 작업 필요 (스케줄러)

---

### 8. COMMON_AUDIT_LOG (감사 로그)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| BIGINT | BIGINT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 로그 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 사용자 ID |
| VARCHAR(50) | VARCHAR(50) | CHARACTER SET utf8mb4 | 액션 타입 |
| VARCHAR(50) | VARCHAR(50) | CHARACTER SET utf8mb4, NULL | 리소스 타입 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 리소스 ID |
| JSON | JSON | NULL | 변경 전 값 |
| JSON | JSON | NULL | 변경 후 값 |
| VARCHAR(45) | VARCHAR(45) | CHARACTER SET utf8mb4, NULL | IP 주소 |
| TEXT | TEXT | CHARACTER SET utf8mb4, NULL | User Agent |
| VARCHAR(10) | VARCHAR(10) | CHARACTER SET utf8mb4, NULL | HTTP 메서드 |
| VARCHAR(500) | VARCHAR(500) | CHARACTER SET utf8mb4, NULL | 요청 경로 |
| INTEGER | INT | NULL | HTTP 상태 코드 |
| TEXT | TEXT | CHARACTER SET utf8mb4, NULL | 에러 메시지 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_AUDIT_LOG_SN)

-- Unique Index
UNIQUE KEY uk_audit_log_id (AUDIT_LOG_ID)

-- Foreign Key Index
INDEX idx_audit_log_user_id (USER_ID)

-- 복합 인덱스 (조회 패턴 최적화)
INDEX idx_audit_log_user_crt_dt (USER_ID, CRT_DT)
INDEX idx_audit_log_act_crt_dt (ACT_TYP, CRT_DT)
INDEX idx_audit_log_rsrc (RSRC_TYP, RSRC_ID)
INDEX idx_audit_log_crt_dt (CRT_DT)

-- 일반 인덱스
INDEX idx_audit_log_act_typ (ACT_TYP)
INDEX idx_audit_log_rsrc_typ (RSRC_TYP)
INDEX idx_audit_log_del_yn (DEL_YN)
```

#### 외래키 제약조건

```sql
CONSTRAINT fk_audit_log_user_id 
    FOREIGN KEY (USER_ID) 
    REFERENCES COMMON_USER(USER_ID) 
    ON DELETE SET NULL
    ON UPDATE CASCADE
```

#### 파티셔닝 전략

```sql
-- 월별 파티셔닝 (Range Partitioning)
PARTITION BY RANGE (YEAR(CRT_DT) * 100 + MONTH(CRT_DT)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    -- ... 추가 파티션
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 또는 연도별 파티셔닝
PARTITION BY RANGE (YEAR(CRT_DT)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

#### 성능 고려사항
- **대용량 데이터 예상**: 파티셔닝 필수
- **인덱스 전략**: 조회 패턴에 맞춘 복합 인덱스 구성
- **아카이빙**: 오래된 데이터는 별도 아카이브 테이블로 이동
- **읽기 전용**: 대부분의 조회는 읽기 전용이므로 읽기 복제본 활용 고려
- **정기 정리**: 일정 기간(예: 1년) 이상 된 데이터는 아카이빙 또는 삭제

---

### 9. COMMON_FILE (파일)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 파일 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 사용자 ID |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4 | 원본 파일명 |
| VARCHAR(500) | VARCHAR(500) | CHARACTER SET utf8mb4 | 저장 경로 |
| BIGINT | BIGINT | UNSIGNED | 파일 크기 (바이트) |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | MIME 타입 |
| VARCHAR(10) | VARCHAR(10) | CHARACTER SET utf8mb4, NULL | 파일 확장자 |
| VARCHAR(20) | VARCHAR(20) | CHARACTER SET utf8mb4, DEFAULT 'LOCAL' | 저장소 타입 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 공개 여부 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_FILE_SN)

-- Unique Index
UNIQUE KEY uk_file_file_id (FILE_ID)

-- Foreign Key Index
INDEX idx_file_user_id (USER_ID)

-- 일반 인덱스
INDEX idx_file_file_ext (FILE_EXT)
INDEX idx_file_mime_typ (MIME_TYP)
INDEX idx_file_stg_typ (STG_TYP)
INDEX idx_file_pub_yn (PUB_YN)
INDEX idx_file_del_yn (DEL_YN)
INDEX idx_file_crt_dt (CRT_DT)
INDEX idx_file_user_crt (USER_ID, CRT_DT)
```

#### 외래키 제약조건

```sql
CONSTRAINT fk_file_user_id 
    FOREIGN KEY (USER_ID) 
    REFERENCES COMMON_USER(USER_ID) 
    ON DELETE CASCADE
    ON UPDATE CASCADE
```

#### 성능 고려사항
- 사용자별 파일 목록 조회를 위한 `USER_ID` 인덱스
- 파일 타입별 필터링을 위한 `FILE_EXT`, `MIME_TYP` 인덱스
- 공개 파일 조회를 위한 `PUB_YN` 인덱스
- 대용량 파일 메타데이터이므로 인덱스 전략 중요

---

### 10. COMMON_LOCALE (다국어)

#### 물리적 데이터 타입

| 논리적 타입 | 물리적 타입 | 크기/제약 | 설명 |
|-----------|-----------|---------|------|
| INTEGER | INT | UNSIGNED, AUTO_INCREMENT | 일련번호 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4 | 번역 ID |
| VARCHAR(10) | VARCHAR(10) | CHARACTER SET utf8mb4 | 언어 코드 |
| VARCHAR(50) | VARCHAR(50) | CHARACTER SET utf8mb4 | 리소스 타입 |
| VARCHAR(255) | VARCHAR(255) | CHARACTER SET utf8mb4 | 리소스 키 |
| TEXT | TEXT | CHARACTER SET utf8mb4 | 번역된 값 |
| TIMESTAMP | TIMESTAMP | NULL | 삭제일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 삭제자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 0 | 삭제여부 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 생성자 이름 |
| TIMESTAMP | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 수정일시 |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 ID |
| VARCHAR(100) | VARCHAR(100) | CHARACTER SET utf8mb4, NULL | 수정자 이름 |
| BOOLEAN | TINYINT(1) | DEFAULT 1 | 사용여부 |

#### 인덱스 설계

```sql
-- Primary Key
PRIMARY KEY (COMMON_LOCALE_SN)

-- Unique Indexes
UNIQUE KEY uk_locale_locale_id (LOCALE_ID)
UNIQUE KEY uk_locale_key (LANG_CD, RSRC_TYP, RSRC_KEY)

-- 일반 인덱스
INDEX idx_locale_lang_cd (LANG_CD)
INDEX idx_locale_rsrc_typ (RSRC_TYP)
INDEX idx_locale_del_yn (DEL_YN)
INDEX idx_locale_use_yn (USE_YN)
```

#### 성능 고려사항
- 언어별 리소스 조회가 매우 빈번하므로 복합 UNIQUE 인덱스 필수
- 애플리케이션 시작 시 캐싱 권장 (Redis 등)
- 데이터량이 적을 것으로 예상되나 조회 빈도가 높으므로 인덱스 중요

---

## 인덱스 전략 요약

### Primary Key
- 모든 테이블에 `_SN` 컬럼을 기본키로 사용
- `AUTO_INCREMENT`로 자동 증가

### Unique Index
- 비즈니스 키 (`USER_ID`, `ROLE_ID` 등)에 UNIQUE 인덱스
- 복합 UNIQUE 인덱스로 중복 방지

### Foreign Key Index
- 모든 외래키 컬럼에 인덱스 생성
- 조인 성능 최적화

### 일반 인덱스
- 조회 조건으로 자주 사용되는 컬럼
- 복합 인덱스로 조회 패턴 최적화
- 소프트 삭제 필터링을 위한 `DEL_YN` 인덱스

---

## 파티셔닝 전략

### 대상 테이블
- **COMMON_AUDIT_LOG**: 대용량 데이터 예상, 월별 또는 연도별 파티셔닝

### 파티셔닝 방법
- **Range Partitioning**: 날짜 기준으로 파티션 분할
- **파티션 관리**: 정기적으로 오래된 파티션 아카이빙 또는 삭제

### 파티셔닝 고려사항
- 파티션 키는 조회 조건에 자주 사용되는 컬럼
- 파티션 수는 적절히 유지 (너무 많으면 오버헤드 증가)

---

## 성능 최적화 고려사항

### 1. 인덱스 최적화
- 조회 패턴 분석 후 인덱스 설계
- 불필요한 인덱스 제거 (INSERT/UPDATE 성능 저하 방지)
- 복합 인덱스 순서 고려 (자주 사용되는 컬럼 우선)

### 2. 쿼리 최적화
- `EXPLAIN` 사용하여 실행 계획 분석
- 인덱스 스캔 최적화
- 서브쿼리 최적화

### 3. 연결 풀 관리
- 적절한 연결 풀 크기 설정
- 타임아웃 설정

### 4. 캐싱 전략
- 자주 조회되는 데이터는 애플리케이션 레벨 캐싱 (Redis 등)
- COMMON_LOCALE, COMMON_ROLE 등은 캐싱 권장

### 5. 아카이빙 전략
- 오래된 데이터는 별도 아카이브 테이블로 이동
- COMMON_AUDIT_LOG는 정기적으로 아카이빙

---

## 보안 고려사항

### 1. 데이터 암호화
- 민감 정보 (비밀번호 해시, 토큰)는 암호화 저장
- 애플리케이션 레벨에서 암호화/복호화 처리

### 2. 접근 제어
- 데이터베이스 사용자 권한 최소화
- 읽기 전용 사용자 분리

### 3. 감사 로그
- 모든 중요한 작업은 COMMON_AUDIT_LOG에 기록
- 로그 무결성 보장

---

## 백업 및 복구 전략

### 1. 백업 방법
- **전체 백업**: 일일 전체 백업
- **증분 백업**: 트랜잭션 로그 백업
- **스냅샷**: 스토리지 레벨 스냅샷

### 2. 백업 주기
- 전체 백업: 매일 (비즈니스 시간 외)
- 증분 백업: 매 시간 또는 실시간

### 3. 복구 테스트
- 정기적인 복구 테스트 수행
- RTO (Recovery Time Objective) 및 RPO (Recovery Point Objective) 정의

---

## 모니터링 및 유지보수

### 1. 성능 모니터링
- 쿼리 실행 시간 모니터링
- 인덱스 사용률 모니터링
- 테이블 크기 모니터링

### 2. 정기 작업
- 인덱스 통계 업데이트 (`ANALYZE TABLE`)
- 테이블 최적화 (`OPTIMIZE TABLE`)
- 만료된 토큰 정리
- 오래된 로그 아카이빙

### 3. 알림 설정
- 디스크 공간 부족 알림
- 느린 쿼리 알림
- 연결 수 초과 알림

---

## 다음 단계

물리적 설계 완료 후:
1. DDL 스크립트 작성
2. 초기 데이터 (시드 데이터) 준비
3. 마이그레이션 스크립트 작성
4. 성능 테스트 및 튜닝

