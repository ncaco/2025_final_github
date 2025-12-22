"""역할-권한 매핑 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonRolePermission(BaseModel):
    """역할-권한 매핑 테이블"""
    __tablename__ = "common_role_permission"
    
    # 기본 키
    common_role_permission_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 매핑 정보
    role_permission_id = Column(String(100), unique=True, nullable=False, comment="매핑 고유 식별자")
    role_id = Column(String(100), ForeignKey("common_role.role_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="역할 ID")
    permission_id = Column(String(100), ForeignKey("common_permission.permission_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="권한 ID")
    
    # 관계
    role = relationship("CommonRole", back_populates="role_permissions")
    permission = relationship("CommonPermission", back_populates="role_permissions")
    
    # 인덱스 및 제약조건
    __table_args__ = (
        UniqueConstraint("role_id", "permission_id", name="uk_role_permission_mapping"),
        Index("idx_role_permission_role_id", "role_id"),
        Index("idx_role_permission_permission_id", "permission_id"),
        Index("idx_role_permission_del_yn", "del_yn"),
    )

