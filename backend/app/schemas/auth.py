"""인증 관련 스키마"""
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """토큰 응답 스키마"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """토큰 데이터 스키마"""
    user_id: Optional[str] = None
    username: Optional[str] = None


class LogoutRequest(BaseModel):
    """로그아웃 요청 스키마"""
    refresh_token: Optional[str] = None
