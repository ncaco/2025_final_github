"""다국어 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LocaleBase(BaseModel):
    """다국어 기본 스키마"""
    lang_cd: str = Field(..., max_length=10, description="언어 코드")
    rsrc_typ: str = Field(..., max_length=50, description="리소스 타입")
    rsrc_key: str = Field(..., max_length=255, description="리소스 키")
    rsrc_val: str = Field(..., description="번역된 값")


class LocaleCreate(LocaleBase):
    """다국어 생성 스키마"""
    pass


class LocaleUpdate(BaseModel):
    """다국어 수정 스키마"""
    rsrc_val: Optional[str] = None
    use_yn: Optional[bool] = None


class LocaleResponse(LocaleBase):
    """다국어 응답 스키마"""
    common_locale_sn: int
    locale_id: str
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    
    class Config:
        from_attributes = True

