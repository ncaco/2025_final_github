# 게시판 API 엔드포인트 설계

## 1. 개요
게시판 시스템의 RESTful API 엔드포인트를 설계합니다. 모든 API는 JWT 기반 인증을 사용하며, 게시판별 권한 제어를 지원합니다.

## 2. API 기본 정보

### 2.1 Base URL
```
https://api.board-system.com/v1
```

### 2.2 인증 방식
- **Authorization Header**: `Bearer {JWT_TOKEN}`
- **토큰 만료**: 24시간
- **Refresh Token**: 별도 엔드포인트 제공
- **게시판 권한**: 각 엔드포인트별 권한 레벨 확인

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
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req-12345"
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "유효성 검사 실패",
    "details": [
      {
        "field": "title",
        "message": "제목은 필수입니다"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req-12345"
}
```

## 3. 인증 API

### 3.1 회원가입
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securePassword123!",
  "nickname": "사용자닉네임"
}
```

### 3.2 로그인
**POST** `/auth/login`

### 3.3 로그아웃
**POST** `/auth/logout`

### 3.4 토큰 갱신
**POST** `/auth/refresh`

## 4. 게시판 API

### 4.1 게시판 목록 조회
**GET** `/boards`

**Query Parameters:**
- `type`: 게시판 유형 필터 (`GENERAL`, `NOTICE`, etc.)
- `activeOnly`: 활성화된 게시판만 조회 (기본값: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "boards": [
      {
        "id": 1,
        "name": "공지사항",
        "description": "중요한 공지사항을 게시하는 곳입니다.",
        "type": "NOTICE",
        "isActive": true,
        "permissions": {
          "read": "ALL",
          "write": "ADMIN",
          "comment": "USER"
        },
        "postCount": 25,
        "lastPostDate": "2024-01-15T10:30:00Z"
      }
    ],
    "totalCount": 4
  }
}
```

### 4.2 게시판 상세 조회
**GET** `/boards/{boardId}`

### 4.3 게시판 생성 (관리자 전용)
**POST** `/boards`

### 4.4 게시판 수정 (관리자 전용)
**PUT** `/boards/{boardId}`

### 4.5 게시판 삭제 (관리자 전용)
**DELETE** `/boards/{boardId}`

## 5. 카테고리 API

### 5.1 게시판별 카테고리 목록
**GET** `/boards/{boardId}/categories`

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "일상",
        "description": "일상적인 이야기",
        "color": "#FF6B6B",
        "icon": "home",
        "postCount": 45,
        "isActive": true
      }
    ]
  }
}
```

### 5.2 카테고리 생성 (관리자 전용)
**POST** `/boards/{boardId}/categories`

### 5.3 카테고리 수정 (관리자 전용)
**PUT** `/categories/{categoryId}`

### 5.4 카테고리 삭제 (관리자 전용)
**DELETE** `/categories/{categoryId}`

## 6. 게시글 API

### 6.1 게시글 목록 조회
**GET** `/boards/{boardId}/posts`

