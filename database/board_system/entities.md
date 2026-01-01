# 게시판 엔티티 및 관계 설계

## 1. 개요
게시판 시스템의 데이터 모델을 설계하여 엔티티 간 관계를 정의합니다.

## 2. 주요 엔티티 정의

### 2.1 User (사용자)
사용자의 기본 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 사용자 고유 식별자
- `username`: VARCHAR(50), UNIQUE, NOT NULL - 사용자 아이디
- `email`: VARCHAR(255), UNIQUE, NOT NULL - 이메일 주소
- `password_hash`: VARCHAR(255), NOT NULL - 암호화된 비밀번호
- `nickname`: VARCHAR(50), UNIQUE, NOT NULL - 표시 이름
- `profile_image_url`: VARCHAR(500) - 프로필 이미지 URL
- `user_level`: INT, DEFAULT 1 - 사용자 등급 (1: 일반, 2: 우수, 3: VIP, 99: 관리자)
- `status`: ENUM('ACTIVE', 'INACTIVE', 'BANNED'), DEFAULT 'ACTIVE' - 계정 상태
- `email_verified`: BOOLEAN, DEFAULT FALSE - 이메일 인증 여부
- `last_login_at`: TIMESTAMP - 마지막 로그인 시간
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시

### 2.2 Board (게시판)
게시판의 기본 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 게시판 고유 식별자
- `name`: VARCHAR(100), NOT NULL - 게시판 이름
- `description`: TEXT - 게시판 설명
- `type`: ENUM('GENERAL', 'NOTICE', 'QNA', 'IMAGE', 'VIDEO') - 게시판 유형
- `is_active`: BOOLEAN, DEFAULT TRUE - 게시판 활성화 상태
- `read_permission`: ENUM('ALL', 'USER', 'ADMIN'), DEFAULT 'ALL' - 읽기 권한
- `write_permission`: ENUM('ALL', 'USER', 'ADMIN'), DEFAULT 'USER' - 쓰기 권한
- `comment_permission`: ENUM('ALL', 'USER', 'ADMIN'), DEFAULT 'USER' - 댓글 권한
- `allow_attachment`: BOOLEAN, DEFAULT TRUE - 첨부파일 허용 여부
- `allow_image`: BOOLEAN, DEFAULT TRUE - 이미지 업로드 허용 여부
- `max_file_size`: INT, DEFAULT 10 - 최대 파일 크기 (MB)
- `sort_order`: INT, DEFAULT 0 - 게시판 정렬 순서
- `post_count`: INT, DEFAULT 0 - 게시글 수
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시

