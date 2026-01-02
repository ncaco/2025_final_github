# 게시판 시스템 API 문서

## 개요

게시판 시스템은 사용자들이 게시글을 작성하고, 댓글을 달고, 서로 소통할 수 있는 완전한 게시판 플랫폼을 제공합니다.

### 주요 기능
- 게시판 및 카테고리 관리
- 게시글 CRUD (생성, 조회, 수정, 삭제)
- 댓글 시스템 (계층형 댓글 지원)
- 좋아요/북마크 기능
- 태그 시스템
- 검색 기능
- 신고 시스템
- 팔로우 시스템
- 알림 시스템
- 사용자 설정 관리

### 기술 스택
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT Token
- **Documentation**: Swagger/OpenAPI

## 인증 방식

모든 API 요청은 JWT 토큰을 통한 인증이 필요합니다.

### 헤더 형식
```
Authorization: Bearer {jwt_token}
```

### 토큰 획득
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

## 서버 실행 및 접근

### 로컬 개발 서버 시작
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### API 문서 접근
- **Swagger UI**: `http://localhost:8000/docs` (대화형 API 테스트)
- **ReDoc**: `http://localhost:8000/redoc` (문서 형식)
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

### 서버 상태 확인
```bash
curl http://localhost:8000/
# 응답: {"message": "2026 Challenge Project Backend API", "version": "1.0.0", "docs": "/docs"}
```

## API 엔드포인트

### 기본 정보
- **Base URL**: `http://localhost:8000`
- **API Prefix**: `/api/v1`
- **응답 형식**: JSON
- **인코딩**: UTF-8
- **Rate Limiting**: 없음 (개발 환경)

---

## 1. 게시판 관리 API

게시판 및 카테고리의 생성, 조회, 수정, 삭제를 관리합니다.

### 1.1 게시판 생성
```http
POST /api/v1/boards/boards
Authorization: Bearer {token}
Content-Type: application/json

{
  "nm": "자유게시판",
  "dsc": "자유롭게 이야기하는 곳입니다",
  "typ": "GENERAL",
  "read_permission": "ALL",
  "write_permission": "USER",
  "comment_permission": "USER",
  "allow_attachment": true,
  "allow_image": true,
  "max_file_size": 10,
  "sort_order": 1
}
```

**권한**: 관리자
**응답**:
```json
{
  "id": 1,
  "nm": "자유게시판",
  "dsc": "자유롭게 이야기하는 곳입니다",
  "typ": "GENERAL",
  "actv_yn": true,
  "read_permission": "ALL",
  "write_permission": "USER",
  "comment_permission": "USER",
  "allow_attachment": true,
  "allow_image": true,
  "max_file_size": 10,
  "sort_order": 1,
  "post_count": 0,
  "crt_dt": "2024-01-01T00:00:00Z",
  "upd_dt": null,
  "use_yn": true
}
```

### 1.2 게시판 목록 조회
```http
GET /api/v1/boards/boards?skip=0&limit=20
```

**응답**:
```json
[
  {
    "id": 1,
    "nm": "공지사항",
    "dsc": "중요한 공지사항을 게시하는 곳입니다",
    "typ": "NOTICE",
    "actv_yn": true,
    "read_permission": "ALL",
    "write_permission": "ADMIN",
    "comment_permission": "USER",
    "allow_attachment": true,
    "allow_image": true,
    "max_file_size": 10,
    "sort_order": 1,
    "post_count": 15,
    "crt_dt": "2024-01-01T00:00:00Z",
    "upd_dt": null,
    "use_yn": true
  }
]
```

### 1.3 게시판별 카테고리 조회
```http
GET /api/v1/boards/boards/{board_id}/categories
```

**응답**:
```json
[
  {
    "id": 1,
    "board_id": 1,
    "nm": "일반공지",
    "dsc": "일반적인 공지사항",
    "color": "#FF5733",
    "icon": "📢",
    "sort_order": 1,
    "post_count": 8,
    "actv_yn": true,
    "crt_dt": "2024-01-01T00:00:00Z",
    "upd_dt": null,
    "use_yn": true
  }
]
```

