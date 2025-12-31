# 가계부 엔티티 및 관계 설계

## 1. 개요
가계부 시스템의 데이터 모델을 설계하여 엔티티 간 관계를 정의합니다.

## 2. 주요 엔티티 정의

### 2.1 User (사용자)
사용자의 기본 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 사용자 고유 식별자
- `username`: VARCHAR(50), UNIQUE, NOT NULL - 사용자 아이디
- `email`: VARCHAR(255), UNIQUE, NOT NULL - 이메일 주소
- `password_hash`: VARCHAR(255), NOT NULL - 암호화된 비밀번호
- `full_name`: VARCHAR(100) - 실명
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시
- `is_active`: BOOLEAN, DEFAULT TRUE - 계정 활성화 상태

### 2.2 Category (카테고리)
거래를 분류하기 위한 카테고리 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 카테고리 고유 식별자
- `user_id`: BIGINT, FOREIGN KEY -> User.id - 카테고리 소유자
- `name`: VARCHAR(100), NOT NULL - 카테고리명
- `type`: ENUM('INCOME', 'EXPENSE'), NOT NULL - 수입/지출 구분
- `parent_id`: BIGINT, FOREIGN KEY -> Category.id, NULL - 상위 카테고리 (계층 구조용)
- `color`: VARCHAR(7) - 카테고리 색상 (#RRGGBB 형식)
- `icon`: VARCHAR(50) - 카테고리 아이콘
- `description`: TEXT - 카테고리 설명
- `is_default`: BOOLEAN, DEFAULT FALSE - 시스템 기본 카테고리 여부
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시

### 2.3 Transaction (거래)
개별 수입/지출 거래 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 거래 고유 식별자
- `user_id`: BIGINT, FOREIGN KEY -> User.id - 거래 소유자
- `category_id`: BIGINT, FOREIGN KEY -> Category.id - 거래 카테고리
- `amount`: DECIMAL(15,2), NOT NULL - 거래 금액 (양수: 수입, 음수: 지출)
- `description`: VARCHAR(500) - 거래 설명
- `transaction_date`: DATE, NOT NULL - 거래 발생 일자
- `transaction_time`: TIME - 거래 발생 시간
- `payment_method`: ENUM('CASH', 'CARD', 'BANK_TRANSFER', 'ETC') - 결제 수단
- `location`: VARCHAR(255) - 거래 장소
- `tags`: JSON - 거래 태그 (배열 형식)
- `receipt_image_url`: VARCHAR(500) - 영수증 이미지 URL
- `is_recurring`: BOOLEAN, DEFAULT FALSE - 반복 거래 여부
- `recurring_pattern`: VARCHAR(50) - 반복 패턴 (MONTHLY, WEEKLY 등)
- `notes`: TEXT - 추가 메모
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시

### 2.4 Account (계좌) - 선택사항
사용자의 금융 계좌 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 계좌 고유 식별자
- `user_id`: BIGINT, FOREIGN KEY -> User.id - 계좌 소유자
- `name`: VARCHAR(100), NOT NULL - 계좌명
- `type`: ENUM('BANK', 'CREDIT_CARD', 'CASH', 'INVESTMENT') - 계좌 유형
- `balance`: DECIMAL(15,2), DEFAULT 0 - 현재 잔액
- `currency`: VARCHAR(3), DEFAULT 'KRW' - 통화
- `is_active`: BOOLEAN, DEFAULT TRUE - 계좌 활성화 상태
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시

## 3. 엔티티 관계

### 3.1 ER 다이어그램 (텍스트 표현)
```
User (1) ──── (N) Category
  │
  └─── (N) Transaction (N) ──── (1) Category
  │
  └─── (N) Account
```

### 3.2 관계 상세 설명

#### User - Category (1:N)
- 한 사용자는 여러 개의 카테고리를 가질 수 있음
- 카테고리는 특정 사용자에게 속함
- 사용자 삭제 시 연관된 모든 카테고리 삭제 (CASCADE)

#### User - Transaction (1:N)
- 한 사용자는 여러 개의 거래를 가질 수 있음
- 거래는 특정 사용자에게 속함
- 사용자 삭제 시 연관된 모든 거래 삭제 (CASCADE)

#### Category - Transaction (1:N)
- 한 카테고리는 여러 개의 거래를 가질 수 있음
- 거래는 하나의 카테고리에 속함
- 카테고리 삭제 시 연관된 거래는 NULL로 설정하거나 삭제 방지

#### User - Account (1:N) - 선택사항
- 한 사용자는 여러 개의 계좌를 가질 수 있음
- 계좌는 특정 사용자에게 속함

## 4. 비즈니스 규칙

### 4.1 데이터 무결성 규칙
- 모든 거래는 반드시 하나의 카테고리에 속해야 함
- 카테고리는 수입(INCOME) 또는 지출(EXPENSE) 유형 중 하나여야 함
- 거래 금액은 0이 될 수 없음
- 사용자별로 카테고리명은 중복될 수 없음

### 4.2 계층 구조 규칙 (Category)
- 카테고리는 최대 3단계 깊이의 계층 구조 지원
- 상위 카테고리 삭제 시 하위 카테고리는 독립적인 카테고리로 변환
- 기본 카테고리(is_default = TRUE)는 수정/삭제 불가

### 4.3 거래 규칙 (Transaction)
- 미래 날짜의 거래는 등록 불가
- 거래 금액의 범위: -100,000,000 ~ 100,000,000 원
- 반복 거래의 경우 recurring_pattern에 따라 자동 생성 가능

## 5. 인덱스 설계

### 5.1 성능 최적화를 위한 인덱스
- User: (email), (username)
- Category: (user_id, type), (user_id, parent_id)
- Transaction: (user_id, transaction_date), (user_id, category_id), (category_id)
- Account: (user_id, is_active)

### 5.2 복합 인덱스
- Transaction: (user_id, transaction_date, category_id) - 기간+카테고리별 조회 최적화
- Transaction: (user_id, amount) - 금액별 조회 최적화

## 6. 데이터 마이그레이션 고려사항

### 6.1 초기 데이터
- 기본 카테고리 세트 제공 (식비, 교통비, 생활비 등)
- 샘플 거래 데이터 (선택사항)

### 6.2 확장성 고려
- 사용자별 데이터 파티셔닝 가능성
- 아카이브 테이블 분리 (오래된 거래 데이터)
- 다중 통화 지원을 위한 확장성
