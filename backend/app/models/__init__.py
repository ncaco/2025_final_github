"""데이터베이스 모델"""
from app.models.user import CommonUser
from app.models.oauth_account import CommonOauthAccount
from app.models.role import CommonRole
from app.models.permission import CommonPermission
from app.models.role_permission import CommonRolePermission
from app.models.user_role import CommonUserRole
from app.models.refresh_token import CommonRefreshToken
from app.models.audit_log import CommonAuditLog
from app.models.file import CommonFile
from app.models.locale import CommonLocale
from app.models.board import (
    BbsBoard, BbsCategory, BbsPost, BbsComment, BbsAttachment,
    BbsFileThumbnail, BbsPostLike, BbsCommentLike, BbsBookmark,
    BbsReport, BbsNotification, BbsTag, BbsPostTag, BbsFollow,
    BbsActivityLog, BbsPostHistory, BbsUserPreference, BbsSearchLog,
    BbsAdminLog, BbsStatistic
)

__all__ = [
    "CommonUser",
    "CommonOauthAccount",
    "CommonRole",
    "CommonPermission",
    "CommonRolePermission",
    "CommonUserRole",
    "CommonRefreshToken",
    "CommonAuditLog",
    "CommonFile",
    "CommonLocale",
    # 게시판 모델들
    "BbsBoard", "BbsCategory", "BbsPost", "BbsComment", "BbsAttachment",
    "BbsFileThumbnail", "BbsPostLike", "BbsCommentLike", "BbsBookmark",
    "BbsReport", "BbsNotification", "BbsTag", "BbsPostTag", "BbsFollow",
    "BbsActivityLog", "BbsPostHistory", "BbsUserPreference", "BbsSearchLog",
    "BbsAdminLog", "BbsStatistic"
]