**Query Parameters:**
- `categoryId`: 카테고리 ID 필터
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20, 최대: 50)
- `sortBy`: 정렬 기준 (`created`, `viewCount`, `likeCount`, `commentCount`)
- `sortOrder`: 정렬 방향 (`asc`, `desc`) - 기본값: `desc`
- `search`: 검색어 (제목+내용)
- `author`: 작성자 닉네임 검색
- `startDate`: 시작일 (YYYY-MM-DD)
- `endDate`: 종료일 (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "게시판 사용법 안내",
        "summary": "게시판을 처음 사용하시는 분들을 위한...",
        "author": {
          "id": 1,
          "nickname": "관리자",
          "level": 99
        },
        "category": {
          "id": 1,
          "name": "중요공지"
        },
        "isNotice": true,
        "isSecret": false,
        "viewCount": 1250,
        "likeCount": 25,
        "commentCount": 8,
        "attachmentCount": 1,
        "createdAt": "2024-01-15T10:30:00Z",
        "lastCommentedAt": "2024-01-15T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 6.2 게시글 상세 조회
**GET** `/posts/{postId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": 1,
      "boardId": 1,
      "categoryId": 1,
      "title": "게시판 사용법 안내",
      "content": "<p>게시판을 처음 사용하시는 분들을 위한 상세한 사용법입니다...</p>",
      "author": {
        "id": 1,
        "nickname": "관리자",
        "level": 99,
        "profileImageUrl": "https://..."
      },
      "isNotice": true,
      "isSecret": false,
      "viewCount": 1251,
      "likeCount": 25,
      "commentCount": 8,
      "attachments": [
        {
          "id": 1,
          "filename": "guide.pdf",
          "fileSize": 2048576,
          "fileType": "DOCUMENT",
          "downloadUrl": "https://..."
        }
      ],
      "userLiked": false,
      "userBookmarked": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 6.3 게시글 생성
**POST** `/boards/{boardId}/posts`

**Request Body:**
```json
{
  "categoryId": 1,
  "title": "새로운 게시글",
  "content": "<p>게시글 내용입니다.</p>",
  "isSecret": false,
  "password": null,
  "attachments": [
    {
      "filename": "image.jpg",
      "fileData": "base64-encoded-data",
      "mimeType": "image/jpeg"
    }
  ]
}
```

### 6.4 게시글 수정
**PUT** `/posts/{postId}`

### 6.5 게시글 삭제
**DELETE** `/posts/{postId}`

### 6.6 게시글 검색
**GET** `/search/posts`

**Query Parameters:**
- `query`: 검색어 (필수)
- `boardId`: 특정 게시판 내 검색
- `categoryId`: 특정 카테고리 내 검색
- `searchIn`: 검색 범위 (`title`, `content`, `author`) - 다중 선택 가능

## 7. 댓글 API

### 7.1 게시글별 댓글 목록
**GET** `/posts/{postId}/comments`

**Query Parameters:**
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수
- `sortBy`: 정렬 기준 (`created`, `likeCount`)
- `includeReplies`: 대댓글 포함 여부 (기본값: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "좋은 정보 감사합니다!",
        "author": {
          "id": 2,
          "nickname": "사용자1",
          "level": 5
        },
        "isSecret": false,
        "likeCount": 3,
        "depth": 0,
        "replies": [
          {
            "id": 2,
            "content": "동의합니다!",
            "author": {
              "id": 3,
              "nickname": "사용자2",
              "level": 3
            },
            "parentId": 1,
            "depth": 1,
            "likeCount": 1,
            "createdAt": "2024-01-15T11:00:00Z"
          }
        ],
        "userLiked": false,
        "createdAt": "2024-01-15T10:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalCount": 15,
      "totalPages": 1
    }
  }
}
```

### 7.2 댓글 생성
**POST** `/posts/{postId}/comments`

**Request Body:**
```json
{
  "content": "댓글 내용입니다.",
  "parentId": null,  // null이면 일반 댓글, 값이 있으면 대댓글
  "isSecret": false
}
```

### 7.3 댓글 수정
**PUT** `/comments/{commentId}`

### 7.4 댓글 삭제
**DELETE** `/comments/{commentId}`

## 8. 상호작용 API

### 8.1 게시글 좋아요
**POST** `/posts/{postId}/like`

**Request Body:**
```json
{
  "type": "LIKE"  // 또는 "DISLIKE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 26
  }
}
```

### 8.2 게시글 좋아요 취소
**DELETE** `/posts/{postId}/like`

### 8.3 댓글 좋아요
**POST** `/comments/{commentId}/like`

### 8.4 댓글 좋아요 취소
**DELETE** `/comments/{commentId}/like`

### 8.5 북마크 추가
**POST** `/posts/{postId}/bookmark`

### 8.6 북마크 제거
**DELETE** `/posts/{postId}/bookmark`

### 8.7 북마크 목록 조회
**GET** `/users/{userId}/bookmarks`

## 9. 첨부파일 API

### 9.1 첨부파일 다운로드
**GET** `/attachments/{attachmentId}/download`

### 9.2 첨부파일 삭제
**DELETE** `/posts/{postId}/attachments/{attachmentId}`

## 10. 신고 API

### 10.1 콘텐츠 신고
**POST** `/reports`

**Request Body:**
```json
{
  "targetType": "POST",  // "POST", "COMMENT", "USER"
  "targetId": 123,
  "reason": "INAPPROPRIATE",
  "description": "부적절한 내용에 대한 상세 설명"
}
```

### 10.2 신고 목록 조회 (관리자 전용)
**GET** `/reports`

**Query Parameters:**
- `status`: 신고 상태 필터 (`PENDING`, `REVIEWED`, etc.)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

## 11. 통계 API

### 11.1 게시판 통계
**GET** `/boards/{boardId}/statistics`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPosts": 1250,
    "publishedPosts": 1200,
    "postsToday": 15,
    "postsThisWeek": 89,
    "totalComments": 3400,
    "activeUsers": 234,
    "topCategories": [
      {
        "categoryId": 1,
        "name": "일상",
        "postCount": 450
      }
    ]
  }
}
```

### 11.2 인기 게시글 조회
**GET** `/popular/posts`

**Query Parameters:**
- `period`: 기간 (`day`, `week`, `month`) - 기본값: `week`
- `limit`: 조회 개수 - 기본값: 10

## 12. 사용자 API

### 12.1 사용자 프로필 조회
**GET** `/users/{userId}/profile`

### 12.2 사용자 프로필 수정
**PUT** `/users/profile`

### 12.3 사용자의 게시글 목록
**GET** `/users/{userId}/posts`

### 12.4 사용자의 댓글 목록
**GET** `/users/{userId}/comments`

### 12.5 사용자 활동 통계
**GET** `/users/{userId}/activity`

## 13. 관리자 API

### 13.1 사용자 관리
**GET** `/admin/users`

**PUT** `/admin/users/{userId}/status`

### 13.2 게시글 관리
**PUT** `/admin/posts/{postId}/status`

### 13.3 댓글 관리
**PUT** `/admin/comments/{commentId}/status`

### 13.4 신고 처리
**PUT** `/admin/reports/{reportId}/process`

## 14. 에러 코드

| 코드 | HTTP 상태 | 설명 |
|------|-----------|------|
| `VALIDATION_ERROR` | 400 | 요청 데이터 유효성 오류 |
| `UNAUTHORIZED` | 401 | 인증 실패 |
| `FORBIDDEN` | 403 | 권한 없음 (읽기/쓰기/관리 권한) |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `CONFLICT` | 409 | 리소스 충돌 (중복 좋아요 등) |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 한도 초과 |
| `INTERNAL_SERVER_ERROR` | 500 | 서버 내부 오류 |

## 15. API 제한 및 최적화

### 15.1 Rate Limiting
- **일반 사용자**: 1000회/시간
- **관리자**: 5000회/시간
- **헤더**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 15.2 캐싱
- **게시글 목록**: 5분 캐시
- **게시글 상세**: 1분 캐시
- **통계 데이터**: 10분 캐시

### 15.3 압축
- **응답 압축**: gzip 지원
- **Accept-Encoding**: `gzip, deflate`

### 15.4 페이징
- **기본 limit**: 20개
- **최대 limit**: 50개
- **커서 기반 페이징**: 고성능 요구 시 사용

## 16. API 버전 관리

- **현재 버전**: v1
- **버전 헤더**: `Accept: application/vnd.board-system.v1+json`
- **하위 호환성**: 유지 (새 필드 추가 시 null 허용)
- **마이그레이션**: 새로운 메이저 버전 출시 시 6개월 유예 기간

## 17. 실시간 기능 (WebSocket)

### 17.1 실시간 알림
```javascript
// WebSocket 연결
const ws = new WebSocket('wss://api.board-system.com/v1/ws');

// 새 댓글 알림
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'NEW_COMMENT') {
    // 알림 표시
  }
};
```

### 17.2 지원 이벤트
- `NEW_POST`: 새 게시글 작성
- `NEW_COMMENT`: 새 댓글 작성
- `POST_LIKED`: 게시글 좋아요
- `USER_ONLINE`: 사용자 온라인 상태
