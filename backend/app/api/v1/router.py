"""API v1 라우터 통합"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, users, health, roles, permissions, role_permissions,
    user_roles, oauth_accounts, refresh_tokens, audit_logs,
    files, locales, language_configs, boards, board_extra, dashboard, inquiries, logs
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])
api_router.include_router(permissions.router, prefix="/permissions", tags=["permissions"])
api_router.include_router(role_permissions.router, prefix="/role-permissions", tags=["role-permissions"])
api_router.include_router(user_roles.router, prefix="/user-roles", tags=["user-roles"])
api_router.include_router(oauth_accounts.router, prefix="/oauth-accounts", tags=["oauth-accounts"])
api_router.include_router(refresh_tokens.router, prefix="/refresh-tokens", tags=["refresh-tokens"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(locales.router, prefix="/locales", tags=["locales"])
api_router.include_router(language_configs.router, prefix="/language-configs", tags=["language-configs"])
api_router.include_router(boards.router, prefix="/boards", tags=["boards"])
api_router.include_router(board_extra.router, prefix="/board-extra", tags=["board-extra"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["inquiries"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])

