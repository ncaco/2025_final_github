"""문의(Inquiry) 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class InquiryStatus(str, Enum):
    """문의 상태"""
    PENDING = "PENDING"
    ANSWERED = "ANSWERED"
    CLOSED = "CLOSED"


class InquiryCategory(str, Enum):
    """문의 유형"""
    GENERAL = "GENERAL"
    TECHNICAL = "TECHNICAL"
    BUG = "BUG"
    FEATURE = "FEATURE"
    PARTNERSHIP = "PARTNERSHIP"
    OTHER = "OTHER"


class InquiryBase(BaseModel):
    """문의 기본 스키마"""
    title: str = Field(..., description="문의 제목", max_length=255)
    content: str = Field(..., description="문의 내용")
    category: InquiryCategory = Field(default=InquiryCategory.GENERAL, description="문의 유형")


class InquiryCreate(InquiryBase):
    """문의 생성 스키마"""
    pass


class InquiryUpdate(BaseModel):
    """문의 수정 스키마"""
    title: Optional[str] = Field(None, description="문의 제목", max_length=255)
    content: Optional[str] = Field(None, description="문의 내용")
    category: Optional[InquiryCategory] = Field(None, description="문의 유형")


class InquiryAnswer(BaseModel):
    """문의 답변 스키마"""
    answer: str = Field(..., description="답변 내용")


class InquiryClose(BaseModel):
    """문의 종료 스키마"""
    pass


class InquiryResponse(InquiryBase):
    """문의 응답 스키마"""
    id: int = Field(..., description="문의 ID")
    user_id: str = Field(..., description="문의자 ID")
    answer: Optional[str] = Field(None, description="답변 내용")
    status: InquiryStatus = Field(..., description="문의 상태")
    answered_by: Optional[str] = Field(None, description="답변자 ID")
    answered_at: Optional[datetime] = Field(None, description="답변일시")
    crt_dt: datetime = Field(..., description="생성일시")
    upd_dt: Optional[datetime] = Field(None, description="수정일시")

    class Config:
        from_attributes = True
