-- 게시판 시스템 데이터베이스 스키마
-- PostgreSQL 기준으로 작성

-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS board_system;
SET search_path TO board_system;

-- ENUM 타입 정의
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
CREATE TYPE board_type AS ENUM ('GENERAL', 'NOTICE', 'QNA', 'IMAGE', 'VIDEO');
CREATE TYPE permission_level AS ENUM ('ALL', 'USER', 'ADMIN');
CREATE TYPE post_status AS ENUM ('PUBLISHED', 'DRAFT', 'DELETED', 'HIDDEN');
CREATE TYPE comment_status AS ENUM ('PUBLISHED', 'DELETED', 'HIDDEN');
CREATE TYPE attachment_file_type AS ENUM ('IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'OTHER');
CREATE TYPE like_type AS ENUM ('LIKE', 'DISLIKE');
CREATE TYPE report_target_type AS ENUM ('POST', 'COMMENT', 'USER');
CREATE TYPE report_reason AS ENUM ('SPAM', 'ABUSE', 'INAPPROPRIATE', 'COPYRIGHT', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

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
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    upd_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_bbs_posts_search ON bbs_posts USING GIN (to_tsvector('korean', ttl || ' ' || coalesce(smmry, '') || ' ' || cn));

-- 댓글 테이블
CREATE TABLE bbs_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES bbs_posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    reporter_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type report_target_type NOT NULL,
    target_id BIGINT NOT NULL,
    rsn report_reason NOT NULL,
    dsc TEXT,
    stts report_status DEFAULT 'PENDING',
    processed_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
        UPDATE boards SET post_count = post_count + 1 WHERE id = NEW.board_id;

        -- 카테고리가 있는 경우 카테고리의 게시글 수 증가
        IF NEW.category_id IS NOT NULL THEN
            UPDATE categories SET post_count = post_count + 1 WHERE id = NEW.category_id;
        END IF;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 게시글 삭제 시 게시판의 게시글 수 감소
        UPDATE boards SET post_count = post_count - 1 WHERE id = OLD.board_id;

        -- 카테고리가 있는 경우 카테고리의 게시글 수 감소
        IF OLD.category_id IS NOT NULL THEN
            UPDATE categories SET post_count = post_count - 1 WHERE id = OLD.category_id;
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
        UPDATE posts
        SET cmt_cnt = cmt_cnt + 1,
            lst_cmt_dt = NEW.crt_dt
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 댓글 삭제 시 게시글의 댓글 수 감소
        UPDATE posts SET cmt_cnt = cmt_cnt - 1 WHERE id = OLD.post_id;
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
        like_delta := CASE WHEN NEW.type = 'LIKE' THEN 1 ELSE -1 END;
    ELSIF TG_OP = 'DELETE' THEN
        like_delta := CASE WHEN OLD.type = 'LIKE' THEN -1 ELSE 1 END;
    END IF;

    -- 게시글 좋아요 수 갱신
    IF TG_TABLE_NAME = 'post_likes' THEN
        UPDATE posts SET lk_cnt = lk_cnt + like_delta WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    -- 댓글 좋아요 수 갱신
    ELSIF TG_TABLE_NAME = 'comment_likes' THEN
        UPDATE comments SET lk_cnt = lk_cnt + like_delta WHERE id = COALESCE(NEW.comment_id, OLD.comment_id);
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
        UPDATE posts SET att_cnt = att_cnt + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET att_cnt = att_cnt - 1 WHERE id = OLD.post_id;
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
    u.nickname as author_nickname,
    b.nm as board_nm,
    p.crt_dt,
    (p.vw_cnt + p.lk_cnt * 10 + p.cmt_cnt * 5) as popularity_score
FROM bbs_posts p
JOIN users u ON p.user_id = u.id
JOIN bbs_boards b ON p.board_id = b.id
WHERE p.stts = 'PUBLISHED'
ORDER BY popularity_score DESC;

-- 뷰: 사용자 활동 통계
CREATE VIEW bbs_user_activity_stats AS
SELECT
    u.id,
    u.nickname,
    u.user_level,
    COUNT(DISTINCT p.id) as total_posts,
    COUNT(DISTINCT c.id) as total_comments,
    COUNT(DISTINCT pl.id) as total_post_likes,
    COUNT(DISTINCT cl.id) as total_comment_likes,
    COUNT(DISTINCT bm.id) as total_bookmarks,
    MAX(GREATEST(p.crt_dt, c.crt_dt)) as last_activity_date
FROM users u
LEFT JOIN bbs_posts p ON u.id = p.user_id AND p.stts = 'PUBLISHED'
LEFT JOIN bbs_comments c ON u.id = c.user_id AND c.stts = 'PUBLISHED'
LEFT JOIN bbs_post_likes pl ON u.id = pl.user_id
LEFT JOIN bbs_comment_likes cl ON u.id = cl.user_id
LEFT JOIN bbs_bookmarks bm ON u.id = bm.user_id
GROUP BY u.id, u.nickname, u.user_level;

-- Row Level Security (RLS) 설정
-- 참고: users 테이블은 기존 시스템에서 RLS 관리
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

-- current_user_id() 및 current_user_level() 함수
CREATE OR REPLACE FUNCTION current_user_id() RETURNS BIGINT AS $$
BEGIN
    -- 실제 구현에서는 JWT 토큰에서 사용자 ID를 추출
    RETURN 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_level() RETURNS INT AS $$
BEGIN
    -- 실제 구현에서는 JWT 토큰에서 사용자 레벨을 추출
    RETURN 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
        u.nickname,
        c.nm,
        p.vw_cnt,
        p.lk_cnt,
        p.cmt_cnt,
        p.crt_dt
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
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
    UPDATE posts SET vw_cnt = vw_cnt + 1 WHERE id = post_id_param;

    -- 게시글 정보 반환
    RETURN QUERY
    SELECT
        p.id,
        p.board_id,
        p.category_id,
        p.user_id,
        p.ttl,
        p.cn,
        u.nickname,
        p.vw_cnt,
        p.lk_cnt,
        p.cmt_cnt,
        p.crt_dt,
        p.upd_dt
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = post_id_param;
END;
$$ LANGUAGE plpgsql;

-- 알림 테이블
CREATE TABLE bbs_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    typ notification_type NOT NULL,
    ttl VARCHAR(200) NOT NULL,
    msg TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    related_post_id BIGINT REFERENCES bbs_posts(id) ON DELETE CASCADE,
    related_comment_id BIGINT REFERENCES bbs_comments(id) ON DELETE CASCADE,
    related_user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
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
    follower_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_typ VARCHAR(50), -- TITLE, CONTENT, AUTHOR, TAG 등
    result_cnt INT DEFAULT 0,
    ip_addr INET,
    crt_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 검색 로그 인덱스
CREATE INDEX idx_bbs_search_logs_user_crt_dt ON bbs_search_logs(user_id, crt_dt);
CREATE INDEX idx_bbs_search_logs_query ON bbs_search_logs USING GIN (to_tsvector('korean', search_query));

-- 관리자 로그 테이블
CREATE TABLE bbs_admin_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- ENUM 타입 추가 정의
CREATE TYPE notification_type AS ENUM ('NEW_COMMENT', 'NEW_LIKE', 'NEW_FOLLOW', 'POST_MENTION', 'COMMENT_MENTION', 'ADMIN_NOTICE');
CREATE TYPE follow_type AS ENUM ('USER', 'BOARD');
CREATE TYPE activity_type AS ENUM ('LOGIN', 'LOGOUT', 'POST_CREATE', 'POST_UPDATE', 'POST_DELETE', 'COMMENT_CREATE', 'COMMENT_DELETE', 'LIKE', 'BOOKMARK', 'REPORT');
CREATE TYPE change_type AS ENUM ('CREATE', 'UPDATE', 'DELETE');
CREATE TYPE admin_action_type AS ENUM ('USER_BAN', 'USER_UNBAN', 'POST_HIDE', 'POST_SHOW', 'COMMENT_HIDE', 'COMMENT_SHOW', 'REPORT_RESOLVE', 'BOARD_CREATE', 'BOARD_UPDATE', 'BOARD_DELETE');

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

COMMENT ON TABLE users IS '게시판 사용자 정보';
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
