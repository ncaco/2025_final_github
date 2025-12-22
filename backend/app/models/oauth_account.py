"""OAuth 계정 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonOauthAccount(BaseModel):
    """OAuth 계정 테이블"""
    __tablename__ = "common_oauth_account"
    
    # 기본 키
    common_oauth_account_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # OAuth 정보
    oauth_account_id = Column(String(100), unique=True, nullable=False, comment="OAuth 계정 고유 식별자")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="사용자 ID")
    provider = Column(String(50), nullable=False, index=True, comment="제공자 (GOOGLE, GITHUB, KAKAO, NAVER)")
    provider_user_id = Column(String(255), nullable=False, comment="제공자에서의 사용자 ID")
    provider_eml = Column(String(255), nullable=True, comment="제공자에서 제공한 이메일")
    provider_username = Column(String(100), nullable=True, comment="제공자에서 제공한 사용자명")
    
    # 토큰 정보
    access_token = Column(Text, nullable=True, comment="액세스 토큰 (암호화 저장)")
    refresh_token = Column(Text, nullable=True, comment="리프레시 토큰 (암호화 저장)")
    token_expr_dt = Column(DateTime, nullable=True, comment="토큰 만료일시")
    
    # 관계
    user = relationship("CommonUser", back_populates="oauth_accounts")
    
    # 인덱스 및 제약조건
    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uk_oauth_provider_user"),
        Index("idx_oauth_user_id", "user_id"),
        Index("idx_oauth_del_yn", "del_yn"),
        Index("idx_oauth_provider", "provider"),
    )

