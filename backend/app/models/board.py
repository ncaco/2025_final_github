"""게시판 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, BigInteger, Index, ForeignKey, UniqueConstraint, func, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import INET, JSONB
import enum
from app.database import Base
from app.models.base import BaseModel


# ENUM 타입 정의
class BoardType(enum.Enum):
    GENERAL = "GENERAL"
    NOTICE = "NOTICE"
    QNA = "QNA"
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"


class PermissionLevel(enum.Enum):
    ALL = "ALL"
    USER = "USER"
    ADMIN = "ADMIN"


class PostStatus(enum.Enum):
    PUBLISHED = "PUBLISHED"
    DRAFT = "DRAFT"
    DELETED = "DELETED"
    HIDDEN = "HIDDEN"
    SECRET = "SECRET"


class CommentStatus(enum.Enum):
    PUBLISHED = "PUBLISHED"
    DELETED = "DELETED"
    HIDDEN = "HIDDEN"
    SECRET = "SECRET"


class AttachmentFileType(enum.Enum):
    IMAGE = "IMAGE"
    DOCUMENT = "DOCUMENT"
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    OTHER = "OTHER"


class LikeType(enum.Enum):
    LIKE = "LIKE"
    DISLIKE = "DISLIKE"


class ReportTargetType(enum.Enum):
    POST = "POST"
    COMMENT = "COMMENT"
    USER = "USER"


class ReportReason(enum.Enum):
    SPAM = "SPAM"
    ABUSE = "ABUSE"
    INAPPROPRIATE = "INAPPROPRIATE"
    COPYRIGHT = "COPYRIGHT"
    OTHER = "OTHER"


class ReportStatus(enum.Enum):
    PENDING = "PENDING"
    REVIEWED = "REVIEWED"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class NotificationType(enum.Enum):
    NEW_COMMENT = "NEW_COMMENT"
    NEW_LIKE = "NEW_LIKE"
    NEW_FOLLOW = "NEW_FOLLOW"
    POST_MENTION = "POST_MENTION"
    COMMENT_MENTION = "COMMENT_MENTION"
    ADMIN_NOTICE = "ADMIN_NOTICE"


class FollowType(enum.Enum):
    USER = "USER"
    BOARD = "BOARD"


class ActivityType(enum.Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    POST_CREATE = "POST_CREATE"
    POST_UPDATE = "POST_UPDATE"
    POST_DELETE = "POST_DELETE"
    COMMENT_CREATE = "COMMENT_CREATE"
    COMMENT_DELETE = "COMMENT_DELETE"
    LIKE = "LIKE"
    BOOKMARK = "BOOKMARK"
    REPORT = "REPORT"


class ChangeType(enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class AdminActionType(enum.Enum):
    USER_BAN = "USER_BAN"
    USER_UNBAN = "USER_UNBAN"
    POST_HIDE = "POST_HIDE"
    POST_SHOW = "POST_SHOW"
    COMMENT_HIDE = "COMMENT_HIDE"
    COMMENT_SHOW = "COMMENT_SHOW"
    REPORT_RESOLVE = "REPORT_RESOLVE"
    BOARD_CREATE = "BOARD_CREATE"
    BOARD_UPDATE = "BOARD_UPDATE"
    BOARD_DELETE = "BOARD_DELETE"


class BbsBoard(BaseModel):
    """게시판 테이블"""
    __tablename__ = "bbs_boards"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="게시판 일련번호")
    nm = Column(String(100), nullable=False, comment="게시판 이름")
    dsc = Column(Text, comment="게시판 설명")
    typ = Column(Enum(BoardType), default=BoardType.GENERAL, comment="게시판 유형")
    actv_yn = Column(Boolean, default=True, comment="활성 상태")
    read_permission = Column(Enum(PermissionLevel), default=PermissionLevel.ALL, comment="읽기 권한 레벨")
    write_permission = Column(Enum(PermissionLevel), default=PermissionLevel.USER, comment="쓰기 권한 레벨")
    comment_permission = Column(Enum(PermissionLevel), default=PermissionLevel.USER, comment="댓글 권한 레벨")
    allow_attachment = Column(Boolean, default=True, comment="첨부파일 허용 여부")
    allow_image = Column(Boolean, default=True, comment="이미지 허용 여부")
    max_file_size = Column(Integer, default=10, comment="최대 파일 크기(MB)")
    sort_order = Column(Integer, default=0, comment="정렬 순서")
    post_count = Column(Integer, default=0, comment="게시글 수")

    # 관계
    categories = relationship("BbsCategory", back_populates="board", cascade="all, delete-orphan")
    posts = relationship("BbsPost", back_populates="board", cascade="all, delete-orphan")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_boards_typ", "typ"),
        Index("idx_bbs_boards_actv_yn", "actv_yn"),
        Index("idx_bbs_boards_sort_order", "sort_order"),
    )


class BbsCategory(BaseModel):
    """카테고리 테이블"""
    __tablename__ = "bbs_categories"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="카테고리 일련번호")
    board_id = Column(BigInteger, ForeignKey("bbs_boards.id", ondelete="CASCADE"), nullable=False, comment="게시판 ID")
    nm = Column(String(50), nullable=False, comment="카테고리 이름")
    dsc = Column(String(200), comment="카테고리 설명")
    color = Column(String(7), comment="카테고리 색상 (#RRGGBB 형식)")
    icon = Column(String(50), comment="카테고리 아이콘")
    sort_order = Column(Integer, default=0, comment="정렬 순서")
    actv_yn = Column(Boolean, default=True, nullable=False, comment="활성 상태")
    post_count = Column(Integer, default=0, comment="게시글 수")

    # 관계
    board = relationship("BbsBoard", back_populates="categories")
    posts = relationship("BbsPost", back_populates="category", cascade="all, delete-orphan")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_categories_board_id", "board_id"),
        Index("idx_bbs_categories_actv_yn", "board_id", "actv_yn"),
        Index("idx_bbs_categories_sort_order", "board_id", "sort_order"),
        Index("idx_bbs_categories_board_nm", "board_id", "nm", unique=True, postgresql_where="actv_yn = true"),
    )


class BbsPost(Base):
    """게시글 테이블"""
    __tablename__ = "bbs_posts"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="게시글 일련번호")
    board_id = Column(BigInteger, ForeignKey("bbs_boards.id", ondelete="CASCADE"), nullable=False, comment="게시판 ID")
    category_id = Column(BigInteger, ForeignKey("bbs_categories.id", ondelete="SET NULL"), comment="카테고리 ID")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="작성자 ID")
    ttl = Column(String(200), nullable=False, comment="제목")
    cn = Column(Text, nullable=False, comment="내용")
    smmry = Column(String(300), comment="요약")
    stts = Column(Enum(PostStatus), default=PostStatus.PUBLISHED, comment="상태")
    ntce_yn = Column(Boolean, default=False, comment="공지사항 여부")
    scr_yn = Column(Boolean, default=False, comment="비밀글 여부")
    pwd = Column(String(255), comment="비밀번호 (해시값)")
    vw_cnt = Column(Integer, default=0, comment="조회수")
    lk_cnt = Column(Integer, default=0, comment="좋아요 수")
    cmt_cnt = Column(Integer, default=0, comment="댓글 수")
    att_cnt = Column(Integer, default=0, comment="첨부파일 수")
    lst_cmt_dt = Column(DateTime, comment="마지막 댓글 일시")
    pbl_dt = Column(DateTime, default=func.current_timestamp(), comment="게시일시")

    # 직접 추가하는 BaseModel 필드들 (일부만)
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")
    upd_dt = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True, comment="수정일시")

    # 관계
    board = relationship("BbsBoard", back_populates="posts")
    category = relationship("BbsCategory", back_populates="posts")
    comments = relationship("BbsComment", back_populates="post", cascade="all, delete-orphan")
    attachments = relationship("BbsAttachment", back_populates="post", cascade="all, delete-orphan")
    post_likes = relationship("BbsPostLike", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("BbsBookmark", back_populates="post", cascade="all, delete-orphan")
    post_tags = relationship("BbsPostTag", back_populates="post", cascade="all, delete-orphan")
    notifications = relationship("BbsNotification", back_populates="related_post", cascade="all, delete-orphan")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_posts_board_stts_crt_dt", "board_id", "stts", "crt_dt"),
        Index("idx_bbs_posts_user_crt_dt", "user_id", "crt_dt"),
        Index("idx_bbs_posts_category", "category_id"),
        Index("idx_bbs_posts_stts", "stts"),
        Index("idx_bbs_posts_ntce_yn", "ntce_yn", "crt_dt"),
        Index("idx_bbs_posts_pbl_dt", "pbl_dt"),
    )


class BbsComment(Base):
    """댓글 테이블"""
    __tablename__ = "bbs_comments"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="댓글 일련번호")
    post_id = Column(BigInteger, ForeignKey("bbs_posts.id", ondelete="CASCADE"), nullable=False, comment="게시글 ID")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="작성자 ID")
    parent_id = Column(BigInteger, ForeignKey("bbs_comments.id", ondelete="CASCADE"), comment="부모 댓글 ID (대댓글용)")
    cn = Column(Text, nullable=False, comment="내용")
    stts = Column(Enum(CommentStatus), default=CommentStatus.PUBLISHED, comment="상태")
    scr_yn = Column(Boolean, default=False, comment="비밀댓글 여부")
    lk_cnt = Column(Integer, default=0, comment="좋아요 수")
    depth = Column(Integer, default=0, comment="댓글 깊이 (0-5)")
    sort_order = Column(Integer, default=0, comment="정렬 순서")

    # 직접 추가하는 BaseModel 필드들 (일부만)
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")
    upd_dt = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True, comment="수정일시")

    # 관계
    post = relationship("BbsPost", back_populates="comments")
    parent = relationship("BbsComment", remote_side=[id], backref="children")
    comment_likes = relationship("BbsCommentLike", back_populates="comment", cascade="all, delete-orphan")
    notifications = relationship("BbsNotification", back_populates="related_comment", cascade="all, delete-orphan")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_comments_post_crt_dt", "post_id", "crt_dt"),
        Index("idx_bbs_comments_user_crt_dt", "user_id", "crt_dt"),
        Index("idx_bbs_comments_parent", "parent_id"),
        Index("idx_bbs_comments_depth", "depth"),
    )


class BbsAttachment(Base):
    """첨부파일 테이블"""
    __tablename__ = "bbs_attachments"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="첨부파일 일련번호")
    post_id = Column(BigInteger, ForeignKey("bbs_posts.id", ondelete="CASCADE"), nullable=False, comment="게시글 ID")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="업로드자 ID")
    orgnl_file_nm = Column(String(255), nullable=False, comment="원본 파일명")
    strd_file_nm = Column(String(255), nullable=False, comment="저장 파일명")
    file_path = Column(String(500), nullable=False, comment="파일 경로")
    file_url = Column(String(500), nullable=False, comment="파일 URL")
    file_sz = Column(BigInteger, nullable=False, comment="파일 크기 (바이트)")
    mime_typ = Column(String(100), nullable=False, comment="MIME 타입")
    file_typ = Column(Enum(AttachmentFileType), nullable=False, comment="파일 유형")
    dwld_cnt = Column(Integer, default=0, comment="다운로드 수")
    del_yn = Column(Boolean, default=False, nullable=False, comment="삭제여부")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    post = relationship("BbsPost", back_populates="attachments")
    thumbnails = relationship("BbsFileThumbnail", back_populates="attachment", cascade="all, delete-orphan")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_attachments_post", "post_id"),
        Index("idx_bbs_attachments_user", "user_id"),
        Index("idx_bbs_attachments_file_typ", "file_typ"),
        Index("idx_bbs_attachments_del_yn", "del_yn"),
    )


class BbsFileThumbnail(Base):
    """파일 썸네일 테이블"""
    __tablename__ = "bbs_file_thumbnails"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="썸네일 일련번호")
    attachment_id = Column(BigInteger, ForeignKey("bbs_attachments.id", ondelete="CASCADE"), nullable=False, comment="첨부파일 ID")
    thumbnail_path = Column(String(500), nullable=False, comment="썸네일 경로")
    thumbnail_url = Column(String(500), nullable=False, comment="썸네일 URL")
    thumbnail_sz = Column(BigInteger, nullable=False, comment="썸네일 크기 (바이트)")
    width = Column(Integer, comment="썸네일 너비")
    height = Column(Integer, comment="썸네일 높이")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    attachment = relationship("BbsAttachment", back_populates="thumbnails")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_file_thumbnails_attachment", "attachment_id"),
    )


class BbsPostLike(Base):
    """게시글 좋아요 테이블"""
    __tablename__ = "bbs_post_likes"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="좋아요 일련번호")
    post_id = Column(BigInteger, ForeignKey("bbs_posts.id", ondelete="CASCADE"), nullable=False, comment="게시글 ID")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="사용자 ID")
    typ = Column(Enum(LikeType), default=LikeType.LIKE, comment="좋아요 유형")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    post = relationship("BbsPost", back_populates="post_likes")

    # 제약조건
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_likes_post_user"),
        Index("idx_bbs_post_likes_post", "post_id"),
        Index("idx_bbs_post_likes_user_crt_dt", "user_id", "crt_dt"),
    )


class BbsCommentLike(Base):
    """댓글 좋아요 테이블"""
    __tablename__ = "bbs_comment_likes"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="좋아요 일련번호")
    comment_id = Column(BigInteger, ForeignKey("bbs_comments.id", ondelete="CASCADE"), nullable=False, comment="댓글 ID")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="사용자 ID")
    typ = Column(Enum(LikeType), default=LikeType.LIKE, comment="좋아요 유형")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    comment = relationship("BbsComment", back_populates="comment_likes")

    # 제약조건
    __table_args__ = (
        UniqueConstraint("comment_id", "user_id", name="uq_comment_likes_comment_user"),
        Index("idx_bbs_comment_likes_comment", "comment_id"),
        Index("idx_bbs_comment_likes_user_crt_dt", "user_id", "crt_dt"),
    )


class BbsBookmark(Base):
    """북마크 테이블"""
    __tablename__ = "bbs_bookmarks"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="북마크 일련번호")
    post_id = Column(BigInteger, ForeignKey("bbs_posts.id", ondelete="CASCADE"), nullable=False, comment="게시글 ID")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="사용자 ID")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    post = relationship("BbsPost", back_populates="bookmarks")

    # 제약조건
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_bookmarks_post_user"),
        Index("idx_bbs_bookmarks_post", "post_id"),
        Index("idx_bbs_bookmarks_user_crt_dt", "user_id", "crt_dt"),
    )


class BbsReport(Base):
    """신고 테이블"""
    __tablename__ = "bbs_reports"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="신고 일련번호")
    reporter_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="신고자 ID")
    target_type = Column(Enum(ReportTargetType), nullable=False, comment="신고 대상 유형")
    target_id = Column(BigInteger, nullable=False, comment="신고 대상 ID")
    rsn = Column(Enum(ReportReason), nullable=False, comment="신고 사유")
    dsc = Column(Text, comment="신고 상세 설명")
    stts = Column(Enum(ReportStatus), default=ReportStatus.PENDING, comment="신고 상태")
    processed_by = Column(String(100), ForeignKey("common_user.user_id", ondelete="SET NULL"), comment="처리자 ID")
    prcs_dt = Column(DateTime, comment="처리일시")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_reports_reporter", "reporter_id"),
        Index("idx_bbs_reports_target", "target_type", "target_id"),
        Index("idx_bbs_reports_stts_crt_dt", "stts", "crt_dt"),
    )


class BbsNotification(Base):
    """알림 테이블"""
    __tablename__ = "bbs_notifications"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="알림 일련번호")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="수신자 ID")
    typ = Column(Enum(NotificationType), nullable=False, comment="알림 유형")
    ttl = Column(String(200), nullable=False, comment="알림 제목")
    msg = Column(Text, comment="알림 메시지")
    is_read = Column(Boolean, default=False, comment="읽음 상태")
    related_post_id = Column(BigInteger, ForeignKey("bbs_posts.id", ondelete="CASCADE"), comment="관련 게시글 ID")
    related_comment_id = Column(BigInteger, ForeignKey("bbs_comments.id", ondelete="CASCADE"), comment="관련 댓글 ID")
    related_user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="SET NULL"), comment="관련 사용자 ID")
    meta_data = Column("metadata", JSONB, comment="추가 데이터 (JSON)")  # metadata는 SQLAlchemy 예약어이므로 meta_data로 사용
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    related_post = relationship("BbsPost", back_populates="notifications")
    related_comment = relationship("BbsComment", back_populates="notifications")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_notifications_user_crt_dt", "user_id", "crt_dt"),
        Index("idx_bbs_notifications_user_is_read", "user_id", "is_read"),
    )


class BbsTag(Base):
    """태그 테이블"""
    __tablename__ = "bbs_tags"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="태그 일련번호")
    nm = Column(String(50), unique=True, nullable=False, comment="태그 이름")
    dsc = Column(String(200), comment="태그 설명")
    color = Column(String(7), comment="태그 색상 (#RRGGBB 형식)")
    usage_cnt = Column(Integer, default=0, comment="사용 횟수")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    post_tags = relationship("BbsPostTag", back_populates="tag", cascade="all, delete-orphan")


class BbsPostTag(Base):
    """게시글-태그 매핑 테이블"""
    __tablename__ = "bbs_post_tags"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="매핑 일련번호")
    post_id = Column(BigInteger, ForeignKey("bbs_posts.id", ondelete="CASCADE"), nullable=False, comment="게시글 ID")
    tag_id = Column(BigInteger, ForeignKey("bbs_tags.id", ondelete="CASCADE"), nullable=False, comment="태그 ID")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 관계
    post = relationship("BbsPost", back_populates="post_tags")
    tag = relationship("BbsTag", back_populates="post_tags")

    # 제약조건
    __table_args__ = (
        UniqueConstraint("post_id", "tag_id", name="uq_post_tags_post_tag"),
        Index("idx_bbs_post_tags_post", "post_id"),
        Index("idx_bbs_post_tags_tag", "tag_id"),
    )


class BbsFollow(Base):
    """팔로우 테이블"""
    __tablename__ = "bbs_follows"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="팔로우 일련번호")
    follower_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="팔로워 ID")
    following_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="팔로잉 ID")
    typ = Column(Enum(FollowType), default=FollowType.USER, comment="팔로우 유형")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 제약조건
    __table_args__ = (
        UniqueConstraint("follower_id", "following_id", "typ", name="uq_follows_follower_following_type"),
        Index("idx_bbs_follows_follower", "follower_id"),
        Index("idx_bbs_follows_following", "following_id"),
    )


class BbsActivityLog(Base):
    """활동 로그 테이블"""
    __tablename__ = "bbs_activity_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="로그 일련번호")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="사용자 ID")
    act_typ = Column(Enum(ActivityType), nullable=False, comment="활동 유형")
    act_dsc = Column(Text, comment="활동 설명")
    target_typ = Column(String(50), comment="대상 유형 (POST, COMMENT, BOARD 등)")
    target_id = Column(BigInteger, comment="대상 ID")
    ip_addr = Column(INET, comment="IP 주소")
    user_agent = Column(Text, comment="User Agent")
    meta_data = Column("metadata", JSONB, comment="추가 데이터 (JSON)")  # metadata는 SQLAlchemy 예약어이므로 meta_data로 사용
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_activity_logs_user_crt_dt", "user_id", "crt_dt"),
        Index("idx_bbs_activity_logs_act_typ", "act_typ"),
    )


class BbsPostHistory(Base):
    """게시글 히스토리 테이블"""
    __tablename__ = "bbs_post_history"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="히스토리 일련번호")
    post_id = Column(BigInteger, ForeignKey("bbs_posts.id", ondelete="CASCADE"), nullable=False, comment="게시글 ID")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="수정자 ID")
    prev_ttl = Column(String(200), comment="이전 제목")
    new_ttl = Column(String(200), comment="새 제목")
    prev_cn = Column(Text, comment="이전 내용")
    new_cn = Column(Text, comment="새 내용")
    change_typ = Column(Enum(ChangeType), default=ChangeType.UPDATE, comment="변경 유형")
    change_rsn = Column(Text, comment="변경 사유")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_post_history_post_crt_dt", "post_id", "crt_dt"),
    )


class BbsUserPreference(Base):
    """사용자 설정 테이블"""
    __tablename__ = "bbs_user_preferences"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="설정 일련번호")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="사용자 ID")
    pref_key = Column(String(100), nullable=False, comment="설정 키")
    pref_val = Column(Text, comment="설정 값")
    upd_dt = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False, comment="수정일시")

    # 제약조건
    __table_args__ = (
        UniqueConstraint("user_id", "pref_key", name="uq_user_preferences_user_key"),
        Index("idx_bbs_user_preferences_user", "user_id"),
    )


class BbsSearchLog(Base):
    """검색 로그 테이블"""
    __tablename__ = "bbs_search_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="로그 일련번호")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), comment="사용자 ID (NULL 가능)")
    search_query = Column(Text, nullable=False, comment="검색 쿼리")
    search_typ = Column(String(50), comment="검색 유형 (TITLE, CONTENT, AUTHOR, TAG 등)")
    result_cnt = Column(Integer, default=0, comment="결과 수")
    ip_addr = Column(INET, comment="IP 주소")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_search_logs_user_crt_dt", "user_id", "crt_dt"),
    )


class BbsAdminLog(Base):
    """관리자 로그 테이블"""
    __tablename__ = "bbs_admin_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="로그 일련번호")
    admin_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="관리자 ID")
    act_typ = Column(Enum(AdminActionType), nullable=False, comment="작업 유형")
    act_dsc = Column(Text, comment="작업 설명")
    target_typ = Column(String(50), comment="대상 유형")
    target_id = Column(BigInteger, comment="대상 ID")
    old_val = Column(JSONB, comment="이전 값 (JSON)")
    new_val = Column(JSONB, comment="새 값 (JSON)")
    ip_addr = Column(INET, comment="IP 주소")
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")

    # 인덱스
    __table_args__ = (
        Index("idx_bbs_admin_logs_admin_crt_dt", "admin_id", "crt_dt"),
        Index("idx_bbs_admin_logs_act_typ", "act_typ"),
    )


class BbsStatistic(BaseModel):
    """통계 데이터 테이블"""
    __tablename__ = "bbs_statistics"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="통계 일련번호")
    stat_typ = Column(String(50), nullable=False, comment="통계 유형")
    stat_key = Column(String(100), nullable=False, comment="통계 키")
    stat_val = Column(BigInteger, default=0, comment="통계 값")
    stat_period = Column(String(20), comment="통계 기간 (DAILY, WEEKLY, MONTHLY 등)")
    period_start = Column(DateTime, comment="기간 시작일")
    period_end = Column(DateTime, comment="기간 종료일")
    noti_metadata = Column(JSONB, comment="추가 데이터 (JSON)")

    # 제약조건
    __table_args__ = (
        UniqueConstraint("stat_typ", "stat_key", "stat_period", "period_start", name="uq_statistics_type_key_period"),
        Index("idx_bbs_statistics_typ_period", "stat_typ", "stat_period", "period_start"),
    )
