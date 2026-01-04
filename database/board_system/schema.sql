-- 게시판 시스템 데이터베이스 스키마
-- PostgreSQL 기준으로 작성

-- 기존 객체 정리 (DROP 순서: 뷰 → 트리거 → 함수 → 테이블 → 타입)
DO $$
BEGIN
    -- 뷰 삭제
    DROP VIEW IF EXISTS bbs_user_activity_stats CASCADE;
    DROP VIEW IF EXISTS bbs_popular_posts CASCADE;
    DROP VIEW IF EXISTS bbs_board_statistics CASCADE;

    -- 트리거 삭제
    DROP TRIGGER IF EXISTS trigger_update_tag_usage_count ON bbs_post_tags CASCADE;
    DROP TRIGGER IF EXISTS trigger_update_attachment_statistics ON bbs_attachments CASCADE;
    DROP TRIGGER IF EXISTS trigger_update_comment_like_statistics ON bbs_comment_likes CASCADE;
    DROP TRIGGER IF EXISTS trigger_update_post_like_statistics ON bbs_post_likes CASCADE;
    DROP TRIGGER IF EXISTS trigger_update_comment_statistics ON bbs_comments CASCADE;
    DROP TRIGGER IF EXISTS trigger_update_post_statistics ON bbs_posts CASCADE;
    DROP TRIGGER IF EXISTS update_bbs_comments_updated_at ON bbs_comments CASCADE;
    DROP TRIGGER IF EXISTS update_bbs_posts_updated_at ON bbs_posts CASCADE;
    DROP TRIGGER IF EXISTS update_bbs_boards_updated_at ON bbs_boards CASCADE;
    -- COMMON_USER 테이블은 기존 시스템에서 관리되므로 트리거 삭제 생략

    -- 함수 삭제
    DROP FUNCTION IF EXISTS update_tag_usage_count() CASCADE;
    DROP FUNCTION IF EXISTS update_attachment_statistics() CASCADE;
    DROP FUNCTION IF EXISTS update_like_statistics() CASCADE;
    DROP FUNCTION IF EXISTS update_comment_statistics() CASCADE;
    DROP FUNCTION IF EXISTS update_post_statistics() CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    DROP FUNCTION IF EXISTS get_post_detail(BIGINT) CASCADE;
    DROP FUNCTION IF EXISTS get_posts_by_board(BIGINT, BIGINT, post_status, INT, INT, TEXT) CASCADE;
    -- current_user_level() 함수는 DDL 중간에 정의되므로 DROP 생략
    -- current_user_id() 함수는 DDL 중간에 정의되므로 DROP 생략

    -- 테이블 삭제 (참조 관계 역순)
    DROP TABLE IF EXISTS bbs_file_thumbnails CASCADE;
    DROP TABLE IF EXISTS bbs_statistics CASCADE;
    DROP TABLE IF EXISTS bbs_admin_logs CASCADE;
    DROP TABLE IF EXISTS bbs_search_logs CASCADE;
    DROP TABLE IF EXISTS bbs_user_preferences CASCADE;
    DROP TABLE IF EXISTS bbs_post_history CASCADE;
    DROP TABLE IF EXISTS bbs_activity_logs CASCADE;
    DROP TABLE IF EXISTS bbs_follows CASCADE;
    DROP TABLE IF EXISTS bbs_post_tags CASCADE;
    DROP TABLE IF EXISTS bbs_tags CASCADE;
    DROP TABLE IF EXISTS bbs_notifications CASCADE;
    DROP TABLE IF EXISTS bbs_reports CASCADE;
    DROP TABLE IF EXISTS bbs_bookmarks CASCADE;
    DROP TABLE IF EXISTS bbs_comment_likes CASCADE;
    DROP TABLE IF EXISTS bbs_post_likes CASCADE;
    DROP TABLE IF EXISTS bbs_attachments CASCADE;
    DROP TABLE IF EXISTS bbs_comments CASCADE;
    DROP TABLE IF EXISTS bbs_posts CASCADE;
    DROP TABLE IF EXISTS bbs_categories CASCADE;
    DROP TABLE IF EXISTS bbs_boards CASCADE;

    -- ENUM 타입 삭제 (정의된 역순으로 삭제)
    DROP TYPE IF EXISTS admin_action_type CASCADE;
    DROP TYPE IF EXISTS change_type CASCADE;
    DROP TYPE IF EXISTS activity_type CASCADE;
    DROP TYPE IF EXISTS follow_type CASCADE;
    DROP TYPE IF EXISTS notification_type CASCADE;
    DROP TYPE IF EXISTS report_status CASCADE;
    DROP TYPE IF EXISTS report_reason CASCADE;
    DROP TYPE IF EXISTS report_target_type CASCADE;
    DROP TYPE IF EXISTS like_type CASCADE;
    DROP TYPE IF EXISTS attachment_file_type CASCADE;
    DROP TYPE IF EXISTS comment_status CASCADE;
    DROP TYPE IF EXISTS post_status CASCADE;
    DROP TYPE IF EXISTS permission_level CASCADE;
    DROP TYPE IF EXISTS board_type CASCADE;
    DROP TYPE IF EXISTS user_status CASCADE;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Some objects could not be dropped: %', SQLERRM;
END $$;