### 2.3 Category (카테고리)
게시글을 분류하기 위한 카테고리 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 카테고리 고유 식별자
- `board_id`: BIGINT, NOT NULL, FOREIGN KEY -> Board.id - 소속 게시판
- `name`: VARCHAR(50), NOT NULL - 카테고리 이름
- `description`: VARCHAR(200) - 카테고리 설명
- `color`: VARCHAR(7) - 카테고리 색상 (#RRGGBB)
- `icon`: VARCHAR(50) - 카테고리 아이콘
- `sort_order`: INT, DEFAULT 0 - 정렬 순서
- `is_active`: BOOLEAN, DEFAULT TRUE - 카테고리 활성화 상태
- `post_count`: INT, DEFAULT 0 - 카테고리 내 게시글 수
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시

**제약조건:**
- 동일 게시판 내 카테고리명 중복 불가

### 2.4 Post (게시글)
개별 게시글의 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 게시글 고유 식별자
- `board_id`: BIGINT, NOT NULL, FOREIGN KEY -> Board.id - 소속 게시판
- `category_id`: BIGINT, FOREIGN KEY -> Category.id - 카테고리
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 작성자
- `title`: VARCHAR(200), NOT NULL - 게시글 제목
- `content`: TEXT, NOT NULL - 게시글 내용 (HTML/Markdown)
- `summary`: VARCHAR(300) - 게시글 요약 (검색용)
- `status`: ENUM('PUBLISHED', 'DRAFT', 'DELETED', 'HIDDEN'), DEFAULT 'PUBLISHED' - 게시글 상태
- `is_notice`: BOOLEAN, DEFAULT FALSE - 공지사항 여부
- `is_secret`: BOOLEAN, DEFAULT FALSE - 비밀글 여부
- `password`: VARCHAR(255) - 비밀글 비밀번호 (해시)
- `view_count`: INT, DEFAULT 0 - 조회수
- `like_count`: INT, DEFAULT 0 - 좋아요 수
- `comment_count`: INT, DEFAULT 0 - 댓글 수
- `attachment_count`: INT, DEFAULT 0 - 첨부파일 수
- `last_commented_at`: TIMESTAMP - 마지막 댓글 작성 시간
- `published_at`: TIMESTAMP - 게시 시간
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시

### 2.5 Comment (댓글)
게시글에 대한 댓글 및 대댓글을 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 댓글 고유 식별자
- `post_id`: BIGINT, NOT NULL, FOREIGN KEY -> Post.id - 소속 게시글
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 작성자
- `parent_id`: BIGINT, FOREIGN KEY -> Comment.id - 부모 댓글 (대댓글용)
- `content`: TEXT, NOT NULL - 댓글 내용
- `status`: ENUM('PUBLISHED', 'DELETED', 'HIDDEN'), DEFAULT 'PUBLISHED' - 댓글 상태
- `is_secret`: BOOLEAN, DEFAULT FALSE - 비밀 댓글 여부
- `like_count`: INT, DEFAULT 0 - 좋아요 수
- `depth`: INT, DEFAULT 0 - 댓글 깊이 (0: 댓글, 1+: 대댓글)
- `sort_order`: INT, DEFAULT 0 - 정렬 순서
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `updated_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - 수정 일시

### 2.6 Attachment (첨부파일)
게시글에 첨부된 파일 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 첨부파일 고유 식별자
- `post_id`: BIGINT, NOT NULL, FOREIGN KEY -> Post.id - 소속 게시글
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 업로드자
- `original_filename`: VARCHAR(255), NOT NULL - 원본 파일명
- `stored_filename`: VARCHAR(255), NOT NULL - 저장된 파일명
- `file_path`: VARCHAR(500), NOT NULL - 파일 경로
- `file_url`: VARCHAR(500), NOT NULL - 파일 URL
- `file_size`: BIGINT, NOT NULL - 파일 크기 (bytes)
- `mime_type`: VARCHAR(100), NOT NULL - MIME 타입
- `file_type`: ENUM('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER') - 파일 유형
- `download_count`: INT, DEFAULT 0 - 다운로드 횟수
- `is_deleted`: BOOLEAN, DEFAULT FALSE - 삭제 여부
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 업로드 일시

### 2.7 PostLike (게시글 좋아요)
사용자의 게시글 좋아요 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 좋아요 고유 식별자
- `post_id`: BIGINT, NOT NULL, FOREIGN KEY -> Post.id - 대상 게시글
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 좋아요 사용자
- `type`: ENUM('LIKE', 'DISLIKE'), DEFAULT 'LIKE' - 평가 유형
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시

**제약조건:**
- 동일 사용자-게시글 조합에 대한 중복 좋아요 방지

### 2.8 CommentLike (댓글 좋아요)
사용자의 댓글 좋아요 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 좋아요 고유 식별자
- `comment_id`: BIGINT, NOT NULL, FOREIGN KEY -> Comment.id - 대상 댓글
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 좋아요 사용자
- `type`: ENUM('LIKE', 'DISLIKE'), DEFAULT 'LIKE' - 평가 유형
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시

**제약조건:**
- 동일 사용자-댓글 조합에 대한 중복 좋아요 방지

### 2.9 Bookmark (북마크)
사용자의 북마크 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 북마크 고유 식별자
- `post_id`: BIGINT, NOT NULL, FOREIGN KEY -> Post.id - 북마크한 게시글
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 북마크 사용자
- `created_at`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 북마크 일시

**제약조건:**
- 동일 사용자-게시글 조합에 대한 중복 북마크 방지

### 2.10 Report (신고)
부적절한 콘텐츠 신고 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 신고 고유 식별자
- `reporter_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 신고자
- `target_type`: ENUM('POST', 'COMMENT', 'USER') - 신고 대상 유형
- `target_id`: BIGINT, NOT NULL - 신고 대상 ID
- `rsn`: ENUM('SPAM', 'ABUSE', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER') - 신고 사유
- `dsc`: TEXT - 신고 상세 설명
- `stts`: ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'), DEFAULT 'PENDING' - 처리 상태
- `processed_by`: BIGINT, FOREIGN KEY -> User.id - 처리자
- `prcs_dt`: TIMESTAMP - 처리 일시
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 신고 일시

### 2.11 Notification (알림)
사용자에게 보내는 알림 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 알림 고유 식별자
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 수신자
- `typ`: ENUM('NEW_COMMENT', 'NEW_LIKE', 'NEW_FOLLOW', 'POST_MENTION', 'COMMENT_MENTION', 'ADMIN_NOTICE') - 알림 유형
- `ttl`: VARCHAR(200), NOT NULL - 알림 제목
- `msg`: TEXT - 알림 메시지
- `is_read`: BOOLEAN, DEFAULT FALSE - 읽음 상태
- `related_post_id`: BIGINT, FOREIGN KEY -> Post.id - 관련 게시글
- `related_comment_id`: BIGINT, FOREIGN KEY -> Comment.id - 관련 댓글
- `related_user_id`: BIGINT, FOREIGN KEY -> User.id - 관련 사용자
- `metadata`: JSONB - 추가 메타데이터
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시

### 2.12 Tag (태그)
게시글 분류를 위한 태그 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 태그 고유 식별자
- `nm`: VARCHAR(50), UNIQUE, NOT NULL - 태그 이름
- `dsc`: VARCHAR(200) - 태그 설명
- `color`: VARCHAR(7) - 태그 색상 (#RRGGBB)
- `usage_cnt`: INT, DEFAULT 0 - 사용 횟수
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시

### 2.13 PostTag (게시글 태그 매핑)
게시글과 태그의 다대다 관계를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 매핑 고유 식별자
- `post_id`: BIGINT, NOT NULL, FOREIGN KEY -> Post.id - 게시글 ID
- `tag_id`: BIGINT, NOT NULL, FOREIGN KEY -> Tag.id - 태그 ID
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 매핑 일시

**제약조건:**
- 동일 게시글-태그 조합에 대한 중복 매핑 방지

### 2.14 Follow (팔로우)
사용자 간 팔로우 관계를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 팔로우 고유 식별자
- `follower_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 팔로우하는 사용자
- `following_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 팔로우 당하는 사용자
- `typ`: ENUM('USER', 'BOARD'), DEFAULT 'USER' - 팔로우 유형
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 팔로우 일시

**제약조건:**
- 동일 사용자 조합에 대한 중복 팔로우 방지

### 2.15 ActivityLog (활동 로그)
사용자의 모든 활동을 기록하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 로그 고유 식별자
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 활동 사용자
- `act_typ`: ENUM('LOGIN', 'LOGOUT', 'POST_CREATE', 'POST_UPDATE', 'POST_DELETE', 'COMMENT_CREATE', 'COMMENT_DELETE', 'LIKE', 'BOOKMARK', 'REPORT') - 활동 유형
- `act_dsc`: TEXT - 활동 상세 설명
- `target_typ`: VARCHAR(50) - 대상 유형 (POST, COMMENT, BOARD 등)
- `target_id`: BIGINT - 대상 ID
- `ip_addr`: INET - IP 주소
- `user_agent`: TEXT - 사용자 에이전트
- `metadata`: JSONB - 추가 메타데이터
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 활동 일시

### 2.16 PostHistory (게시글 히스토리)
게시글의 수정 이력을 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 히스토리 고유 식별자
- `post_id`: BIGINT, NOT NULL, FOREIGN KEY -> Post.id - 대상 게시글
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 수정자
- `prev_ttl`: VARCHAR(200) - 이전 제목
- `new_ttl`: VARCHAR(200) - 새 제목
- `prev_cn`: TEXT - 이전 내용
- `new_cn`: TEXT - 새 내용
- `change_typ`: ENUM('CREATE', 'UPDATE', 'DELETE'), DEFAULT 'UPDATE' - 변경 유형
- `change_rsn`: TEXT - 변경 사유
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 변경 일시

### 2.17 UserPreference (사용자 설정)
사용자의 개인화 설정을 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 설정 고유 식별자
- `user_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 사용자
- `pref_key`: VARCHAR(100), NOT NULL - 설정 키
- `pref_val`: TEXT - 설정 값
- `upd_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 수정 일시

**제약조건:**
- 동일 사용자-설정키 조합에 대한 중복 설정 방지

### 2.18 SearchLog (검색 로그)
사용자의 검색 활동을 기록하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 로그 고유 식별자
- `user_id`: BIGINT, FOREIGN KEY -> User.id - 검색 사용자 (비로그인 시 NULL)
- `search_query`: TEXT, NOT NULL - 검색어
- `search_typ`: VARCHAR(50) - 검색 유형 (TITLE, CONTENT, AUTHOR, TAG 등)
- `result_cnt`: INT, DEFAULT 0 - 검색 결과 수
- `ip_addr`: INET - IP 주소
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 검색 일시

### 2.19 AdminLog (관리자 로그)
관리자의 작업을 기록하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 로그 고유 식별자
- `admin_id`: BIGINT, NOT NULL, FOREIGN KEY -> User.id - 관리자
- `act_typ`: ENUM('USER_BAN', 'USER_UNBAN', 'POST_HIDE', 'POST_SHOW', 'COMMENT_HIDE', 'COMMENT_SHOW', 'REPORT_RESOLVE', 'BOARD_CREATE', 'BOARD_UPDATE', 'BOARD_DELETE') - 작업 유형
- `act_dsc`: TEXT - 작업 상세 설명
- `target_typ`: VARCHAR(50) - 대상 유형
- `target_id`: BIGINT - 대상 ID
- `old_val`: JSONB - 이전 값
- `new_val`: JSONB - 새 값
- `ip_addr`: INET - IP 주소
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 작업 일시

### 2.20 Statistic (통계)
각종 통계 데이터를 저장하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 통계 고유 식별자
- `stat_typ`: VARCHAR(50), NOT NULL - 통계 유형 (BOARD_STATS, USER_STATS 등)
- `stat_key`: VARCHAR(100), NOT NULL - 통계 키
- `stat_val`: BIGINT, DEFAULT 0 - 통계 값
- `stat_period`: VARCHAR(20) - 기간 유형 (DAILY, WEEKLY, MONTHLY 등)
- `period_start`: DATE - 기간 시작일
- `period_end`: DATE - 기간 종료일
- `metadata`: JSONB - 추가 메타데이터
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시
- `upd_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 수정 일시

### 2.21 FileThumbnail (파일 썸네일)
이미지 파일의 썸네일 정보를 관리하는 엔티티입니다.

**속성:**
- `id`: BIGINT, PRIMARY KEY, AUTO_INCREMENT - 썸네일 고유 식별자
- `attachment_id`: BIGINT, NOT NULL, FOREIGN KEY -> Attachment.id - 원본 파일
- `thumbnail_path`: VARCHAR(500), NOT NULL - 썸네일 파일 경로
- `thumbnail_url`: VARCHAR(500), NOT NULL - 썸네일 URL
- `thumbnail_sz`: BIGINT, NOT NULL - 썸네일 파일 크기
- `width`: INT - 썸네일 너비
- `height`: INT - 썸네일 높이
- `crt_dt`: TIMESTAMP, DEFAULT CURRENT_TIMESTAMP - 생성 일시

## 3. 엔티티 관계

### 3.1 ER 다이어그램 (텍스트 표현)
```
User (1) ──── (N) Board
  │
  ├─── (N) Post (N) ──── (1) Board
  │     │         │
  │     ├─── (N) Comment
  │     │         │
  │     ├─── (N) Attachment
  │     │         │
  │     ├─── (N) PostLike
  │     │         │
  │     └─── (N) Bookmark
  │
  ├─── (N) CommentLike
  │
  └─── (N) Report
```

### 3.2 관계 상세 설명

#### User - Board (N:N, 관리자 관점)
- 사용자는 여러 게시판을 관리할 수 있음
- 게시판은 여러 관리자를 가질 수 있음 (다대다 관계로 설계 가능)

#### User - Post (1:N)
- 한 사용자는 여러 게시글을 작성할 수 있음
- 게시글은 한 명의 작성자를 가짐

#### Board - Post (1:N)
- 한 게시판은 여러 게시글을 가짐
- 게시글은 하나의 게시판에 속함

#### Board - Category (1:N)
- 한 게시판은 여러 카테고리를 가짐
- 카테고리는 하나의 게시판에 속함

#### Post - Category (N:1)
- 여러 게시글이 하나의 카테고리에 속할 수 있음
- 카테고리는 여러 게시글을 가짐

#### Post - Comment (1:N)
- 한 게시글은 여러 댓글을 가짐
- 댓글은 하나의 게시글에 속함

#### Comment - Comment (1:N, 계층 구조)
- 한 댓글은 여러 대댓글을 가짐 (parent_id를 통한 계층 구조)
- 댓글은 하나의 부모 댓글을 가질 수 있음

#### Post - Attachment (1:N)
- 한 게시글은 여러 첨부파일을 가짐
- 첨부파일은 하나의 게시글에 속함

#### User - PostLike (1:N)
- 한 사용자는 여러 게시글에 좋아요를 할 수 있음
- 좋아요는 한 명의 사용자에게 속함

#### User - CommentLike (1:N)
- 한 사용자는 여러 댓글에 좋아요를 할 수 있음
- 좋아요는 한 명의 사용자에게 속함

#### User - Bookmark (1:N)
- 한 사용자는 여러 게시글을 북마크할 수 있음
- 북마크는 한 명의 사용자에게 속함

## 4. 비즈니스 규칙

### 4.1 데이터 무결성 규칙
- 게시글 삭제 시 연관된 댓글, 첨부파일, 좋아요 등도 함께 처리
- 사용자 삭제 시 작성한 콘텐츠는 익명으로 전환하거나 삭제
- 공지사항은 일반 게시글보다 우선 정렬

### 4.2 권한 규칙
- 게시판별 읽기/쓰기/댓글 권한 설정
- 관리자는 모든 콘텐츠에 대한 수정/삭제 권한 보유
- 작성자는 자신의 콘텐츠에 대한 수정/삭제 권한 보유

### 4.3 콘텐츠 관리 규칙
- 비속어 및 부적절한 콘텐츠 자동 필터링
- 신고 누적 시 콘텐츠 자동 숨김 처리
- 조회수 중복 방지를 위한 세션 기반 카운팅

## 5. 인덱스 설계

### 5.1 성능 최적화를 위한 인덱스
- Post: (board_id, status, created_at), (user_id, created_at), (title, content)
- Comment: (post_id, created_at), (user_id, created_at)
- Attachment: (post_id), (user_id)
- PostLike: (post_id, user_id), (user_id, created_at)
- Bookmark: (user_id, created_at), (post_id)

### 5.2 복합 인덱스
- Post: (board_id, category_id, status, created_at) - 게시판+카테고리별 조회 최적화
- Post: (status, is_notice, created_at) - 공지사항 우선 정렬 최적화

## 6. 데이터 마이그레이션 고려사항

### 6.1 초기 데이터
- 기본 게시판 세트 (공지사항, 자유게시판, Q&A)
- 기본 카테고리 세트
- 시스템 관리자 계정

### 6.2 확장성 고려
- 게시판별 데이터 파티셔닝
- 첨부파일 S3 마이그레이션
- 사용자 활동 로그 아카이브
