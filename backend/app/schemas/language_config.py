"""
언어 설정 스키마
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LanguageConfigBase(BaseModel):
    """언어 설정 기본 스키마"""
    lang_cd: str = Field(..., max_length=10, description="언어 코드")
    lang_nm: str = Field(..., max_length=100, description="언어 이름")
    display_order: int = Field(default=0, description="표시 순서")
    use_yn: bool = Field(default=True, description="사용 여부")


class LanguageConfigCreate(LanguageConfigBase):
    """언어 설정 생성 스키마"""
    pass


class LanguageConfigUpdate(BaseModel):
    """언어 설정 수정 스키마"""
    lang_nm: Optional[str] = Field(None, max_length=100, description="언어 이름")
    display_order: Optional[int] = Field(None, description="표시 순서")
    use_yn: Optional[bool] = Field(None, description="사용 여부")


class LanguageConfigResponse(LanguageConfigBase):
    """언어 설정 응답 스키마"""
    common_language_config_sn: int
    del_yn: bool
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool

    class Config:
        from_attributes = True
