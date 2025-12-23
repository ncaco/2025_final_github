"""사용자-역할 매핑 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class UserRoleBase(BaseModel):
    """사용자-역할 매핑 기본 스키마"""
    user_id: str = Field(..., description="사용자 ID")
    role_id: str = Field(..., description="역할 ID")


class UserRoleCreate(UserRoleBase):
    """사용자-역할 매핑 생성 스키마"""
    asgn_by: Optional[str] = Field(None, description="할당한 사용자 ID")
    asgn_dt: Optional[datetime] = Field(None, description="할당일시")
    expr_dt: Optional[datetime] = Field(None, description="만료일시 (NULL이면 무기한)")


class UserRoleUpdate(BaseModel):
    """사용자-역할 매핑 수정 스키마"""
    expr_dt: Optional[datetime] = None
    use_yn: Optional[bool] = None


class UserRoleResponse(UserRoleBase):
    """사용자-역할 매핑 응답 스키마"""
    common_user_role_sn: int
    user_role_id: str
    asgn_by: Optional[str]
    asgn_dt: Optional[datetime]
    expr_dt: Optional[datetime]
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    
    class Config:
        from_attributes = True

