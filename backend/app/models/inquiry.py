"""문의(Inquiry) 모델"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Enum, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
import enum
from app.models.base import BaseModel


class InquiryStatus(enum.Enum):
    """문의 상태"""
    PENDING = "PENDING"
    ANSWERED = "ANSWERED"
    CLOSED = "CLOSED"


class InquiryCategory(enum.Enum):
    """문의 유형"""
    GENERAL = "GENERAL"
    TECHNICAL = "TECHNICAL"
    BUG = "BUG"
    FEATURE = "FEATURE"
    PARTNERSHIP = "PARTNERSHIP"
    OTHER = "OTHER"


class CommonInquiry(BaseModel):
    """문의 테이블"""
    __tablename__ = "common_inquiry"

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="문의 일련번호")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE"), nullable=False, comment="문의자 ID")
    title = Column(String(255), nullable=False, comment="문의 제목")
    content = Column(Text, nullable=False, comment="문의 내용")
    category = Column(Enum(InquiryCategory), nullable=False, default=InquiryCategory.GENERAL, comment="문의 유형")
    answer = Column(Text, nullable=True, comment="답변 내용")
    status = Column(Enum(InquiryStatus), nullable=False, default=InquiryStatus.PENDING, comment="문의 상태")
    answered_by = Column(String(100), ForeignKey("common_user.user_id", ondelete="SET NULL"), nullable=True, comment="답변자 ID")
    answered_at = Column(DateTime, nullable=True, comment="답변일시")

    # 관계
    user = relationship("CommonUser", foreign_keys=[user_id], backref="inquiries")
    answerer = relationship("CommonUser", foreign_keys=[answered_by])

    # 인덱스
    __table_args__ = (
        Index("idx_common_inquiry_user_id", "user_id"),
        Index("idx_common_inquiry_status", "status"),
        Index("idx_common_inquiry_category", "category"),
        Index("idx_common_inquiry_crt_dt", "crt_dt"),
        Index("idx_common_inquiry_user_status", "user_id", "status"),
    )
