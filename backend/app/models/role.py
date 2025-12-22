"""역할 모델"""
from sqlalchemy import Column, Integer, String, Boolean, Text, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonRole(BaseModel):
    """역할 테이블"""
    __tablename__ = "common_role"
    
    # 기본 키
    common_role_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 역할 정보
    role_id = Column(String(100), unique=True, nullable=False, comment="역할 고유 식별자")
    role_cd = Column(String(50), unique=True, nullable=False, comment="역할 코드 (ADMIN, USER, MODERATOR)")
    role_nm = Column(String(100), nullable=False, comment="역할 이름")
    dsc = Column(Text, nullable=True, comment="역할 설명")
    actv_yn = Column(Boolean, default=True, nullable=False, index=True, comment="활성 상태")
    
    # 관계
    role_permissions = relationship("CommonRolePermission", back_populates="role", cascade="all, delete-orphan")
    user_roles = relationship("CommonUserRole", back_populates="role", cascade="all, delete-orphan")
    
    # 인덱스
    __table_args__ = (
        Index("idx_role_actv_yn", "actv_yn"),
        Index("idx_role_del_yn", "del_yn"),
    )

