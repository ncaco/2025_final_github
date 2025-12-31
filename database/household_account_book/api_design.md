# 가계부 API 엔드포인트 설계

## 1. 개요
가계부 시스템의 RESTful API 엔드포인트를 설계합니다. 모든 API는 JWT 기반 인증을 사용하며, 사용자별 데이터 격리를 보장합니다.

## 2. API 기본 정보

### 2.1 Base URL
```
https://api.household-account-book.com/v1
```

### 2.2 인증 방식
- **Authorization Header**: `Bearer {JWT_TOKEN}`
- **토큰 만료**: 24시간
- **Refresh Token**: 별도 엔드포인트 제공

### 2.3 응답 형식
- **Content-Type**: `application/json`
- **성공 응답**: HTTP 200-299 + JSON 데이터
- **에러 응답**: HTTP 400-599 + 에러 객체

### 2.4 공통 응답 포맷
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "유효성 검사 실패",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 3. 인증 API

### 3.1 사용자 등록
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securePassword123!",
  "fullName": "홍길동"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "fullName": "홍길동"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### 3.2 로그인
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "user123",
  "password": "securePassword123!"
}
```

### 3.3 토큰 갱신
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

## 4. 카테고리 API

### 4.1 카테고리 목록 조회
**GET** `/categories`

**Query Parameters:**
- `type`: `INCOME` | `EXPENSE` - 카테고리 유형 필터
- `parentId`: number - 상위 카테고리 ID (계층 조회용)
- `includeHierarchy`: boolean - 계층 구조 포함 여부

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "식비",
        "type": "EXPENSE",
        "parentId": null,
        "color": "#FF6B6B",
        "icon": "utensils",
        "description": "식사 및 음료 관련 지출",
        "isDefault": true,
        "children": [
          {
            "id": 2,
            "name": "외식비",
            "type": "EXPENSE",
            "parentId": 1,
            "color": "#FF8A8A",
            "children": []
          }
        ]
      }
    ],
    "totalCount": 12
  }
}
```

### 4.2 카테고리 생성
**POST** `/categories`

**Request Body:**
```json
{
  "name": "새 카테고리",
  "type": "EXPENSE",
  "parentId": 1,
  "color": "#FF6B6B",
  "icon": "star",
  "description": "새로운 지출 카테고리"
}
```

### 4.3 카테고리 수정
**PUT** `/categories/{id}`

### 4.4 카테고리 삭제
**DELETE** `/categories/{id}`

## 5. 거래 API

### 5.1 거래 목록 조회
**GET** `/transactions`

