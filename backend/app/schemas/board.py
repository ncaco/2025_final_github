"""게시판 관련 스키마"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


# ENUM 클래스들
class BoardType(str, Enum):
    GENERAL = "GENERAL"
    NOTICE = "NOTICE"
    QNA = "QNA"
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"


class PermissionLevel(str, Enum):
    ALL = "ALL"
    USER = "USER"
    ADMIN = "ADMIN"


class PostStatus(str, Enum):
    PUBLISHED = "PUBLISHED"
    DRAFT = "DRAFT"
    DELETED = "DELETED"
    HIDDEN = "HIDDEN"
    SECRET = "SECRET"


class CommentStatus(str, Enum):
    PUBLISHED = "PUBLISHED"
    DELETED = "DELETED"
    HIDDEN = "HIDDEN"
    SECRET = "SECRET"


class AttachmentFileType(str, Enum):
    IMAGE = "IMAGE"
    DOCUMENT = "DOCUMENT"
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"
    OTHER = "OTHER"


class LikeType(str, Enum):
    LIKE = "LIKE"
    DISLIKE = "DISLIKE"


class ReportTargetType(str, Enum):
    POST = "POST"
    COMMENT = "COMMENT"
    USER = "USER"


class ReportReason(str, Enum):
    SPAM = "SPAM"
    ABUSE = "ABUSE"
    INAPPROPRIATE = "INAPPROPRIATE"
    COPYRIGHT = "COPYRIGHT"
    OTHER = "OTHER"


class ReportStatus(str, Enum):
    PENDING = "PENDING"
    REVIEWED = "REVIEWED"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"


class NotificationType(str, Enum):
    NEW_COMMENT = "NEW_COMMENT"
    NEW_LIKE = "NEW_LIKE"
    NEW_FOLLOW = "NEW_FOLLOW"
    POST_MENTION = "POST_MENTION"
    COMMENT_MENTION = "COMMENT_MENTION"
    ADMIN_NOTICE = "ADMIN_NOTICE"


class FollowType(str, Enum):
    USER = "USER"
    BOARD = "BOARD"


# 게시판 스키마
class BoardBase(BaseModel):
    """게시판 기본 스키마"""
    nm: str = Field(..., max_length=100, description="게시판 이름")
    dsc: Optional[str] = Field(None, description="게시판 설명")
    typ: BoardType = Field(default=BoardType.GENERAL, description="게시판 유형")
    read_permission: PermissionLevel = Field(default=PermissionLevel.ALL, description="읽기 권한 레벨")
    write_permission: PermissionLevel = Field(default=PermissionLevel.USER, description="쓰기 권한 레벨")
    comment_permission: PermissionLevel = Field(default=PermissionLevel.USER, description="댓글 권한 레벨")
    allow_attachment: bool = Field(default=True, description="첨부파일 허용 여부")
    allow_image: bool = Field(default=True, description="이미지 허용 여부")
    max_file_size: int = Field(default=10, ge=1, description="최대 파일 크기(MB)")
    sort_order: int = Field(default=0, description="정렬 순서")


class BoardCreate(BoardBase):
    """게시판 생성 스키마"""
    pass


class BoardUpdate(BaseModel):
    """게시판 수정 스키마"""
    nm: Optional[str] = Field(None, max_length=100)
    dsc: Optional[str] = None
    typ: Optional[BoardType] = None
    actv_yn: Optional[bool] = None
    read_permission: Optional[PermissionLevel] = None
    write_permission: Optional[PermissionLevel] = None
    comment_permission: Optional[PermissionLevel] = None
    allow_attachment: Optional[bool] = None
    allow_image: Optional[bool] = None
    max_file_size: Optional[int] = Field(None, ge=1)
    sort_order: Optional[int] = None


class BoardResponse(BoardBase):
    """게시판 응답 스키마"""
    id: int
    actv_yn: bool
    post_count: int
    total_view_count: Optional[int] = 0
    follower_count: Optional[int] = 0
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: Optional[bool] = True


# 카테고리 스키마
class CategoryBase(BaseModel):
    """카테고리 기본 스키마"""
    board_id: int = Field(..., description="게시판 ID")
    nm: str = Field(..., max_length=50, description="카테고리 이름")
    dsc: Optional[str] = Field(None, max_length=200, description="카테고리 설명")
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="카테고리 색상 (#RRGGBB)")
    icon: Optional[str] = Field(None, max_length=50, description="카테고리 아이콘")
    sort_order: int = Field(default=0, description="정렬 순서")


class CategoryCreate(CategoryBase):
    """카테고리 생성 스키마"""
    pass


class CategoryUpdate(BaseModel):
    """카테고리 수정 스키마"""
    nm: Optional[str] = Field(None, max_length=50)
    dsc: Optional[str] = Field(None, max_length=200)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=50)
    sort_order: Optional[int] = None
    actv_yn: Optional[bool] = None


class CategoryResponse(CategoryBase):
    """카테고리 응답 스키마"""
    id: int
    post_count: int
    actv_yn: bool
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool


# 게시글 스키마
class PostBase(BaseModel):
    """게시글 기본 스키마"""
    board_id: int = Field(..., description="게시판 ID")
    category_id: Optional[int] = Field(None, description="카테고리 ID")
    ttl: str = Field(..., max_length=200, description="제목")
    cn: str = Field(..., description="내용")
    smmry: Optional[str] = Field(None, max_length=300, description="요약")
    ntce_yn: bool = Field(default=False, description="공지사항 여부")
    scr_yn: bool = Field(default=False, description="비밀글 여부")
    pwd: Optional[str] = Field(None, max_length=255, description="비밀번호 (해시값)")


class PostCreate(PostBase):
    """게시글 생성 스키마"""
    tags: Optional[List[str]] = Field(default_factory=list, description="태그 목록")


class PostUpdate(BaseModel):
    """게시글 수정 스키마"""
    ttl: Optional[str] = Field(None, max_length=200)
    cn: Optional[str] = None
    smmry: Optional[str] = Field(None, max_length=300)
    category_id: Optional[int] = None
    ntce_yn: Optional[bool] = None
    scr_yn: Optional[bool] = None
    pwd: Optional[str] = Field(None, max_length=255, description="비밀번호 (비밀글 수정 시)")
    stts: Optional[PostStatus] = None
    tags: Optional[List[str]] = None
    change_rsn: Optional[str] = Field(None, description="변경 사유")


class PostResponse(PostBase):
    """게시글 응답 스키마"""
    id: int
    user_id: str
    stts: PostStatus
    vw_cnt: int
    lk_cnt: int
    cmt_cnt: int
    att_cnt: int
    lst_cmt_dt: Optional[datetime]
    pbl_dt: datetime
    crt_dt: datetime
    upd_dt: Optional[datetime]
    author_nickname: Optional[str] = None
    category_nm: Optional[str] = None
    board_nm: Optional[str] = None
    tags: Optional[List[str]] = None

    class Config:
        from_attributes = True


class PostDetailResponse(PostResponse):
    """게시글 상세 응답 스키마"""
    attachments: Optional[List[Dict[str, Any]]] = None
    is_liked: Optional[bool] = None
    is_bookmarked: Optional[bool] = None

    class Config:
        from_attributes = True


class PostListRequest(BaseModel):
    """게시글 목록 요청 스키마"""
    board_id: int
    category_id: Optional[int] = None
    status: PostStatus = PostStatus.PUBLISHED
    search_query: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class PostListResponse(BaseModel):
    """게시글 목록 응답 스키마"""
    posts: List[PostResponse]
    total_count: int
    page: int
    limit: int
    total_pages: int


# 댓글 스키마
class CommentBase(BaseModel):
    """댓글 기본 스키마"""
    post_id: int = Field(..., description="게시글 ID")
    cn: str = Field(..., description="내용")
    parent_id: Optional[int] = Field(None, description="부모 댓글 ID")
    scr_yn: bool = Field(default=False, description="비밀댓글 여부")


class CommentCreate(CommentBase):
    """댓글 생성 스키마"""
    pass


class CommentUpdate(BaseModel):
    """댓글 수정 스키마"""
    cn: Optional[str] = None
    scr_yn: Optional[bool] = None
    stts: Optional[CommentStatus] = None


class CommentResponse(CommentBase):
    """댓글 응답 스키마"""
    id: int
    user_id: str
    stts: CommentStatus
    lk_cnt: int
    depth: int
    sort_order: int
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    author_nickname: Optional[str]
    is_liked: Optional[bool] = None
    children: Optional[List['CommentResponse']] = None

    class Config:
        from_attributes = True


# 첨부파일 스키마
class AttachmentCreate(BaseModel):
    """첨부파일 생성 스키마"""
    post_id: int = Field(..., description="게시글 ID")
    file: Any  # 실제로는 UploadFile이지만 스키마에서는 Any로 처리


class AttachmentResponse(BaseModel):
    """첨부파일 응답 스키마"""
    id: int
    post_id: int
    user_id: str
    orgnl_file_nm: str
    file_url: str
    file_sz: int
    mime_typ: str
    file_typ: AttachmentFileType
    dwld_cnt: int
    crt_dt: datetime
    use_yn: bool
    thumbnails: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True


# 좋아요 스키마
class LikeRequest(BaseModel):
    """좋아요 요청 스키마"""
    typ: LikeType = LikeType.LIKE


class LikeResponse(BaseModel):
    """좋아요 응답 스키마"""
    id: int
    user_id: str
    typ: LikeType
    crt_dt: datetime


# 북마크 스키마
class BookmarkResponse(BaseModel):
    """북마크 응답 스키마"""
    id: int
    post_id: int
    user_id: str
    crt_dt: datetime


# 신고 스키마
class ReportCreate(BaseModel):
    """신고 생성 스키마"""
    target_type: ReportTargetType = Field(..., description="신고 대상 유형")
    target_id: int = Field(..., description="신고 대상 ID")
    rsn: ReportReason = Field(..., description="신고 사유")
    dsc: Optional[str] = Field(None, description="신고 상세 설명")


class ReportUpdate(BaseModel):
    """신고 수정 스키마 (관리자용)"""
    stts: Optional[ReportStatus] = None
    processed_by: Optional[str] = None


class ReportResponse(BaseModel):
    """신고 응답 스키마"""
    id: int
    reporter_id: str
    target_type: ReportTargetType
    target_id: int
    rsn: ReportReason
    dsc: Optional[str]
    stts: ReportStatus
    processed_by: Optional[str]
    prcs_dt: Optional[datetime]
    crt_dt: datetime
    board_nm: Optional[str] = None  # 게시판명 (POST 타입인 경우)


# 알림 스키마
class NotificationResponse(BaseModel):
    """알림 응답 스키마"""
    id: int
    user_id: str
    typ: NotificationType
    ttl: str
    msg: Optional[str]
    is_read: bool
    related_post_id: Optional[int]
    related_comment_id: Optional[int]
    related_user_id: Optional[str]
    noti_metadata: Optional[Dict[str, Any]]
    crt_dt: datetime


# 태그 스키마
class TagBase(BaseModel):
    """태그 기본 스키마"""
    nm: str = Field(..., max_length=50, description="태그 이름")
    dsc: Optional[str] = Field(None, max_length=200, description="태그 설명")
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="태그 색상")


class TagCreate(TagBase):
    """태그 생성 스키마"""
    pass


class TagUpdate(BaseModel):
    """태그 수정 스키마"""
    dsc: Optional[str] = Field(None, max_length=200)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')


class TagResponse(TagBase):
    """태그 응답 스키마"""
    id: int
    usage_cnt: int
    crt_dt: datetime


# 팔로우 스키마
class FollowCreate(BaseModel):
    """팔로우 생성 스키마"""
    following_id: str = Field(..., description="팔로잉 대상 ID")
    typ: FollowType = Field(default=FollowType.USER, description="팔로우 유형")


class FollowResponse(BaseModel):
    """팔로우 응답 스키마"""
    id: int
    follower_id: str
    following_id: str
    typ: FollowType
    crt_dt: datetime


# 검색 요청 스키마
class SearchRequest(BaseModel):
    """검색 요청 스키마"""
    query: str = Field(..., description="검색 쿼리")
    board_id: Optional[int] = None
    category_id: Optional[int] = None
    search_type: Optional[str] = Field(None, description="검색 유형 (TITLE, CONTENT, AUTHOR, TAG)")
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class SearchResponse(BaseModel):
    """검색 응답 스키마"""
    posts: List[PostResponse]
    total_count: int
    page: int
    limit: int
    total_pages: int


# 통계 스키마
class BoardStatisticsResponse(BaseModel):
    """게시판 통계 응답 스키마"""
    id: int
    nm: str
    total_posts: int
    published_posts: int
    posts_last_week: int
    posts_today: int
    last_post_date: Optional[datetime]


class PopularPostResponse(BaseModel):
    """인기 게시글 응답 스키마"""
    id: int
    ttl: str
    vw_cnt: int
    lk_cnt: int
    cmt_cnt: int
    author_nickname: Optional[str]
    board_nm: str
    crt_dt: datetime
    popularity_score: float


class UserActivityStatsResponse(BaseModel):
    """사용자 활동 통계 응답 스키마"""
    user_id: str
    nickname: Optional[str]
    total_posts: int
    total_comments: int
    total_post_likes: int
    total_comment_likes: int
    total_bookmarks: int
    last_activity_date: Optional[datetime]


# 사용자 설정 스키마
class UserPreferenceUpdate(BaseModel):
    """사용자 설정 수정 스키마"""
    pref_key: str = Field(..., description="설정 키")
    pref_val: str = Field(..., description="설정 값")


class UserPreferenceResponse(BaseModel):
    """사용자 설정 응답 스키마"""
    id: int
    user_id: str
    pref_key: str
    pref_val: Optional[str]
    upd_dt: Optional[datetime]
