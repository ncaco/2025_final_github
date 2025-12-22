"""사용자-역할 매핑 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonUserRole(BaseModel):
    """사용자-역할 매핑 테이블"""
    __tablename__ = "common_user_role"
    
    # 기본 키
    common_user_role_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 매핑 정보
    user_role_id = Column(String(100), unique=True, nullable=False, comment="매핑 고유 식별자")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="사용자 ID")
    role_id = Column(String(100), ForeignKey("common_role.role_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="역할 ID")
    
    # 할당 정보
    asgn_by = Column(String(100), ForeignKey("common_user.user_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True, comment="할당한 사용자 ID")
    asgn_dt = Column(DateTime, nullable=True, comment="할당일시")
    expr_dt = Column(DateTime, nullable=True, index=True, comment="만료일시 (NULL이면 무기한)")
    
    # 관계
    user = relationship("CommonUser", foreign_keys=[user_id], back_populates="user_roles")
    role = relationship("CommonRole", back_populates="user_roles")
    assigner = relationship("CommonUser", foreign_keys=[asgn_by])
    
    # 인덱스 및 제약조건
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uk_user_role_mapping"),
        Index("idx_user_role_user_id", "user_id"),
        Index("idx_user_role_role_id", "role_id"),
        Index("idx_user_role_asgn_by", "asgn_by"),
        Index("idx_user_role_expr_dt", "expr_dt"),
        Index("idx_user_role_del_yn", "del_yn"),
        Index("idx_user_role_use_yn", "use_yn"),
    )

