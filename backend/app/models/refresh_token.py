"""리프레시 토큰 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonRefreshToken(BaseModel):
    """리프레시 토큰 테이블"""
    __tablename__ = "common_refresh_token"
    
    # 기본 키
    common_refresh_token_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 토큰 정보
    refresh_token_id = Column(String(100), unique=True, nullable=False, comment="토큰 고유 식별자")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="사용자 ID")
    token_hash = Column(String(255), unique=True, nullable=False, comment="토큰 해시값")
    dvc_info = Column(String(255), nullable=True, comment="디바이스 정보")
    ip_addr = Column(String(45), nullable=True, comment="IP 주소 (IPv6 지원)")
    expr_dt = Column(DateTime, nullable=False, index=True, comment="만료일시")
    
    # 취소 정보
    rvk_yn = Column(Boolean, default=False, nullable=False, index=True, comment="취소 여부")
    rvk_dt = Column(DateTime, nullable=True, comment="취소일시")
    
    # 사용 정보
    last_use_dt = Column(DateTime, nullable=True, comment="마지막 사용일시")
    
    # 관계
    user = relationship("CommonUser", back_populates="refresh_tokens")
    
    # 인덱스
    __table_args__ = (
        Index("idx_refresh_token_user_id", "user_id"),
        Index("idx_refresh_token_expr_dt", "expr_dt"),
        Index("idx_refresh_token_rvk_yn", "rvk_yn"),
        Index("idx_refresh_token_del_yn", "del_yn"),
        Index("idx_refresh_token_user_expr", "user_id", "expr_dt"),
    )