---

## 2. 게시글 관리 API

게시글의 생성, 조회, 수정, 삭제 및 관련 기능을 제공합니다.

### 2.1 게시글 생성
```http
POST /api/v1/boards/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "board_id": 1,
  "category_id": 1,
  "ttl": "게시글 제목",
  "cn": "게시글 내용입니다...",
  "smmry": "게시글 요약",
  "ntce_yn": false,
  "scr_yn": false,
  "tags": ["질문", "프로그래밍"]
}
```

**응답**:
```json
{
  "id": 1,
  "board_id": 1,
  "category_id": 1,
  "user_id": "user123",
  "ttl": "게시글 제목",
  "cn": "게시글 내용입니다...",
  "smmry": "게시글 요약",
  "stts": "PUBLISHED",
  "ntce_yn": false,
  "scr_yn": false,
  "vw_cnt": 0,
  "lk_cnt": 0,
  "cmt_cnt": 0,
  "att_cnt": 0,
  "pbl_dt": "2024-01-01T10:00:00Z",
  "crt_dt": "2024-01-01T10:00:00Z",
  "upd_dt": null,
  "use_yn": true,
  "author_nickname": "사용자닉네임",
  "category_nm": "일반공지"
}
```

### 2.2 게시글 목록 조회
```http
GET /api/v1/boards/posts?board_id=1&category_id=1&status=PUBLISHED&search_query=프로그래밍&page=1&limit=10
```

**쿼리 파라미터**:
- `board_id`: 게시판 ID (필수)
- `category_id`: 카테고리 ID (선택)
- `status`: 게시글 상태 (PUBLISHED, DRAFT, etc.)
- `search_query`: 검색어 (제목, 내용, 작성자)
- `page`: 페이지 번호
- `limit`: 페이지당 항목 수

**응답**:
```json
{
  "posts": [
    {
      "id": 1,
      "ttl": "프로그래밍 질문",
      "author_nickname": "개발자",
      "category_nm": "프로그래밍",
      "vw_cnt": 25,
      "lk_cnt": 5,
      "cmt_cnt": 3,
      "crt_dt": "2024-01-01T10:00:00Z"
    }
  ],
  "total_count": 45,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

### 2.3 게시글 상세 조회
```http
GET /api/v1/boards/posts/{post_id}
Authorization: Bearer {token}
```

**응답**:
```json
{
  "id": 1,
  "board_id": 1,
  "category_id": 1,
  "user_id": "user123",
  "ttl": "게시글 제목",
  "cn": "게시글 내용입니다...",
  "smmry": "게시글 요약",
  "stts": "PUBLISHED",
  "ntce_yn": false,
  "scr_yn": false,
  "vw_cnt": 26,
  "lk_cnt": 5,
  "cmt_cnt": 3,
  "att_cnt": 1,
  "pbl_dt": "2024-01-01T10:00:00Z",
  "crt_dt": "2024-01-01T10:00:00Z",
  "upd_dt": null,
  "use_yn": true,
  "author_nickname": "사용자닉네임",
  "category_nm": "일반공지",
  "tags": ["질문", "프로그래밍"],
  "attachments": [
    {
      "id": 1,
      "post_id": 1,
      "user_id": "user123",
      "orgnl_file_nm": "example.jpg",
      "file_url": "https://example.com/files/example.jpg",
      "file_sz": 1024000,
      "mime_typ": "image/jpeg",
      "file_typ": "IMAGE",
      "dwld_cnt": 0,
      "crt_dt": "2024-01-01T10:00:00Z",
      "use_yn": true
    }
  ],
  "is_liked": true,
  "is_bookmarked": false
}
```

### 2.4 게시글 좋아요 토글
```http
POST /api/v1/boards/posts/{post_id}/like
Authorization: Bearer {token}
Content-Type: application/json

