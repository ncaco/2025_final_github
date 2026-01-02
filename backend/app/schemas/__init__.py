"""Pydantic 스키마"""
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserDetailResponse, UserLogin
from app.schemas.auth import Token, TokenData
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
from app.schemas.permission import PermissionCreate, PermissionUpdate, PermissionResponse
from app.schemas.oauth_account import OauthAccountCreate, OauthAccountUpdate, OauthAccountResponse
from app.schemas.role_permission import RolePermissionCreate, RolePermissionResponse
from app.schemas.user_role import UserRoleCreate, UserRoleUpdate, UserRoleResponse
from app.schemas.refresh_token import RefreshTokenCreate, RefreshTokenResponse
from app.schemas.audit_log import AuditLogCreate, AuditLogResponse
from app.schemas.file import FileCreate, FileUpdate, FileResponse
from app.schemas.locale import LocaleCreate, LocaleUpdate, LocaleResponse
from app.schemas.board import (
    BoardCreate, BoardUpdate, BoardResponse, CategoryCreate, CategoryUpdate,
    CategoryResponse, PostCreate, PostUpdate, PostResponse, PostDetailResponse,
    PostListRequest, PostListResponse, CommentCreate, CommentUpdate, CommentResponse,
    LikeRequest, LikeResponse, BookmarkResponse, ReportCreate, ReportResponse,
    TagCreate, TagUpdate, TagResponse, FollowCreate, FollowResponse,
    SearchRequest, SearchResponse, BoardStatisticsResponse, PopularPostResponse,
    UserActivityStatsResponse, UserPreferenceUpdate, UserPreferenceResponse,
    AttachmentResponse
)

__all__ = [
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserDetailResponse",
    "UserLogin",
    "Token",
    "TokenData",
    "RoleCreate",
    "RoleUpdate",
    "RoleResponse",
    "PermissionCreate",
    "PermissionUpdate",
    "PermissionResponse",
    "OauthAccountCreate",
    "OauthAccountUpdate",
    "OauthAccountResponse",
    "RolePermissionCreate",
    "RolePermissionResponse",
    "UserRoleCreate",
    "UserRoleUpdate",
    "UserRoleResponse",
    "RefreshTokenCreate",
    "RefreshTokenResponse",
    "AuditLogCreate",
    "AuditLogResponse",
    "FileCreate",
    "FileUpdate",
    "FileResponse",
    "LocaleCreate",
    "LocaleUpdate",
    "LocaleResponse",
    # 게시판 스키마들
    "BoardCreate", "BoardUpdate", "BoardResponse", "CategoryCreate", "CategoryUpdate",
    "CategoryResponse", "PostCreate", "PostUpdate", "PostResponse", "PostDetailResponse",
    "PostListRequest", "PostListResponse", "CommentCreate", "CommentUpdate", "CommentResponse",
    "LikeRequest", "LikeResponse", "BookmarkResponse", "ReportCreate", "ReportResponse",
    "TagCreate", "TagUpdate", "TagResponse", "FollowCreate", "FollowResponse",
    "SearchRequest", "SearchResponse", "BoardStatisticsResponse", "PopularPostResponse",
    "UserActivityStatsResponse", "UserPreferenceUpdate", "UserPreferenceResponse",
    "AttachmentResponse"
]

