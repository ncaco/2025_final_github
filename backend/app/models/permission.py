"""권한 모델"""
from sqlalchemy import Column, Integer, String, Boolean, Text, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonPermission(BaseModel):
    """권한 테이블"""
    __tablename__ = "common_permission"
    
    # 기본 키
    common_permission_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 권한 정보
    permission_id = Column(String(100), unique=True, nullable=False, comment="권한 고유 식별자")
    permission_cd = Column(String(100), unique=True, nullable=False, comment="권한 코드 (USER_CREATE, USER_UPDATE 등)")
    permission_nm = Column(String(100), nullable=False, comment="권한 이름")
    dsc = Column(Text, nullable=True, comment="권한 설명")
    rsrc = Column(String(50), nullable=False, comment="리소스 (USER, FILE, ADMIN 등)")
    act = Column(String(50), nullable=False, comment="액션 (CREATE, READ, UPDATE, DELETE)")
    actv_yn = Column(Boolean, default=True, nullable=False, index=True, comment="활성 상태")
    
    # 관계
    role_permissions = relationship("CommonRolePermission", back_populates="permission", cascade="all, delete-orphan")
    
    # 인덱스
    __table_args__ = (
        Index("idx_permission_rsrc_act", "rsrc", "act"),
        Index("idx_permission_actv_yn", "actv_yn"),
        Index("idx_permission_del_yn", "del_yn"),
    )