{
  "typ": "LIKE"
}
```

### 2.5 게시글 북마크 토글
```http
POST /api/v1/boards/posts/{post_id}/bookmark
Authorization: Bearer {token}
```

---

## 3. 댓글 관리 API

### 3.1 댓글 생성
```http
POST /api/v1/boards/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "post_id": 1,
  "cn": "댓글 내용입니다",
  "parent_id": null,
  "scr_yn": false
}
```

### 3.2 게시글별 댓글 목록 조회
```http
GET /api/v1/boards/posts/{post_id}/comments
Authorization: Bearer {token}
```

**응답**:
```json
[
  {
    "id": 1,
    "post_id": 1,
    "user_id": "user123",
    "parent_id": null,
    "cn": "댓글 내용입니다",
    "stts": "PUBLISHED",
    "scr_yn": false,
    "lk_cnt": 2,
    "depth": 0,
    "sort_order": 0,
    "crt_dt": "2024-01-01T10:30:00Z",
    "upd_dt": null,
    "use_yn": true,
    "author_nickname": "사용자닉네임",
    "is_liked": false,
    "children": []
  }
]
```

---

## 4. 신고 시스템 API

### 4.1 콘텐츠 신고
```http
POST /api/v1/board-extra/reports
Authorization: Bearer {token}
Content-Type: application/json

{
  "target_type": "POST",
  "target_id": 1,
  "rsn": "SPAM",
  "dsc": "스팸 게시글입니다"
}
```

**신고 사유**: `SPAM`, `ABUSE`, `INAPPROPRIATE`, `COPYRIGHT`, `OTHER`

### 4.2 신고 목록 조회 (관리자용)
```http
GET /api/v1/board-extra/reports?status=PENDING
Authorization: Bearer {admin_token}
```

---

## 5. 팔로우 시스템 API

### 5.1 팔로우 추가
```http
POST /api/v1/board-extra/follow
Authorization: Bearer {token}
Content-Type: application/json

