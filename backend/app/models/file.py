"""파일 모델"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, BigInteger, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class CommonFile(BaseModel):
    """파일 테이블"""
    __tablename__ = "common_file"
    
    # 기본 키
    common_file_sn = Column(Integer, primary_key=True, autoincrement=True, comment="일련번호")
    
    # 파일 정보
    file_id = Column(String(100), unique=True, nullable=False, comment="파일 고유 식별자")
    user_id = Column(String(100), ForeignKey("common_user.user_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True, comment="업로드한 사용자 ID")
    file_nm = Column(String(255), nullable=False, comment="원본 파일명")
    file_path = Column(String(500), nullable=False, comment="저장 경로")
    file_sz = Column(BigInteger, nullable=False, comment="파일 크기 (바이트)")
    mime_typ = Column(String(100), nullable=True, index=True, comment="MIME 타입")
    file_ext = Column(String(10), nullable=True, index=True, comment="파일 확장자")
    stg_typ = Column(String(20), default="LOCAL", nullable=False, index=True, comment="저장소 타입 (LOCAL, S3 등)")
    pub_yn = Column(Boolean, default=False, nullable=False, index=True, comment="공개 여부")
    
    # 관계
    user = relationship("CommonUser", back_populates="files")
    
    # 인덱스
    __table_args__ = (
        Index("idx_file_user_id", "user_id"),
        Index("idx_file_file_ext", "file_ext"),
        Index("idx_file_mime_typ", "mime_typ"),
        Index("idx_file_stg_typ", "stg_typ"),
        Index("idx_file_pub_yn", "pub_yn"),
        Index("idx_file_del_yn", "del_yn"),
        Index("idx_file_crt_dt", "crt_dt"),
        Index("idx_file_user_crt", "user_id", "crt_dt"),
    )

