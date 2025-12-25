"""리프레시 토큰 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from app.database import Base


class CommonRefreshToken(Base):
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
    
    # 삭제 관련 (BaseModel에서 상속받지 않고 직접 정의)
    del_dt = Column(DateTime, nullable=True, comment="삭제일시")
    del_by = Column(String(100), nullable=True, comment="삭제자 ID")
    del_by_nm = Column(String(100), nullable=True, comment="삭제자 이름")
    del_yn = Column(Boolean, default=False, nullable=False, comment="삭제여부")
    
    # 생성 관련 (BaseModel에서 상속받지 않고 직접 정의)
    crt_dt = Column(
        DateTime,
        default=func.current_timestamp(),
        nullable=False,
        comment="생성일시"
    )
    crt_by = Column(String(100), nullable=True, comment="생성자 ID")
    crt_by_nm = Column(String(100), nullable=True, comment="생성자 이름")
    
    # 수정 관련 필드는 COMMON_REFRESH_TOKEN 테이블에 없으므로 제외
    # upd_dt, upd_by, upd_by_nm은 정의하지 않음
    
    # 사용여부
    use_yn = Column(Boolean, default=True, nullable=False, comment="사용여부")
    
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

