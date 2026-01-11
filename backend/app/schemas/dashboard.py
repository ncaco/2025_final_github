"""대시보드 관련 스키마"""
from datetime import datetime
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel, Field
from enum import Enum


class ActivityType(str, Enum):
    """활동 유형"""
    POST = "POST"
    COMMENT = "COMMENT"
    BOOKMARK = "BOOKMARK"
    FOLLOW = "FOLLOW"
    REPORT = "REPORT"


class DashboardReportStatus(str, Enum):
    """대시보드 신고 상태 (프론트엔드 형식)"""
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


# 통계 응답 스키마
class DashboardStatsResponse(BaseModel):
    """대시보드 통계 응답"""
    total_posts: int = Field(..., description="전체 게시글 수")
    total_comments: int = Field(..., description="전체 댓글 수")
    total_bookmarks: int = Field(..., description="전체 북마크 수")
    total_follows: int = Field(..., description="전체 팔로우 수")
    posts_today: int = Field(..., description="오늘 작성한 게시글 수")
    comments_today: int = Field(..., description="오늘 작성한 댓글 수")

    class Config:
        from_attributes = True


# 최근 활동 응답 스키마
class RecentActivityResponse(BaseModel):
    """최근 활동 응답"""
    id: int = Field(..., description="활동 ID")
    type: ActivityType = Field(..., description="활동 유형")
    title: str = Field(..., description="활동 제목")
    created_at: datetime = Field(..., description="생성일시")

    class Config:
        from_attributes = True


# 내 게시글 응답 스키마
class MyPostResponse(BaseModel):
    """내 게시글 응답"""
    id: str = Field(..., description="게시글 ID")
    title: str = Field(..., description="제목")
    content: str = Field(..., description="내용")
    board_id: str = Field(..., description="게시판 ID")
    board_name: str = Field(..., description="게시판 이름")
    created_at: datetime = Field(..., description="생성일시")
    updated_at: Optional[datetime] = Field(None, description="수정일시")
    view_count: int = Field(..., description="조회수")
    like_count: int = Field(..., description="좋아요 수")
    comment_count: int = Field(..., description="댓글 수")

    class Config:
        from_attributes = True


# 내 댓글 응답 스키마
class MyCommentResponse(BaseModel):
    """내 댓글 응답"""
    id: str = Field(..., description="댓글 ID")
    content: str = Field(..., description="내용")
    post_id: str = Field(..., description="게시글 ID")
    post_title: str = Field(..., description="게시글 제목")
    board_id: str = Field(..., description="게시판 ID")
    board_name: str = Field(..., description="게시판 이름")
    created_at: datetime = Field(..., description="생성일시")
    updated_at: Optional[datetime] = Field(None, description="수정일시")

    class Config:
        from_attributes = True


# 내 북마크 응답 스키마
class MyBookmarkResponse(BaseModel):
    """내 북마크 응답"""
    id: str = Field(..., description="북마크 ID")
    post_id: str = Field(..., description="게시글 ID")
    post_title: str = Field(..., description="게시글 제목")
    board_id: str = Field(..., description="게시판 ID")
    board_name: str = Field(..., description="게시판 이름")
    created_at: datetime = Field(..., description="생성일시")

    class Config:
        from_attributes = True


# 내 팔로우 응답 스키마
class MyFollowResponse(BaseModel):
    """내 팔로우 응답"""
    id: str = Field(..., description="팔로우 ID")
    board_id: str = Field(..., description="게시판 ID")
    board_name: str = Field(..., description="게시판 이름")
    board_description: Optional[str] = Field(None, description="게시판 설명")
    created_at: datetime = Field(..., description="생성일시")

    class Config:
        from_attributes = True


# 내 신고 응답 스키마
class MyReportResponse(BaseModel):
    """내 신고 응답"""
    id: str = Field(..., description="신고 ID")
    title: str = Field(..., description="신고 제목")
    reason: str = Field(..., description="신고 사유")
    status: DashboardReportStatus = Field(..., description="신고 상태")
    created_at: datetime = Field(..., description="생성일시")
    updated_at: Optional[datetime] = Field(None, description="수정일시")
    # 추가 필드
    target_type: Optional[str] = Field(None, description="신고 대상 유형")
    target_id: Optional[int] = Field(None, description="신고 대상 ID")
    target_author_id: Optional[str] = Field(None, description="신고 대상 작성자 ID")
    target_author_nickname: Optional[str] = Field(None, description="신고 대상 작성자 닉네임")
    description: Optional[str] = Field(None, description="신고 상세 설명")
    processed_by: Optional[str] = Field(None, description="처리자 ID")
    processed_at: Optional[datetime] = Field(None, description="처리일시")

    class Config:
        from_attributes = True


# 페이징된 목록 응답 스키마 (제네릭)
T = TypeVar('T')


class DashboardListResponse(BaseModel, Generic[T]):
    """페이징된 목록 응답"""
    items: List[T] = Field(..., description="목록 항목")
    total: int = Field(..., description="전체 항목 수")

    class Config:
        from_attributes = True
