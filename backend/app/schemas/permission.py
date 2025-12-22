"""권한 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PermissionBase(BaseModel):
    """권한 기본 스키마"""
    permission_cd: str = Field(..., max_length=100, description="권한 코드")
    permission_nm: str = Field(..., max_length=100, description="권한 이름")
    dsc: Optional[str] = Field(None, description="권한 설명")
    rsrc: str = Field(..., max_length=50, description="리소스")
    act: str = Field(..., max_length=50, description="액션")


class PermissionCreate(PermissionBase):
    """권한 생성 스키마"""
    actv_yn: bool = Field(default=True, description="활성 상태")


class PermissionUpdate(BaseModel):
    """권한 수정 스키마"""
    permission_cd: Optional[str] = Field(None, max_length=100)
    permission_nm: Optional[str] = Field(None, max_length=100)
    dsc: Optional[str] = None
    rsrc: Optional[str] = Field(None, max_length=50)
    act: Optional[str] = Field(None, max_length=50)
    actv_yn: Optional[bool] = None


class PermissionResponse(PermissionBase):
    """권한 응답 스키마"""
    common_permission_sn: int
    permission_id: str
    actv_yn: bool
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    
    class Config:
        from_attributes = True

