"""역할-권한 매핑 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class CommonRolePermission(Base):
    """역할-권한 매핑 테이블"""
    __tablename__ = "common_role_permission"
    
    # 기본 키
    common_role_permission_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 매핑 정보
    role_permission_id = Column(String(100), unique=True, nullable=False, comment="매핑 고유 식별자")
    role_id = Column(String(100), ForeignKey("common_role.role_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="역할 ID")
    permission_id = Column(String(100), ForeignKey("common_permission.permission_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="권한 ID")

    # 삭제 관련 (소프트 삭제)
    del_dt = Column(DateTime, nullable=True, comment="삭제일시 (소프트 삭제)")
    del_by = Column(String(100), nullable=True, comment="삭제자 ID")
    del_by_nm = Column(String(100), nullable=True, comment="삭제자 이름")
    del_yn = Column(Boolean, default=False, nullable=False, comment="삭제여부")

    # 생성 관련
    crt_dt = Column(DateTime, default=func.current_timestamp(), nullable=False, comment="생성일시")
    crt_by = Column(String(100), nullable=True, comment="생성자 ID")
    crt_by_nm = Column(String(100), nullable=True, comment="생성자 이름")

    # 사용여부
    use_yn = Column(Boolean, default=True, nullable=False, comment="사용여부")

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