-- ENUM 타입 정의
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
CREATE TYPE board_type AS ENUM ('GENERAL', 'NOTICE', 'QNA', 'IMAGE', 'VIDEO');
CREATE TYPE permission_level AS ENUM ('ALL', 'USER', 'ADMIN');
CREATE TYPE post_status AS ENUM ('PUBLISHED', 'DRAFT', 'DELETED', 'HIDDEN', 'SECRET');
CREATE TYPE comment_status AS ENUM ('PUBLISHED', 'DELETED', 'HIDDEN', 'SECRET');
CREATE TYPE attachment_file_type AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER');
CREATE TYPE like_type AS ENUM ('LIKE', 'DISLIKE');
CREATE TYPE report_target_type AS ENUM ('POST', 'COMMENT', 'USER');
CREATE TYPE report_reason AS ENUM ('SPAM', 'ABUSE', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- 추가 ENUM 타입 정의 (테이블 생성 전에 미리 정의)
CREATE TYPE notification_type AS ENUM ('NEW_COMMENT', 'NEW_LIKE', 'NEW_FOLLOW', 'POST_MENTION', 'COMMENT_MENTION', 'ADMIN_NOTICE');
CREATE TYPE follow_type AS ENUM ('USER', 'BOARD');
CREATE TYPE activity_type AS ENUM ('LOGIN', 'LOGOUT', 'POST_CREATE', 'POST_UPDATE', 'POST_DELETE', 'COMMENT_CREATE', 'COMMENT_DELETE', 'LIKE', 'BOOKMARK', 'REPORT');
CREATE TYPE change_type AS ENUM ('CREATE', 'UPDATE', 'DELETE');
CREATE TYPE admin_action_type AS ENUM ('USER_BAN', 'USER_UNBAN', 'POST_HIDE', 'POST_SHOW', 'COMMENT_HIDE', 'COMMENT_SHOW', 'REPORT_RESOLVE', 'BOARD_CREATE', 'BOARD_UPDATE', 'BOARD_DELETE');

-- 참고: 사용자 테이블은 기존 시스템에 존재하므로 별도 생성하지 않음

-- 게시판 테이블
CREATE TABLE bbs_boards (
    id BIGSERIAL PRIMARY KEY,
    nm VARCHAR(100) NOT NULL,
    dsc TEXT,
    typ board_type DEFAULT 'GENERAL',
    actv_yn BOOLEAN DEFAULT TRUE,
    read_permission permission_level DEFAULT 'ALL',
    write_permission permission_level DEFAULT 'USER',
    comment_permission permission_level DEFAULT 'USER',
    allow_attachment BOOLEAN DEFAULT TRUE,
    allow_image BOOLEAN DEFAULT TRUE,
    max_file_size INT DEFAULT 10 CHECK (max_file_size > 0),
    sort_order INT DEFAULT 0,
    post_count INT DEFAULT 0,
    -- 삭제 관련
    del_dt TIMESTAMP WITH TIME ZONE,
    del_by VARCHAR(100),
    del_by_nm VARCHAR(100),
    del_yn BOOLEAN DEFAULT FALSE NOT NULL,
    -- 생성 관련
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    crt_by VARCHAR(100),
    crt_by_nm VARCHAR(100),
    -- 수정 관련
    upd_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    upd_by VARCHAR(100),
    upd_by_nm VARCHAR(100),
    -- 사용여부
    use_yn BOOLEAN DEFAULT TRUE NOT NULL
);

-- 게시판 테이블 인덱스
CREATE INDEX idx_bbs_boards_typ ON bbs_boards(typ);
CREATE INDEX idx_bbs_boards_actv_yn ON bbs_boards(actv_yn);
CREATE INDEX idx_bbs_boards_sort_order ON bbs_boards(sort_order);

-- 카테고리 테이블
CREATE TABLE bbs_categories (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES bbs_boards(id) ON DELETE CASCADE,
    nm VARCHAR(50) NOT NULL,
    dsc VARCHAR(200),
    color VARCHAR(7), -- #RRGGBB 형식
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    actv_yn BOOLEAN DEFAULT TRUE,
    post_count INT DEFAULT 0,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 제약조건
    CONSTRAINT chk_category_color CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
);

-- 카테고리 테이블 인덱스
CREATE INDEX idx_bbs_categories_board_id ON bbs_categories(board_id);
CREATE INDEX idx_bbs_categories_actv_yn ON bbs_categories(board_id, actv_yn);
CREATE INDEX idx_bbs_categories_sort_order ON bbs_categories(board_id, sort_order);

-- 게시판별 카테고리명 중복 방지
CREATE UNIQUE INDEX idx_bbs_categories_board_nm ON bbs_categories(board_id, nm) WHERE actv_yn = TRUE;

-- 게시글 테이블
CREATE TABLE bbs_posts (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES bbs_boards(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES bbs_categories(id) ON DELETE SET NULL,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    ttl VARCHAR(200) NOT NULL,
    cn TEXT NOT NULL,
    smmry VARCHAR(300),
    stts post_status DEFAULT 'PUBLISHED',
    ntce_yn BOOLEAN DEFAULT FALSE,
    scr_yn BOOLEAN DEFAULT FALSE,
    pwd VARCHAR(255), -- 해시된 비밀번호
    vw_cnt INT DEFAULT 0,
    lk_cnt INT DEFAULT 0,
    cmt_cnt INT DEFAULT 0,
    att_cnt INT DEFAULT 0,
    lst_cmt_dt TIMESTAMP WITH TIME ZONE,
    pbl_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    upd_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 게시글 테이블 인덱스
CREATE INDEX idx_bbs_posts_board_stts_crt_dt ON bbs_posts(board_id, stts, crt_dt);
CREATE INDEX idx_bbs_posts_user_crt_dt ON bbs_posts(user_id, crt_dt);
CREATE INDEX idx_bbs_posts_category ON bbs_posts(category_id);
CREATE INDEX idx_bbs_posts_stts ON bbs_posts(stts);
CREATE INDEX idx_bbs_posts_ntce_yn ON bbs_posts(ntce_yn, crt_dt);
CREATE INDEX idx_bbs_posts_pbl_dt ON bbs_posts(pbl_dt);

-- 게시글 검색을 위한 GIN 인덱스 (PostgreSQL full-text search)
CREATE INDEX idx_bbs_posts_search ON bbs_posts USING GIN (to_tsvector('simple', ttl || ' ' || coalesce(smmry, '') || ' ' || cn));

-- 댓글 테이블
CREATE TABLE bbs_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES bbs_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES bbs_comments(id) ON DELETE CASCADE,
    cn TEXT NOT NULL,
    stts comment_status DEFAULT 'PUBLISHED',
    scr_yn BOOLEAN DEFAULT FALSE,
    lk_cnt INT DEFAULT 0,
    depth INT DEFAULT 0 CHECK (depth >= 0 AND depth <= 5),
    sort_order INT DEFAULT 0,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    upd_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 댓글 테이블 인덱스
CREATE INDEX idx_bbs_comments_post_crt_dt ON bbs_comments(post_id, crt_dt);
CREATE INDEX idx_bbs_comments_user_crt_dt ON bbs_comments(user_id, crt_dt);
CREATE INDEX idx_bbs_comments_parent ON bbs_comments(parent_id);
CREATE INDEX idx_bbs_comments_depth ON bbs_comments(depth);

-- 첨부파일 테이블
CREATE TABLE bbs_attachments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES bbs_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    orgnl_file_nm VARCHAR(255) NOT NULL,
    strd_file_nm VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_sz BIGINT NOT NULL CHECK (file_sz > 0),
    mime_typ VARCHAR(100) NOT NULL,
    file_typ attachment_file_type NOT NULL,
    dwld_cnt INT DEFAULT 0,
    del_yn BOOLEAN DEFAULT FALSE,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 첨부파일 테이블 인덱스
CREATE INDEX idx_bbs_attachments_post ON bbs_attachments(post_id);
CREATE INDEX idx_bbs_attachments_user ON bbs_attachments(user_id);
CREATE INDEX idx_bbs_attachments_file_typ ON bbs_attachments(file_typ);
CREATE INDEX idx_bbs_attachments_del_yn ON bbs_attachments(del_yn);

-- 게시글 좋아요 테이블
CREATE TABLE bbs_post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES bbs_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    typ like_type DEFAULT 'LIKE',
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 중복 좋아요 방지
    UNIQUE(post_id, user_id)
);

-- 게시글 좋아요 인덱스
CREATE INDEX idx_bbs_post_likes_post ON bbs_post_likes(post_id);
CREATE INDEX idx_bbs_post_likes_user_crt_dt ON bbs_post_likes(user_id, crt_dt);

-- 댓글 좋아요 테이블
CREATE TABLE bbs_comment_likes (
    id BIGSERIAL PRIMARY KEY,
    comment_id BIGINT NOT NULL REFERENCES bbs_comments(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    typ like_type DEFAULT 'LIKE',
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 중복 좋아요 방지
    UNIQUE(comment_id, user_id)
);

-- 댓글 좋아요 인덱스
CREATE INDEX idx_bbs_comment_likes_comment ON bbs_comment_likes(comment_id);
CREATE INDEX idx_bbs_comment_likes_user_crt_dt ON bbs_comment_likes(user_id, crt_dt);

-- 북마크 테이블
CREATE TABLE bbs_bookmarks (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES bbs_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 중복 북마크 방지
    UNIQUE(post_id, user_id)
);

-- 북마크 인덱스
CREATE INDEX idx_bbs_bookmarks_post ON bbs_bookmarks(post_id);
CREATE INDEX idx_bbs_bookmarks_user_crt_dt ON bbs_bookmarks(user_id, crt_dt);

-- 신고 테이블
CREATE TABLE bbs_reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    target_type report_target_type NOT NULL,
    target_id BIGINT NOT NULL,
    rsn report_reason NOT NULL,
    dsc TEXT,
    stts report_status DEFAULT 'PENDING',
    processed_by VARCHAR(100) REFERENCES public.COMMON_USER(USER_ID) ON DELETE SET NULL,
    prcs_dt TIMESTAMP WITH TIME ZONE,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 신고 테이블 인덱스
CREATE INDEX idx_bbs_reports_reporter ON bbs_reports(reporter_id);
CREATE INDEX idx_bbs_reports_target ON bbs_reports(target_type, target_id);
CREATE INDEX idx_bbs_reports_stts_crt_dt ON bbs_reports(stts, crt_dt);

-- 트리거 함수: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.upd_dt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 설정
-- COMMON_USER 테이블의 트리거는 기존 시스템에서 관리

CREATE TRIGGER update_bbs_boards_updated_at BEFORE UPDATE ON bbs_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bbs_posts_updated_at BEFORE UPDATE ON bbs_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bbs_comments_updated_at BEFORE UPDATE ON bbs_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 트리거 함수: 게시글 통계 자동 갱신
CREATE OR REPLACE FUNCTION update_post_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 게시글 생성 시 게시판의 게시글 수 증가
        UPDATE bbs_boards SET post_count = post_count + 1 WHERE id = NEW.board_id;

        -- 카테고리가 있는 경우 카테고리의 게시글 수 증가
        IF NEW.category_id IS NOT NULL THEN
            UPDATE bbs_categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
        END IF;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 게시글 삭제 시 게시판의 게시글 수 감소
        UPDATE bbs_boards SET post_count = post_count - 1 WHERE id = OLD.board_id;

        -- 카테고리가 있는 경우 카테고리의 게시글 수 감소
        IF OLD.category_id IS NOT NULL THEN
            UPDATE bbs_categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
        END IF;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 게시글 통계 트리거
CREATE TRIGGER trigger_update_post_statistics
    AFTER INSERT OR DELETE ON bbs_posts
    FOR EACH ROW EXECUTE FUNCTION update_post_statistics();

-- 트리거 함수: 댓글 통계 자동 갱신
CREATE OR REPLACE FUNCTION update_comment_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 댓글 생성 시 게시글의 댓글 수 증가 및 마지막 댓글 시간 갱신
        UPDATE bbs_posts
        SET cmt_cnt = cmt_cnt + 1,
            lst_cmt_dt = NEW.crt_dt
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 댓글 삭제 시 게시글의 댓글 수 감소
        UPDATE bbs_posts SET cmt_cnt = cmt_cnt - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 댓글 통계 트리거
CREATE TRIGGER trigger_update_comment_statistics
    AFTER INSERT OR DELETE ON bbs_comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_statistics();

-- 트리거 함수: 좋아요 통계 자동 갱신
CREATE OR REPLACE FUNCTION update_like_statistics()
RETURNS TRIGGER AS $$
DECLARE
    like_delta INT := 0;
BEGIN
    -- 좋아요 추가/삭제에 따른 증감 계산
    IF TG_OP = 'INSERT' THEN
        like_delta := CASE WHEN NEW.typ = 'LIKE' THEN 1 ELSE -1 END;
    ELSIF TG_OP = 'DELETE' THEN
        like_delta := CASE WHEN OLD.typ = 'LIKE' THEN -1 ELSE 1 END;
    END IF;

    -- 게시글 좋아요 수 갱신
    IF TG_TABLE_NAME = 'bbs_post_likes' THEN
        UPDATE bbs_posts SET lk_cnt = lk_cnt + like_delta WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    -- 댓글 좋아요 수 갱신
    ELSIF TG_TABLE_NAME = 'bbs_comment_likes' THEN
        UPDATE bbs_comments SET lk_cnt = lk_cnt + like_delta WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 좋아요 통계 트리거
CREATE TRIGGER trigger_update_post_like_statistics
    AFTER INSERT OR DELETE ON bbs_post_likes
    FOR EACH ROW EXECUTE FUNCTION update_like_statistics();

CREATE TRIGGER trigger_update_comment_like_statistics
    AFTER INSERT OR DELETE ON bbs_comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_like_statistics();

-- 트리거 함수: 첨부파일 통계 자동 갱신
CREATE OR REPLACE FUNCTION update_attachment_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE bbs_posts SET att_cnt = att_cnt + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE bbs_posts SET att_cnt = att_cnt - 1 WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 첨부파일 통계 트리거
CREATE TRIGGER trigger_update_attachment_statistics
    AFTER INSERT OR DELETE ON bbs_attachments
    FOR EACH ROW EXECUTE FUNCTION update_attachment_statistics();

-- 뷰: 게시판별 게시글 통계
CREATE VIEW bbs_board_statistics AS
SELECT
    b.id,
    b.nm,
    b.post_count as total_posts,
    COUNT(CASE WHEN p.stts = 'PUBLISHED' THEN 1 END) as published_posts,
    COUNT(CASE WHEN p.crt_dt >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as posts_last_week,
    COUNT(CASE WHEN p.crt_dt >= CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as posts_today,
    MAX(p.crt_dt) as last_post_date
FROM bbs_boards b
LEFT JOIN bbs_posts p ON b.id = p.board_id AND p.stts = 'PUBLISHED'
GROUP BY b.id, b.nm, b.post_count;

-- 뷰: 인기 게시글 (조회수 기준)
CREATE VIEW bbs_popular_posts AS
SELECT
    p.id,
    p.ttl,
    p.vw_cnt,
    p.lk_cnt,
    p.cmt_cnt,
    u.NICKNAME as author_nickname,
    b.nm as board_nm,
    p.crt_dt,
    (p.vw_cnt + p.lk_cnt * 10 + p.cmt_cnt * 5) as popularity_score
FROM bbs_posts p
JOIN public.COMMON_USER u ON p.user_id = u.USER_ID
JOIN bbs_boards b ON p.board_id = b.id
WHERE p.stts = 'PUBLISHED'
ORDER BY popularity_score DESC;

-- 뷰: 사용자 활동 통계
CREATE VIEW bbs_user_activity_stats AS
SELECT
    u.USER_ID as user_id,
    u.NICKNAME as nickname,
    NULL as user_level, -- COMMON_USER에는 user_level 필드가 없음
    COUNT(DISTINCT p.id) as total_posts,
    COUNT(DISTINCT c.id) as total_comments,
    COUNT(DISTINCT pl.id) as total_post_likes,
    COUNT(DISTINCT cl.id) as total_comment_likes,
    COUNT(DISTINCT bm.id) as total_bookmarks,
    MAX(GREATEST(p.crt_dt, c.crt_dt)) as last_activity_date
FROM public.COMMON_USER u
LEFT JOIN bbs_posts p ON u.USER_ID = p.user_id AND p.stts = 'PUBLISHED'
LEFT JOIN bbs_comments c ON u.USER_ID = c.user_id AND c.stts = 'PUBLISHED'
LEFT JOIN bbs_post_likes pl ON u.USER_ID = pl.user_id
LEFT JOIN bbs_comment_likes cl ON u.USER_ID = cl.user_id
LEFT JOIN bbs_bookmarks bm ON u.USER_ID = bm.user_id
GROUP BY u.USER_ID, u.NICKNAME;

-- current_user_id() 및 current_user_level() 함수
CREATE OR REPLACE FUNCTION current_user_id() RETURNS VARCHAR(100) AS $$
BEGIN
    -- 실제 구현에서는 JWT 토큰에서 사용자 ID를 추출
    -- COMMON_USER.USER_ID 형식으로 반환
    RETURN 'admin'; -- 기본값, 실제로는 JWT에서 추출
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_level() RETURNS INT AS $$
BEGIN
    -- COMMON_USER에는 user_level 필드가 없으므로 기본값 반환
    -- 실제 구현에서는 역할(Role) 시스템에서 레벨을 결정
    RETURN 1; -- 기본 사용자 레벨
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) 설정
-- 참고: COMMON_USER 테이블은 기존 시스템에서 RLS 관리
ALTER TABLE bbs_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bbs_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bbs_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_policy ON bbs_posts FOR ALL USING (
    stts != 'SECRET' OR
    user_id = current_user_id() OR
    current_user_level() = 99
);

CREATE POLICY comments_policy ON bbs_comments FOR ALL USING (
    stts != 'SECRET' OR
    user_id = current_user_id() OR
    current_user_level() = 99
);

-- 기본 게시판 및 카테고리 데이터 삽입
INSERT INTO bbs_boards (nm, dsc, typ, sort_order) VALUES
('공지사항', '중요한 공지사항을 게시하는 곳입니다.', 'NOTICE', 1),
('자유게시판', '자유롭게 이야기를 나누는 곳입니다.', 'GENERAL', 2),
('질문답변', '질문과 답변을 하는 곳입니다.', 'QNA', 3),
('갤러리', '이미지를 공유하는 곳입니다.', 'IMAGE', 4);

INSERT INTO bbs_categories (board_id, nm, dsc, sort_order) VALUES
(1, '중요공지', '매우 중요한 공지사항', 1),
(1, '일반공지', '일반적인 공지사항', 2),
(2, '일상', '일상적인 이야기', 1),
(2, '취미', '취미 관련 이야기', 2),
(2, '정보', '유용한 정보 공유', 3),
(3, '프로그래밍', '프로그래밍 관련 질문', 1),
(3, '디자인', '디자인 관련 질문', 2),
(3, '기타', '기타 질문', 3);

-- 참고: 기본 관리자 계정은 기존 시스템에서 별도 관리

-- 함수: 게시판별 게시글 목록 조회 (페이징)
CREATE OR REPLACE FUNCTION get_posts_by_board(
    board_id_param BIGINT,
    category_id_param BIGINT DEFAULT NULL,
    status_param post_status DEFAULT 'PUBLISHED',
    limit_param INT DEFAULT 20,
    offset_param INT DEFAULT 0,
    search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    ttl VARCHAR(200),
    author_nickname VARCHAR(50),
    category_nm VARCHAR(50),
    vw_cnt INT,
    lk_cnt INT,
    cmt_cnt INT,
    crt_dt TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.ttl,
        u.NICKNAME,
        c.nm,
        p.vw_cnt,
        p.lk_cnt,
        p.cmt_cnt,
        p.crt_dt
    FROM bbs_posts p
    JOIN public.COMMON_USER u ON p.user_id = u.USER_ID
    LEFT JOIN bbs_categories c ON p.category_id = c.id
    WHERE p.board_id = board_id_param
      AND p.stts = status_param
      AND (category_id_param IS NULL OR p.category_id = category_id_param)
      AND (search_query IS NULL OR p.ttl ILIKE '%' || search_query || '%' OR p.cn ILIKE '%' || search_query || '%')
    ORDER BY p.ntce_yn DESC, p.crt_dt DESC
    LIMIT limit_param OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- 함수: 게시글 상세 조회 (조회수 증가)
CREATE OR REPLACE FUNCTION get_post_detail(post_id_param BIGINT)
RETURNS TABLE (
    id BIGINT,
    board_id BIGINT,
    category_id BIGINT,
    user_id BIGINT,
    ttl VARCHAR(200),
    cn TEXT,
    author_nickname VARCHAR(50),
    vw_cnt INT,
    lk_cnt INT,
    cmt_cnt INT,
    crt_dt TIMESTAMP WITH TIME ZONE,
    upd_dt TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- 조회수 증가
    UPDATE bbs_posts SET vw_cnt = vw_cnt + 1 WHERE id = post_id_param;

    -- 게시글 정보 반환
    RETURN QUERY
    SELECT
        p.id,
        p.board_id,
        p.category_id,
        p.user_id,
        p.ttl,
        p.cn,
        u.NICKNAME,
        p.vw_cnt,
        p.lk_cnt,
        p.cmt_cnt,
        p.crt_dt,
        p.upd_dt
    FROM bbs_posts p
    JOIN public.COMMON_USER u ON p.user_id = u.USER_ID
    WHERE p.id = post_id_param;
END;
$$ LANGUAGE plpgsql;

-- 알림 테이블
CREATE TABLE bbs_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    typ notification_type NOT NULL,
    ttl VARCHAR(200) NOT NULL,
    msg TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_post_id BIGINT REFERENCES bbs_posts(id) ON DELETE CASCADE,
    related_comment_id BIGINT REFERENCES bbs_comments(id) ON DELETE CASCADE,
    related_user_id VARCHAR(100) REFERENCES public.COMMON_USER(USER_ID) ON DELETE SET NULL,
    metadata JSONB, -- 추가 데이터 저장
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 알림 테이블 인덱스
CREATE INDEX idx_bbs_notifications_user_crt_dt ON bbs_notifications(user_id, crt_dt);
CREATE INDEX idx_bbs_notifications_user_is_read ON bbs_notifications(user_id, is_read);

-- 태그 테이블
CREATE TABLE bbs_tags (
    id BIGSERIAL PRIMARY KEY,
    nm VARCHAR(50) UNIQUE NOT NULL,
    dsc VARCHAR(200),
    color VARCHAR(7), -- #RRGGBB 형식
    usage_cnt INT DEFAULT 0,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 게시글-태그 매핑 테이블
CREATE TABLE bbs_post_tags (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES bbs_posts(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES bbs_tags(id) ON DELETE CASCADE,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(post_id, tag_id)
);

-- 게시글-태그 인덱스
CREATE INDEX idx_bbs_post_tags_post ON bbs_post_tags(post_id);
CREATE INDEX idx_bbs_post_tags_tag ON bbs_post_tags(tag_id);

-- 팔로우 테이블
CREATE TABLE bbs_follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    following_id VARCHAR(100) NOT NULL, -- USER 타입일 때는 COMMON_USER.USER_ID, BOARD 타입일 때는 bbs_boards.id를 문자열로 저장
    typ follow_type DEFAULT 'USER',
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(follower_id, following_id, typ)
);

-- 팔로우 인덱스
CREATE INDEX idx_bbs_follows_follower ON bbs_follows(follower_id);
CREATE INDEX idx_bbs_follows_following ON bbs_follows(following_id);

-- 활동 로그 테이블
CREATE TABLE bbs_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    act_typ activity_type NOT NULL,
    act_dsc TEXT,
    target_typ VARCHAR(50), -- POST, COMMENT, BOARD 등
    target_id BIGINT,
    ip_addr INET,
    user_agent TEXT,
    metadata JSONB,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 활동 로그 인덱스
CREATE INDEX idx_bbs_activity_logs_user_crt_dt ON bbs_activity_logs(user_id, crt_dt);
CREATE INDEX idx_bbs_activity_logs_act_typ ON bbs_activity_logs(act_typ);

-- 게시글 히스토리 테이블
CREATE TABLE bbs_post_history (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES bbs_posts(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    prev_ttl VARCHAR(200),
    new_ttl VARCHAR(200),
    prev_cn TEXT,
    new_cn TEXT,
    change_typ change_type DEFAULT 'UPDATE',
    change_rsn TEXT,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 게시글 히스토리 인덱스
CREATE INDEX idx_bbs_post_history_post_crt_dt ON bbs_post_history(post_id, crt_dt);

-- 사용자 설정 테이블
CREATE TABLE bbs_user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    pref_key VARCHAR(100) NOT NULL,
    pref_val TEXT,
    upd_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, pref_key)
);

-- 사용자 설정 인덱스
CREATE INDEX idx_bbs_user_preferences_user ON bbs_user_preferences(user_id);

-- 검색 로그 테이블
CREATE TABLE bbs_search_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_typ VARCHAR(50), -- TITLE, CONTENT, AUTHOR, TAG 등
    result_cnt INT DEFAULT 0,
    ip_addr INET,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 검색 로그 인덱스
CREATE INDEX idx_bbs_search_logs_user_crt_dt ON bbs_search_logs(user_id, crt_dt);
CREATE INDEX idx_bbs_search_logs_query ON bbs_search_logs USING GIN (to_tsvector('simple', search_query));

-- 관리자 로그 테이블
CREATE TABLE bbs_admin_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id VARCHAR(100) NOT NULL REFERENCES public.COMMON_USER(USER_ID) ON DELETE CASCADE,
    act_typ admin_action_type NOT NULL,
    act_dsc TEXT,
    target_typ VARCHAR(50),
    target_id BIGINT,
    old_val JSONB,
    new_val JSONB,
    ip_addr INET,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 관리자 로그 인덱스
CREATE INDEX idx_bbs_admin_logs_admin_crt_dt ON bbs_admin_logs(admin_id, crt_dt);
CREATE INDEX idx_bbs_admin_logs_act_typ ON bbs_admin_logs(act_typ);

-- 통계 데이터 테이블
CREATE TABLE bbs_statistics (
    id BIGSERIAL PRIMARY KEY,
    stat_typ VARCHAR(50) NOT NULL, -- BOARD_STATS, USER_STATS, POST_STATS 등
    stat_key VARCHAR(100) NOT NULL,
    stat_val BIGINT DEFAULT 0,
    stat_period VARCHAR(20), -- DAILY, WEEKLY, MONTHLY 등
    period_start DATE,
    period_end DATE,
    metadata JSONB,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    upd_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(stat_typ, stat_key, stat_period, period_start)
);

-- 통계 데이터 인덱스
CREATE INDEX idx_bbs_statistics_typ_period ON bbs_statistics(stat_typ, stat_period, period_start);

-- 파일 썸네일 테이블
CREATE TABLE bbs_file_thumbnails (
    id BIGSERIAL PRIMARY KEY,
    attachment_id BIGINT NOT NULL REFERENCES bbs_attachments(id) ON DELETE CASCADE,
    thumbnail_path VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    thumbnail_sz BIGINT NOT NULL,
    width INT,
    height INT,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 파일 썸네일 인덱스
CREATE INDEX idx_bbs_file_thumbnails_attachment ON bbs_file_thumbnails(attachment_id);

-- ENUM 타입들은 위쪽에서 이미 정의됨

-- 트리거 함수: 태그 사용 카운트 자동 갱신
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_cnt = usage_cnt + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_cnt = usage_cnt - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 태그 사용 카운트 트리거
CREATE TRIGGER trigger_update_tag_usage_count
    AFTER INSERT OR DELETE ON bbs_post_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- 주석
COMMENT ON TABLE bbs_notifications IS '사용자 알림 정보';
COMMENT ON TABLE bbs_tags IS '게시글 태그 정보';
COMMENT ON TABLE bbs_post_tags IS '게시글-태그 매핑 정보';
COMMENT ON TABLE bbs_follows IS '사용자 팔로우 정보';
COMMENT ON TABLE bbs_activity_logs IS '사용자 활동 로그';
COMMENT ON TABLE bbs_post_history IS '게시글 수정 히스토리';
COMMENT ON TABLE bbs_user_preferences IS '사용자 개인 설정';
COMMENT ON TABLE bbs_search_logs IS '검색 로그';
COMMENT ON TABLE bbs_admin_logs IS '관리자 작업 로그';
COMMENT ON TABLE bbs_statistics IS '통계 데이터';
COMMENT ON TABLE bbs_file_thumbnails IS '파일 썸네일 정보';

-- COMMON_USER 테이블 코멘트는 기존 시스템에서 관리
COMMENT ON TABLE bbs_boards IS '게시판 기본 정보';
COMMENT ON TABLE bbs_categories IS '게시글 분류 카테고리';
COMMENT ON TABLE bbs_posts IS '게시글 정보';
COMMENT ON TABLE bbs_comments IS '댓글 및 대댓글 정보';
COMMENT ON TABLE bbs_attachments IS '게시글 첨부파일 정보';
COMMENT ON TABLE bbs_post_likes IS '게시글 좋아요 정보';
COMMENT ON TABLE bbs_comment_likes IS '댓글 좋아요 정보';
COMMENT ON TABLE bbs_bookmarks IS '사용자 북마크 정보';
COMMENT ON TABLE bbs_reports IS '콘텐츠 신고 정보';
COMMENT ON VIEW bbs_board_statistics IS '게시판별 통계 정보 뷰';
COMMENT ON VIEW bbs_popular_posts IS '인기 게시글 뷰';
COMMENT ON VIEW bbs_user_activity_stats IS '사용자 활동 통계 뷰';

-- ============================================
-- 테이블 및 컬럼 코멘트
-- ============================================

-- 게시판 테이블
COMMENT ON TABLE bbs_boards IS '게시판 기본 정보';
COMMENT ON COLUMN bbs_boards.id IS '게시판 일련번호';
COMMENT ON COLUMN bbs_boards.nm IS '게시판 이름';
COMMENT ON COLUMN bbs_boards.dsc IS '게시판 설명';
COMMENT ON COLUMN bbs_boards.typ IS '게시판 유형 (GENERAL, NOTICE, QNA, IMAGE, VIDEO)';
COMMENT ON COLUMN bbs_boards.actv_yn IS '활성 상태';
COMMENT ON COLUMN bbs_boards.read_permission IS '읽기 권한 레벨';
COMMENT ON COLUMN bbs_boards.write_permission IS '쓰기 권한 레벨';
COMMENT ON COLUMN bbs_boards.comment_permission IS '댓글 권한 레벨';
COMMENT ON COLUMN bbs_boards.allow_attachment IS '첨부파일 허용 여부';
COMMENT ON COLUMN bbs_boards.allow_image IS '이미지 허용 여부';
COMMENT ON COLUMN bbs_boards.max_file_size IS '최대 파일 크기(MB)';
COMMENT ON COLUMN bbs_boards.sort_order IS '정렬 순서';
COMMENT ON COLUMN bbs_boards.post_count IS '게시글 수';
COMMENT ON COLUMN bbs_boards.crt_dt IS '생성일시';
COMMENT ON COLUMN bbs_boards.upd_dt IS '수정일시';

-- 카테고리 테이블
COMMENT ON TABLE bbs_categories IS '게시글 분류 카테고리';
COMMENT ON COLUMN bbs_categories.id IS '카테고리 일련번호';
COMMENT ON COLUMN bbs_categories.board_id IS '게시판 ID';
COMMENT ON COLUMN bbs_categories.nm IS '카테고리 이름';
COMMENT ON COLUMN bbs_categories.dsc IS '카테고리 설명';
COMMENT ON COLUMN bbs_categories.color IS '카테고리 색상 (#RRGGBB)';
COMMENT ON COLUMN bbs_categories.icon IS '카테고리 아이콘';
COMMENT ON COLUMN bbs_categories.sort_order IS '정렬 순서';
COMMENT ON COLUMN bbs_categories.actv_yn IS '활성 상태';
COMMENT ON COLUMN bbs_categories.post_count IS '게시글 수';
COMMENT ON COLUMN bbs_categories.crt_dt IS '생성일시';

-- 게시글 테이블
COMMENT ON TABLE bbs_posts IS '게시글 정보';
COMMENT ON COLUMN bbs_posts.id IS '게시글 일련번호';
COMMENT ON COLUMN bbs_posts.board_id IS '게시판 ID';
COMMENT ON COLUMN bbs_posts.category_id IS '카테고리 ID';
COMMENT ON COLUMN bbs_posts.user_id IS '작성자 ID';
COMMENT ON COLUMN bbs_posts.ttl IS '제목';
COMMENT ON COLUMN bbs_posts.cn IS '내용';
COMMENT ON COLUMN bbs_posts.smmry IS '요약';
COMMENT ON COLUMN bbs_posts.stts IS '상태 (PUBLISHED, DRAFT, DELETED, HIDDEN)';
COMMENT ON COLUMN bbs_posts.ntce_yn IS '공지사항 여부';
COMMENT ON COLUMN bbs_posts.scr_yn IS '비밀글 여부';
COMMENT ON COLUMN bbs_posts.pwd IS '비밀번호 (해시값)';
COMMENT ON COLUMN bbs_posts.vw_cnt IS '조회수';
COMMENT ON COLUMN bbs_posts.lk_cnt IS '좋아요 수';
COMMENT ON COLUMN bbs_posts.cmt_cnt IS '댓글 수';
COMMENT ON COLUMN bbs_posts.att_cnt IS '첨부파일 수';
COMMENT ON COLUMN bbs_posts.lst_cmt_dt IS '마지막 댓글 일시';
COMMENT ON COLUMN bbs_posts.pbl_dt IS '게시일시';
COMMENT ON COLUMN bbs_posts.crt_dt IS '생성일시';
COMMENT ON COLUMN bbs_posts.upd_dt IS '수정일시';

-- 댓글 테이블
COMMENT ON TABLE bbs_comments IS '댓글 및 대댓글 정보';
COMMENT ON COLUMN bbs_comments.id IS '댓글 일련번호';
COMMENT ON COLUMN bbs_comments.post_id IS '게시글 ID';
COMMENT ON COLUMN bbs_comments.user_id IS '작성자 ID';
COMMENT ON COLUMN bbs_comments.parent_id IS '부모 댓글 ID (대댓글용)';
COMMENT ON COLUMN bbs_comments.cn IS '내용';
COMMENT ON COLUMN bbs_comments.stts IS '상태 (PUBLISHED, DELETED, HIDDEN)';
COMMENT ON COLUMN bbs_comments.scr_yn IS '비밀댓글 여부';
COMMENT ON COLUMN bbs_comments.lk_cnt IS '좋아요 수';
COMMENT ON COLUMN bbs_comments.depth IS '댓글 깊이 (0-5)';
COMMENT ON COLUMN bbs_comments.sort_order IS '정렬 순서';
COMMENT ON COLUMN bbs_comments.crt_dt IS '생성일시';
COMMENT ON COLUMN bbs_comments.upd_dt IS '수정일시';

-- 첨부파일 테이블
COMMENT ON TABLE bbs_attachments IS '게시글 첨부파일 정보';
COMMENT ON COLUMN bbs_attachments.id IS '첨부파일 일련번호';
COMMENT ON COLUMN bbs_attachments.post_id IS '게시글 ID';
COMMENT ON COLUMN bbs_attachments.user_id IS '업로드자 ID';
COMMENT ON COLUMN bbs_attachments.orgnl_file_nm IS '원본 파일명';
COMMENT ON COLUMN bbs_attachments.strd_file_nm IS '저장 파일명';
COMMENT ON COLUMN bbs_attachments.file_path IS '파일 경로';
COMMENT ON COLUMN bbs_attachments.file_url IS '파일 URL';
COMMENT ON COLUMN bbs_attachments.file_sz IS '파일 크기 (바이트)';
COMMENT ON COLUMN bbs_attachments.mime_typ IS 'MIME 타입';
COMMENT ON COLUMN bbs_attachments.file_typ IS '파일 유형 (IMAGE, DOCUMENT, VIDEO, AUDIO, OTHER)';
COMMENT ON COLUMN bbs_attachments.dwld_cnt IS '다운로드 수';
COMMENT ON COLUMN bbs_attachments.del_yn IS '삭제 여부';
COMMENT ON COLUMN bbs_attachments.crt_dt IS '생성일시';

-- 게시글 좋아요 테이블
COMMENT ON TABLE bbs_post_likes IS '게시글 좋아요 정보';
COMMENT ON COLUMN bbs_post_likes.id IS '좋아요 일련번호';
COMMENT ON COLUMN bbs_post_likes.post_id IS '게시글 ID';
COMMENT ON COLUMN bbs_post_likes.user_id IS '사용자 ID';
COMMENT ON COLUMN bbs_post_likes.typ IS '좋아요 유형 (LIKE, DISLIKE)';
COMMENT ON COLUMN bbs_post_likes.crt_dt IS '생성일시';

-- 댓글 좋아요 테이블
COMMENT ON TABLE bbs_comment_likes IS '댓글 좋아요 정보';
COMMENT ON COLUMN bbs_comment_likes.id IS '좋아요 일련번호';
COMMENT ON COLUMN bbs_comment_likes.comment_id IS '댓글 ID';
COMMENT ON COLUMN bbs_comment_likes.user_id IS '사용자 ID';
COMMENT ON COLUMN bbs_comment_likes.typ IS '좋아요 유형 (LIKE, DISLIKE)';
COMMENT ON COLUMN bbs_comment_likes.crt_dt IS '생성일시';

-- 북마크 테이블
COMMENT ON TABLE bbs_bookmarks IS '사용자 북마크 정보';
COMMENT ON COLUMN bbs_bookmarks.id IS '북마크 일련번호';
COMMENT ON COLUMN bbs_bookmarks.post_id IS '게시글 ID';
COMMENT ON COLUMN bbs_bookmarks.user_id IS '사용자 ID';
COMMENT ON COLUMN bbs_bookmarks.crt_dt IS '생성일시';

-- 신고 테이블
COMMENT ON TABLE bbs_reports IS '콘텐츠 신고 정보';
COMMENT ON COLUMN bbs_reports.id IS '신고 일련번호';
COMMENT ON COLUMN bbs_reports.reporter_id IS '신고자 ID';
COMMENT ON COLUMN bbs_reports.target_type IS '신고 대상 유형 (POST, COMMENT, USER)';
COMMENT ON COLUMN bbs_reports.target_id IS '신고 대상 ID';
COMMENT ON COLUMN bbs_reports.rsn IS '신고 사유 (SPAM, ABUSE, INAPPROPRIATE, COPYRIGHT, OTHER)';
COMMENT ON COLUMN bbs_reports.dsc IS '신고 상세 설명';
COMMENT ON COLUMN bbs_reports.stts IS '신고 상태 (PENDING, REVIEWED, RESOLVED, DISMISSED)';
COMMENT ON COLUMN bbs_reports.processed_by IS '처리자 ID';
COMMENT ON COLUMN bbs_reports.prcs_dt IS '처리일시';
COMMENT ON COLUMN bbs_reports.crt_dt IS '생성일시';

-- 알림 테이블
COMMENT ON TABLE bbs_notifications IS '사용자 알림 정보';
COMMENT ON COLUMN bbs_notifications.id IS '알림 일련번호';
COMMENT ON COLUMN bbs_notifications.user_id IS '수신자 ID';
COMMENT ON COLUMN bbs_notifications.typ IS '알림 유형';
COMMENT ON COLUMN bbs_notifications.ttl IS '알림 제목';
COMMENT ON COLUMN bbs_notifications.msg IS '알림 메시지';
COMMENT ON COLUMN bbs_notifications.is_read IS '읽음 상태';
COMMENT ON COLUMN bbs_notifications.related_post_id IS '관련 게시글 ID';
COMMENT ON COLUMN bbs_notifications.related_comment_id IS '관련 댓글 ID';
COMMENT ON COLUMN bbs_notifications.related_user_id IS '관련 사용자 ID';
COMMENT ON COLUMN bbs_notifications.metadata IS '추가 데이터 (JSON)';
COMMENT ON COLUMN bbs_notifications.crt_dt IS '생성일시';

-- 태그 테이블
COMMENT ON TABLE bbs_tags IS '게시글 태그 정보';
COMMENT ON COLUMN bbs_tags.id IS '태그 일련번호';
COMMENT ON COLUMN bbs_tags.nm IS '태그 이름';
COMMENT ON COLUMN bbs_tags.dsc IS '태그 설명';
COMMENT ON COLUMN bbs_tags.color IS '태그 색상 (#RRGGBB)';
COMMENT ON COLUMN bbs_tags.usage_cnt IS '사용 횟수';
COMMENT ON COLUMN bbs_tags.crt_dt IS '생성일시';

-- 게시글-태그 매핑 테이블
COMMENT ON TABLE bbs_post_tags IS '게시글-태그 매핑 정보';
COMMENT ON COLUMN bbs_post_tags.id IS '매핑 일련번호';
COMMENT ON COLUMN bbs_post_tags.post_id IS '게시글 ID';
COMMENT ON COLUMN bbs_post_tags.tag_id IS '태그 ID';
COMMENT ON COLUMN bbs_post_tags.crt_dt IS '생성일시';

-- 팔로우 테이블
COMMENT ON TABLE bbs_follows IS '사용자 팔로우 정보';
COMMENT ON COLUMN bbs_follows.id IS '팔로우 일련번호';
COMMENT ON COLUMN bbs_follows.follower_id IS '팔로워 ID';
COMMENT ON COLUMN bbs_follows.following_id IS '팔로잉 ID';
COMMENT ON COLUMN bbs_follows.typ IS '팔로우 유형 (USER, BOARD)';
COMMENT ON COLUMN bbs_follows.crt_dt IS '생성일시';

-- 활동 로그 테이블
COMMENT ON TABLE bbs_activity_logs IS '사용자 활동 로그';
COMMENT ON COLUMN bbs_activity_logs.id IS '로그 일련번호';
COMMENT ON COLUMN bbs_activity_logs.user_id IS '사용자 ID';
COMMENT ON COLUMN bbs_activity_logs.act_typ IS '활동 유형';
COMMENT ON COLUMN bbs_activity_logs.act_dsc IS '활동 설명';
COMMENT ON COLUMN bbs_activity_logs.target_typ IS '대상 유형 (POST, COMMENT, BOARD 등)';
COMMENT ON COLUMN bbs_activity_logs.target_id IS '대상 ID';
COMMENT ON COLUMN bbs_activity_logs.ip_addr IS 'IP 주소';
COMMENT ON COLUMN bbs_activity_logs.user_agent IS 'User Agent';
COMMENT ON COLUMN bbs_activity_logs.metadata IS '추가 데이터 (JSON)';
COMMENT ON COLUMN bbs_activity_logs.crt_dt IS '생성일시';

-- 게시글 히스토리 테이블
COMMENT ON TABLE bbs_post_history IS '게시글 수정 히스토리';
COMMENT ON COLUMN bbs_post_history.id IS '히스토리 일련번호';
COMMENT ON COLUMN bbs_post_history.post_id IS '게시글 ID';
COMMENT ON COLUMN bbs_post_history.user_id IS '수정자 ID';
COMMENT ON COLUMN bbs_post_history.prev_ttl IS '이전 제목';
COMMENT ON COLUMN bbs_post_history.new_ttl IS '새 제목';
COMMENT ON COLUMN bbs_post_history.prev_cn IS '이전 내용';
COMMENT ON COLUMN bbs_post_history.new_cn IS '새 내용';
COMMENT ON COLUMN bbs_post_history.change_typ IS '변경 유형 (CREATE, UPDATE, DELETE)';
COMMENT ON COLUMN bbs_post_history.change_rsn IS '변경 사유';
COMMENT ON COLUMN bbs_post_history.crt_dt IS '생성일시';

-- 사용자 설정 테이블
COMMENT ON TABLE bbs_user_preferences IS '사용자 개인 설정';
COMMENT ON COLUMN bbs_user_preferences.id IS '설정 일련번호';
COMMENT ON COLUMN bbs_user_preferences.user_id IS '사용자 ID';
COMMENT ON COLUMN bbs_user_preferences.pref_key IS '설정 키';
COMMENT ON COLUMN bbs_user_preferences.pref_val IS '설정 값';
COMMENT ON COLUMN bbs_user_preferences.upd_dt IS '수정일시';

-- 검색 로그 테이블
COMMENT ON TABLE bbs_search_logs IS '검색 로그';
COMMENT ON COLUMN bbs_search_logs.id IS '로그 일련번호';
COMMENT ON COLUMN bbs_search_logs.user_id IS '사용자 ID (NULL 가능)';
COMMENT ON COLUMN bbs_search_logs.search_query IS '검색 쿼리';
COMMENT ON COLUMN bbs_search_logs.search_typ IS '검색 유형 (TITLE, CONTENT, AUTHOR, TAG 등)';
COMMENT ON COLUMN bbs_search_logs.result_cnt IS '결과 수';
COMMENT ON COLUMN bbs_search_logs.ip_addr IS 'IP 주소';
COMMENT ON COLUMN bbs_search_logs.crt_dt IS '생성일시';

-- 관리자 로그 테이블
COMMENT ON TABLE bbs_admin_logs IS '관리자 작업 로그';
COMMENT ON COLUMN bbs_admin_logs.id IS '로그 일련번호';
COMMENT ON COLUMN bbs_admin_logs.admin_id IS '관리자 ID';
COMMENT ON COLUMN bbs_admin_logs.act_typ IS '작업 유형';
COMMENT ON COLUMN bbs_admin_logs.act_dsc IS '작업 설명';
COMMENT ON COLUMN bbs_admin_logs.target_typ IS '대상 유형';
COMMENT ON COLUMN bbs_admin_logs.target_id IS '대상 ID';
COMMENT ON COLUMN bbs_admin_logs.old_val IS '이전 값 (JSON)';
COMMENT ON COLUMN bbs_admin_logs.new_val IS '새 값 (JSON)';
COMMENT ON COLUMN bbs_admin_logs.ip_addr IS 'IP 주소';
COMMENT ON COLUMN bbs_admin_logs.crt_dt IS '생성일시';

-- 통계 데이터 테이블
COMMENT ON TABLE bbs_statistics IS '통계 데이터';
COMMENT ON COLUMN bbs_statistics.id IS '통계 일련번호';
COMMENT ON COLUMN bbs_statistics.stat_typ IS '통계 유형 (BOARD_STATS, USER_STATS, POST_STATS 등)';
COMMENT ON COLUMN bbs_statistics.stat_key IS '통계 키';
COMMENT ON COLUMN bbs_statistics.stat_val IS '통계 값';
COMMENT ON COLUMN bbs_statistics.stat_period IS '통계 기간 (DAILY, WEEKLY, MONTHLY 등)';
COMMENT ON COLUMN bbs_statistics.period_start IS '기간 시작일';
COMMENT ON COLUMN bbs_statistics.period_end IS '기간 종료일';
COMMENT ON COLUMN bbs_statistics.metadata IS '추가 데이터 (JSON)';
COMMENT ON COLUMN bbs_statistics.crt_dt IS '생성일시';
COMMENT ON COLUMN bbs_statistics.upd_dt IS '수정일시';

-- 파일 썸네일 테이블
COMMENT ON TABLE bbs_file_thumbnails IS '파일 썸네일 정보';
COMMENT ON COLUMN bbs_file_thumbnails.id IS '썸네일 일련번호';
COMMENT ON COLUMN bbs_file_thumbnails.attachment_id IS '첨부파일 ID';
COMMENT ON COLUMN bbs_file_thumbnails.thumbnail_path IS '썸네일 경로';
COMMENT ON COLUMN bbs_file_thumbnails.thumbnail_url IS '썸네일 URL';
COMMENT ON COLUMN bbs_file_thumbnails.thumbnail_sz IS '썸네일 크기 (바이트)';
COMMENT ON COLUMN bbs_file_thumbnails.width IS '썸네일 너비';
COMMENT ON COLUMN bbs_file_thumbnails.height IS '썸네일 높이';
COMMENT ON COLUMN bbs_file_thumbnails.crt_dt IS '생성일시';
