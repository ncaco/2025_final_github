"""기본 모델 클래스"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base


class BaseModel(Base):
    """공통 필드를 가진 기본 모델"""
    __abstract__ = True
    
    # 삭제 관련
    del_dt = Column(DateTime, nullable=True, comment="삭제일시")
    del_by = Column(String(100), nullable=True, comment="삭제자 ID")
    del_by_nm = Column(String(100), nullable=True, comment="삭제자 이름")
    del_yn = Column(Boolean, default=False, nullable=False, comment="삭제여부")
    
    # 생성 관련
    crt_dt = Column(
        DateTime,
        default=func.current_timestamp(),
        nullable=False,
        comment="생성일시"
    )
    crt_by = Column(String(100), nullable=True, comment="생성자 ID")
    crt_by_nm = Column(String(100), nullable=True, comment="생성자 이름")
    
    # 수정 관련
    upd_dt = Column(
        DateTime,
        default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
        nullable=True,
        comment="수정일시"
    )
    upd_by = Column(String(100), nullable=True, comment="수정자 ID")
    upd_by_nm = Column(String(100), nullable=True, comment="수정자 이름")
    
    # 사용여부
    use_yn = Column(Boolean, default=True, nullable=False, comment="사용여부")

