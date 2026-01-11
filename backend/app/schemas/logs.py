"""로그 관련 스키마"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class ActivityType(str, Enum):
    """활동 유형"""
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


class ChangeType(str, Enum):
    """변경 유형"""
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class AdminActionType(str, Enum):
    """관리자 작업 유형"""
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


class ActivityLogResponse(BaseModel):
    """활동 로그 응답"""
    id: int = Field(..., description="로그 ID")
    user_id: str = Field(..., description="사용자 ID")
    act_typ: ActivityType = Field(..., description="활동 유형")
    act_dsc: Optional[str] = Field(None, description="활동 설명")
    target_typ: Optional[str] = Field(None, description="대상 유형")
    target_id: Optional[int] = Field(None, description="대상 ID")
    ip_addr: Optional[str] = Field(None, description="IP 주소")
    user_agent: Optional[str] = Field(None, description="User Agent")
    meta_data: Optional[Dict[str, Any]] = Field(None, description="추가 데이터")
    crt_dt: datetime = Field(..., description="생성일시")

    class Config:
        from_attributes = True


class PostHistoryResponse(BaseModel):
    """게시글 히스토리 응답"""
    id: int = Field(..., description="히스토리 ID")
    post_id: int = Field(..., description="게시글 ID")
    user_id: str = Field(..., description="수정자 ID")
    prev_ttl: Optional[str] = Field(None, description="이전 제목")
    new_ttl: Optional[str] = Field(None, description="새 제목")
    prev_cn: Optional[str] = Field(None, description="이전 내용")
    new_cn: Optional[str] = Field(None, description="새 내용")
    change_typ: ChangeType = Field(..., description="변경 유형")
    change_rsn: Optional[str] = Field(None, description="변경 사유")
    crt_dt: datetime = Field(..., description="생성일시")

    class Config:
        from_attributes = True


class SearchLogResponse(BaseModel):
    """검색 로그 응답"""
    id: int = Field(..., description="로그 ID")
    user_id: Optional[str] = Field(None, description="사용자 ID")
    search_query: str = Field(..., description="검색 쿼리")
    search_typ: Optional[str] = Field(None, description="검색 유형")
    result_cnt: int = Field(..., description="결과 수")
    ip_addr: Optional[str] = Field(None, description="IP 주소")
    crt_dt: datetime = Field(..., description="생성일시")

    class Config:
        from_attributes = True


class AdminLogResponse(BaseModel):
    """관리자 로그 응답"""
    id: int = Field(..., description="로그 ID")
    admin_id: str = Field(..., description="관리자 ID")
    act_typ: AdminActionType = Field(..., description="작업 유형")
    act_dsc: Optional[str] = Field(None, description="작업 설명")
    target_typ: Optional[str] = Field(None, description="대상 유형")
    target_id: Optional[int] = Field(None, description="대상 ID")
    old_val: Optional[Dict[str, Any]] = Field(None, description="이전 값")
    new_val: Optional[Dict[str, Any]] = Field(None, description="새 값")
    ip_addr: Optional[str] = Field(None, description="IP 주소")
    crt_dt: datetime = Field(..., description="생성일시")

    class Config:
        from_attributes = True


class LogListResponse(BaseModel):
    """로그 목록 응답"""
    items: List[Any] = Field(..., description="로그 목록")
    total: int = Field(..., description="전체 항목 수")
    page: int = Field(..., description="현재 페이지")
    limit: int = Field(..., description="페이지당 항목 수")
