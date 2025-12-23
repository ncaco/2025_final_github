"""리프레시 토큰 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RefreshTokenBase(BaseModel):
    """리프레시 토큰 기본 스키마"""
    user_id: str = Field(..., description="사용자 ID")
    dvc_info: Optional[str] = Field(None, max_length=255, description="디바이스 정보")
    ip_addr: Optional[str] = Field(None, max_length=45, description="IP 주소")


class RefreshTokenCreate(RefreshTokenBase):
    """리프레시 토큰 생성 스키마"""
    expr_dt: datetime = Field(..., description="만료일시")


class RefreshTokenResponse(RefreshTokenBase):
    """리프레시 토큰 응답 스키마"""
    common_refresh_token_sn: int
    refresh_token_id: str
    expr_dt: datetime
    rvk_yn: bool
    rvk_dt: Optional[datetime]
    last_use_dt: Optional[datetime]
    crt_dt: datetime
    use_yn: bool
    
    class Config:
        from_attributes = True

