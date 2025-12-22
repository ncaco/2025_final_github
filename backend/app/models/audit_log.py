"""감사 로그 모델"""
from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, Integer, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonAuditLog(BaseModel):
    """감사 로그 테이블"""
    __tablename__ = "common_audit_log"
    
    # 기본 키
    common_audit_log_sn = Column(BigInteger, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 로그 정보
    audit_log_id = Column(String(100), unique=True, nullable=False, comment="로그 고유 식별자")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="SET NULL", onupdate="CASCADE"), nullable=True, index=True, comment="사용자 ID (NULL 가능)")
    act_typ = Column(String(50), nullable=False, index=True, comment="액션 타입 (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, API_CALL)")
    rsrc_typ = Column(String(50), nullable=True, index=True, comment="리소스 타입 (USER, FILE, ROLE 등)")
    rsrc_id = Column(String(100), nullable=True, comment="리소스 ID")
    
    # 변경 정보
    old_val = Column(JSONB, nullable=True, comment="변경 전 값 (JSON 형식)")
    new_val = Column(JSONB, nullable=True, comment="변경 후 값 (JSON 형식)")
    
    # 요청 정보
    ip_addr = Column(String(45), nullable=True, comment="IP 주소")
    user_agent = Column(Text, nullable=True, comment="User Agent")
    req_mthd = Column(String(10), nullable=True, comment="HTTP 메서드 (GET, POST, PUT, DELETE)")
    req_path = Column(String(500), nullable=True, comment="요청 경로")
    stts_cd = Column(Integer, nullable=True, comment="HTTP 상태 코드")
    err_msg = Column(Text, nullable=True, comment="에러 메시지")
    
    # 관계
    user = relationship("CommonUser", back_populates="audit_logs")
    
    # 인덱스
    __table_args__ = (
        Index("idx_audit_log_user_id", "user_id"),
        Index("idx_audit_log_user_crt_dt", "user_id", "crt_dt"),
        Index("idx_audit_log_act_crt_dt", "act_typ", "crt_dt"),
        Index("idx_audit_log_rsrc", "rsrc_typ", "rsrc_id"),
        Index("idx_audit_log_crt_dt", "crt_dt"),
        Index("idx_audit_log_act_typ", "act_typ"),
        Index("idx_audit_log_rsrc_typ", "rsrc_typ"),
        Index("idx_audit_log_del_yn", "del_yn"),
    )