{
  "following_id": "user456",
  "typ": "USER"
}
```

### 5.2 팔로워 목록 조회
```http
GET /api/v1/board-extra/follow/followers/{user_id}
Authorization: Bearer {token}
```

### 5.3 팔로잉 목록 조회
```http
GET /api/v1/board-extra/follow/following/{user_id}
Authorization: Bearer {token}
```

---

## 6. 알림 시스템 API

### 6.1 알림 목록 조회
```http
GET /api/v1/board-extra/notifications?is_read=false
Authorization: Bearer {token}
```

**응답**:
```json
[
  {
    "id": 1,
    "user_id": "user123",
    "typ": "NEW_COMMENT",
    "ttl": "새로운 댓글이 달렸습니다",
    "msg": "귀하의 게시글에 새로운 댓글이 달렸습니다",
    "is_read": false,
    "related_post_id": 1,
    "related_comment_id": 5,
    "related_user_id": "user456",
    "noti_metadata": {
      "comment_content": "좋은 글이네요!"
    },
    "crt_dt": "2024-01-01T11:00:00Z"
  }
]
```

### 6.2 알림 읽음 처리
```http
PUT /api/v1/board-extra/notifications/{notification_id}/read
Authorization: Bearer {token}
```

---

## 7. 태그 시스템 API

### 7.1 태그 목록 조회
```http
GET /api/v1/board-extra/tags?search=프로그래밍
```

### 7.2 인기 태그 조회
```http
GET /api/v1/board-extra/tags/popular?limit=10
```

### 7.3 게시글 태그 조회
```http
GET /api/v1/board-extra/posts/{post_id}/tags
```

---

## 8. 검색 API

### 8.1 게시글 검색
```http
GET /api/v1/boards/search?query=프로그래밍&board_id=1&page=1&limit=10
```

**응답**:
```json
{
  "posts": [
    {
      "id": 1,
      "ttl": "프로그래밍 질문",
      "author_nickname": "개발자",
      "vw_cnt": 25,
      "lk_cnt": 5,
      "cmt_cnt": 3,
      "crt_dt": "2024-01-01T10:00:00Z"
    }
  ],
  "total_count": 12,
  "page": 1,
  "limit": 10,
  "total_pages": 2
}
```

---

## 9. 통계 및 분석 API

### 9.1 인기 게시글 조회
```http
GET /api/v1/boards/statistics/popular-posts?limit=5
```

**응답**:
```json
[
  {
    "id": 1,
    "ttl": "핫한 토픽",
    "vw_cnt": 150,
    "lk_cnt": 25,
    "cmt_cnt": 10,
    "author_nickname": "인기작가",
    "board_nm": "자유게시판",
    "crt_dt": "2024-01-01T10:00:00Z",
    "popularity_score": 400
  }
]
```

### 9.2 게시판별 통계
```http
GET /api/v1/boards/statistics/boards
```

---

## 10. 사용자 설정 API

### 10.1 사용자 설정 조회
```http
GET /api/v1/board-extra/user/preferences
Authorization: Bearer {token}
```

### 10.2 사용자 설정 저장
```http
POST /api/v1/board-extra/user/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "pref_key": "theme",
  "pref_val": "dark"
}
```

---

## 에러 코드

### 공통 HTTP 상태 코드
- `200`: 성공
- `201`: 생성됨
- `400`: 잘못된 요청
- `401`: 인증 필요
- `403`: 권한 없음
- `404`: 리소스 없음
- `422`: 검증 오류
- `500`: 서버 오류

### 비즈니스 로직 에러
```json
{
  "detail": "이미 존재하는 게시판 이름입니다"
}
```

### 자주 발생하는 에러
- **게시판을 찾을 수 없습니다**: 존재하지 않는 게시판 ID
- **게시글을 수정할 권한이 없습니다**: 작성자나 관리자가 아님
- **이미 신고한 콘텐츠입니다**: 중복 신고 시도
- **비활성화된 사용자입니다**: 차단된 사용자
- **관리자 권한이 필요합니다**: 관리자 전용 기능 접근

## 사용 예시

### 게시글 작성부터 조회까지
```bash
# 1. 게시글 작성
curl -X POST "http://localhost:8000/api/v1/boards/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "board_id": 1,
    "ttl": "안녕하세요!",
    "cn": "첫 게시글입니다.",
    "tags": ["인사", "첫글"]
  }'

# 2. 게시글 목록 조회
curl -X GET "http://localhost:8000/api/v1/boards/posts?board_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. 게시글 상세 조회
curl -X GET "http://localhost:8000/api/v1/boards/posts/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. 댓글 작성
curl -X POST "http://localhost:8000/api/v1/boards/comments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": 1,
    "cn": "좋은 글이네요!"
  }'
```

## SDK 및 클라이언트

### JavaScript/TypeScript 클라이언트
```javascript
// API 클라이언트 예시
class BoardAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async getPosts(boardId, params = {}) {
    const query = new URLSearchParams({ board_id: boardId, ...params });
    const response = await fetch(`${this.baseURL}/api/v1/boards/posts?${query}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async createPost(postData) {
    const response = await fetch(`${this.baseURL}/api/v1/boards/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    return response.json();
  }
}
```

## 버전 및 변경 이력

### v1.0.0 (2024-01-01)
- 게시판 시스템 초기 릴리즈
- 기본 CRUD 기능 구현
- 인증 및 권한 시스템
- 검색 및 필터링 기능

### 예정 기능
- 실시간 알림 (WebSocket)
- 파일 업로드 개선
- 고급 검색 (Elasticsearch 연동)
- API 속도 제한
- 캐싱 시스템

## 지원 및 문의

API 사용 중 문제가 발생하거나 개선사항이 있으시면 다음 채널을 이용해주세요:

- **이슈 트래커**: GitHub Issues
- **문서**: 이 문서를 참고해주세요
- **API 테스트**: `http://localhost:8000/docs` (Swagger UI)

---

*이 문서는 FastAPI의 자동 생성 문서와 함께 사용하여 더 자세한 API 스펙을 확인할 수 있습니다.*
