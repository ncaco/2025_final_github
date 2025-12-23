"""OAuth 계정 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr


class OauthAccountBase(BaseModel):
    """OAuth 계정 기본 스키마"""
    provider: str = Field(..., max_length=50, description="제공자 (GOOGLE, GITHUB, KAKAO, NAVER)")
    provider_user_id: str = Field(..., max_length=255, description="제공자에서의 사용자 ID")
    provider_eml: Optional[EmailStr] = Field(None, description="제공자에서 제공한 이메일")
    provider_username: Optional[str] = Field(None, max_length=100, description="제공자에서 제공한 사용자명")


class OauthAccountCreate(OauthAccountBase):
    """OAuth 계정 생성 스키마"""
    user_id: str = Field(..., description="사용자 ID")
    access_token: Optional[str] = Field(None, description="액세스 토큰")
    refresh_token: Optional[str] = Field(None, description="리프레시 토큰")
    token_expr_dt: Optional[datetime] = Field(None, description="토큰 만료일시")


class OauthAccountUpdate(BaseModel):
    """OAuth 계정 수정 스키마"""
    provider_eml: Optional[EmailStr] = None
    provider_username: Optional[str] = Field(None, max_length=100)
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expr_dt: Optional[datetime] = None


class OauthAccountResponse(OauthAccountBase):
    """OAuth 계정 응답 스키마"""
    common_oauth_account_sn: int
    oauth_account_id: str
    user_id: str
    token_expr_dt: Optional[datetime]
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    
    class Config:
        from_attributes = True

