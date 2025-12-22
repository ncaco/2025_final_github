"""사용자 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """사용자 기본 스키마"""
    eml: EmailStr = Field(..., description="이메일 주소")
    username: str = Field(..., min_length=3, max_length=100, description="사용자명")
    nm: Optional[str] = Field(None, max_length=100, description="이름 (실명)")
    nickname: Optional[str] = Field(None, max_length=100, description="닉네임")
    telno: Optional[str] = Field(None, max_length=20, description="전화번호")


class UserCreate(UserBase):
    """사용자 생성 스키마"""
    password: str = Field(..., min_length=8, description="비밀번호")


class UserUpdate(BaseModel):
    """사용자 수정 스키마"""
    eml: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    nm: Optional[str] = Field(None, max_length=100)
    nickname: Optional[str] = Field(None, max_length=100)
    telno: Optional[str] = Field(None, max_length=20)
    actv_yn: Optional[bool] = None
    eml_vrf_yn: Optional[bool] = None
    telno_vrf_yn: Optional[bool] = None


class UserLogin(BaseModel):
    """사용자 로그인 스키마"""
    username: str = Field(..., description="사용자명 또는 이메일")
    password: str = Field(..., description="비밀번호")


class UserResponse(UserBase):
    """사용자 응답 스키마"""
    common_user_sn: int
    user_id: str
    actv_yn: bool
    eml_vrf_yn: bool
    telno_vrf_yn: bool
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    
    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    """사용자 상세 응답 스키마"""
    del_yn: bool
    del_dt: Optional[datetime]
    crt_by: Optional[str]
    crt_by_nm: Optional[str]
    upd_by: Optional[str]
    upd_by_nm: Optional[str]

