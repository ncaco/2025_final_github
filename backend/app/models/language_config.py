"""
언어 설정 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CommonLanguageConfig(Base):
    """
    언어 설정 테이블
    """
    __tablename__ = "common_language_config"

    common_language_config_sn = Column(Integer, primary_key=True, autoincrement=True, comment="언어 설정 일련번호")
    lang_cd = Column(String(10), nullable=False, comment="언어 코드 (ko, en, ja, zh 등)")
    lang_nm = Column(String(100), nullable=False, comment="언어 이름")
    display_order = Column(Integer, nullable=False, default=0, comment="표시 순서")
    use_yn = Column(Boolean, nullable=False, default=True, comment="사용 여부")

    # 소프트 삭제 필드
    del_dt = Column(DateTime, comment="삭제 일시")
    del_by = Column(String(100), comment="삭제자 ID")
    del_by_nm = Column(String(100), comment="삭제자 이름")
    del_yn = Column(Boolean, nullable=False, default=False, comment="삭제 여부")

    # 감사 필드
    crt_dt = Column(DateTime, nullable=False, default=func.now(), comment="생성 일시")
    crt_by = Column(String(100), comment="생성자 ID")
    crt_by_nm = Column(String(100), comment="생성자 이름")
    upd_dt = Column(DateTime, comment="수정 일시")
    upd_by = Column(String(100), comment="수정자 ID")
    upd_by_nm = Column(String(100), comment="수정자 이름")

    def __repr__(self):
        return f"<CommonLanguageConfig(lang_cd='{self.lang_cd}', lang_nm='{self.lang_nm}', use_yn={self.use_yn})>"
