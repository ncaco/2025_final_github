"""다국어 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Index, UniqueConstraint
from app.models.base import BaseModel


class CommonLocale(BaseModel):
    """다국어 테이블"""
    __tablename__ = "common_locale"
    
    # 기본 키
    common_locale_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 번역 정보
    locale_id = Column(String(100), unique=True, nullable=False, comment="번역 고유 식별자")
    lang_cd = Column(String(10), nullable=False, index=True, comment="언어 코드 (ko, en, ja 등)")
    rsrc_typ = Column(String(50), nullable=False, index=True, comment="리소스 타입 (LABEL, MESSAGE, ERROR 등)")
    rsrc_key = Column(String(255), nullable=False, comment="리소스 키")
    rsrc_val = Column(Text, nullable=False, comment="번역된 값")
    
    # 인덱스 및 제약조건
    __table_args__ = (
        UniqueConstraint("lang_cd", "rsrc_typ", "rsrc_key", name="uk_locale_key"),
        Index("idx_locale_lang_cd", "lang_cd"),
        Index("idx_locale_rsrc_typ", "rsrc_typ"),
        Index("idx_locale_del_yn", "del_yn"),
        Index("idx_locale_use_yn", "use_yn"),
    )

