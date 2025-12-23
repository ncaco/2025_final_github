"""역할-권한 매핑 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RolePermissionBase(BaseModel):
    """역할-권한 매핑 기본 스키마"""
    role_id: str = Field(..., description="역할 ID")
    permission_id: str = Field(..., description="권한 ID")


class RolePermissionCreate(RolePermissionBase):
    """역할-권한 매핑 생성 스키마"""
    pass


class RolePermissionResponse(RolePermissionBase):
    """역할-권한 매핑 응답 스키마"""
    common_role_permission_sn: int
    role_permission_id: str
    crt_dt: datetime
    use_yn: bool
    
    class Config:
        from_attributes = True

