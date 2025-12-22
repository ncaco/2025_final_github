"""사용자 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonUser(BaseModel):
    """사용자 테이블"""
    __tablename__ = "common_user"
    
    # 기본 키
    common_user_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 사용자 정보
    user_id = Column(String(100), unique=True, nullable=False, index=True, comment="사용자 고유 식별자")
    eml = Column(String(255), unique=True, nullable=False, index=True, comment="이메일 주소")
    username = Column(String(100), unique=True, nullable=False, index=True, comment="사용자명")
    pwd_hash = Column(String(255), nullable=True, comment="비밀번호 해시값")
    nm = Column(String(100), nullable=True, comment="이름 (실명)")
    nickname = Column(String(100), nullable=True, comment="닉네임")
    telno = Column(String(20), nullable=True, comment="전화번호")
    
    # 상태 정보
    actv_yn = Column(Boolean, default=True, nullable=False, index=True, comment="활성 상태")
    eml_vrf_yn = Column(Boolean, default=False, nullable=False, index=True, comment="이메일 인증 여부")
    telno_vrf_yn = Column(Boolean, default=False, nullable=False, comment="전화번호 인증 여부")
    
    # 관계
    oauth_accounts = relationship("CommonOauthAccount", back_populates="user", cascade="all, delete-orphan")
    user_roles = relationship("CommonUserRole", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("CommonRefreshToken", back_populates="user", cascade="all, delete-orphan")
    files = relationship("CommonFile", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("CommonAuditLog", back_populates="user")
    
    # 인덱스
    __table_args__ = (
        Index("idx_user_actv_yn", "actv_yn"),
        Index("idx_user_del_yn", "del_yn"),
        Index("idx_user_crt_dt", "crt_dt"),
        Index("idx_user_eml_vrf_yn", "eml_vrf_yn"),
    )

