"""역할 관련 스키마"""
from datetime import datetime
from typing import Optional, List
from app.schemas.permission import PermissionResponse
from pydantic import BaseModel, Field


class RoleBase(BaseModel):
    """역할 기본 스키마"""
    role_cd: str = Field(..., max_length=50, description="역할 코드")
    role_nm: str = Field(..., max_length=100, description="역할 이름")
    dsc: Optional[str] = Field(None, description="역할 설명")


class RoleCreate(RoleBase):
    """역할 생성 스키마"""
    actv_yn: bool = Field(default=True, description="활성 상태")


class RoleUpdate(BaseModel):
    """역할 수정 스키마"""
    role_cd: Optional[str] = Field(None, max_length=50)
    role_nm: Optional[str] = Field(None, max_length=100)
    dsc: Optional[str] = None
    actv_yn: Optional[bool] = None


class RoleResponse(RoleBase):
    """역할 응답 스키마"""
    common_role_sn: int
    role_id: str
    actv_yn: bool
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    permissions: List[PermissionResponse] = Field(default_factory=list, description="역할에 할당된 권한 목록")
    
    class Config:
        from_attributes = True