**Query Parameters:**
- `page`: number - 페이지 번호 (기본값: 1)
- `limit`: number - 페이지당 항목 수 (기본값: 20)
- `startDate`: string - 조회 시작일 (YYYY-MM-DD)
- `endDate`: string - 조회 종료일 (YYYY-MM-DD)
- `categoryId`: number - 카테고리 ID 필터
- `type`: `INCOME` | `EXPENSE` - 거래 유형 필터
- `minAmount`: number - 최소 금액 필터
- `maxAmount`: number - 최대 금액 필터
- `search`: string - 설명 검색어
- `sortBy`: string - 정렬 기준 (date, amount, category)
- `sortOrder`: `asc` | `desc` - 정렬 방향

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 1,
        "category": {
          "id": 1,
          "name": "식비",
          "type": "EXPENSE",
          "color": "#FF6B6B"
        },
        "amount": -15000,
        "description": "점심 식사",
        "transactionDate": "2024-01-15",
        "transactionTime": "12:30:00",
        "paymentMethod": "CARD",
        "location": "회사 근처 식당",
        "tags": ["외식", "점심"],
        "notes": "동료와 함께",
        "createdAt": "2024-01-15T12:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 156,
      "totalPages": 8
    },
    "summary": {
      "totalIncome": 3000000,
      "totalExpense": 2800000,
      "netBalance": 200000
    }
  }
}
```

### 5.2 거래 상세 조회
**GET** `/transactions/{id}`

### 5.3 거래 생성
**POST** `/transactions`

**Request Body:**
```json
{
  "categoryId": 1,
  "amount": -25000,
  "description": "주말 장보기",
  "transactionDate": "2024-01-20",
  "transactionTime": "10:00:00",
  "paymentMethod": "CARD",
  "location": "이마트",
  "tags": ["장보기", "주말"],
  "notes": "주말 식재료 구입"
}
```

### 5.4 거래 수정
**PUT** `/transactions/{id}`

### 5.5 거래 삭제
**DELETE** `/transactions/{id}`

### 5.6 거래 일괄 등록
**POST** `/transactions/batch`

**Request Body:**
```json
{
  "transactions": [
    {
      "categoryId": 1,
      "amount": -15000,
      "description": "아침 식사",
      "transactionDate": "2024-01-15"
    },
    {
      "categoryId": 2,
      "amount": -3000,
      "description": "버스비",
      "transactionDate": "2024-01-15"
    }
  ]
}
```

## 6. 통계 및 분석 API

### 6.1 기간별 요약
**GET** `/statistics/summary`

**Query Parameters:**
- `period`: `daily` | `weekly` | `monthly` | `yearly` - 집계 기간
- `startDate`: string - 시작일
- `endDate`: string - 종료일

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "summary": [
      {
        "period": "2024-01",
        "income": 3000000,
        "expense": 2800000,
        "balance": 200000
      },
      {
        "period": "2024-02",
        "income": 3200000,
        "expense": 2900000,
        "balance": 300000
      }
    ]
  }
}
```

### 6.2 카테고리별 통계
**GET** `/statistics/categories`

**Query Parameters:**
- `startDate`: string - 시작일
- `endDate`: string - 종료일
- `type`: `INCOME` | `EXPENSE` - 거래 유형

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "categoryId": 1,
        "categoryName": "식비",
        "type": "EXPENSE",
        "totalAmount": -450000,
        "transactionCount": 30,
        "percentage": 18.5
      },
      {
        "categoryId": 2,
        "categoryName": "교통비",
        "type": "EXPENSE",
        "totalAmount": -180000,
        "transactionCount": 45,
        "percentage": 7.4
      }
    ],
    "totalExpense": -2430000
  }
}
```

### 6.3 월별 추이 분석
**GET** `/statistics/trends`

**Query Parameters:**
- `months`: number - 분석할 월 수 (기본값: 12)

## 7. 데이터 내보내기 API

### 7.1 거래 데이터 내보내기
**GET** `/export/transactions`

**Query Parameters:**
- `format`: `csv` | `xlsx` - 내보내기 형식
- `startDate`: string - 시작일
- `endDate`: string - 종료일
- `categoryId`: number - 카테고리 필터

**Response:** 파일 다운로드

## 8. 계좌 API (선택사항)

### 8.1 계좌 목록 조회
**GET** `/accounts`

### 8.2 계좌 잔액 조회
**GET** `/accounts/{id}/balance`

## 9. 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `VALIDATION_ERROR` | 400 | 요청 데이터 유효성 오류 |
| `UNAUTHORIZED` | 401 | 인증 실패 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 리소스 충돌 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 한도 초과 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

## 10. API 버전 관리

- **현재 버전**: v1
- **버전 헤더**: `Accept: application/vnd.household-account-book.v1+json`
- **버전 지원 기간**: 최소 12개월
- **마이그레이션**: 새로운 버전 출시 시 최소 3개월 유예 기간 제공

## 11. API 제한 및 최적화

### 11.1 Rate Limiting
- **인증되지 않은 요청**: 100회/시간
- **인증된 요청**: 1000회/시간
- **헤더**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 11.2 캐싱
- **GET 요청**: ETag 기반 캐싱 지원
- **캐시 만료**: 5분
- **Cache-Control 헤더**: `max-age=300`

### 11.3 압축
- **응답 압축**: gzip 지원
- **Accept-Encoding**: `gzip, deflate`
