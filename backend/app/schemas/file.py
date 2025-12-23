"""파일 관련 스키마"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FileBase(BaseModel):
    """파일 기본 스키마"""
    file_nm: str = Field(..., max_length=255, description="원본 파일명")
    file_path: str = Field(..., max_length=500, description="저장 경로")
    file_sz: int = Field(..., description="파일 크기 (바이트)")
    mime_typ: Optional[str] = Field(None, max_length=100, description="MIME 타입")
    file_ext: Optional[str] = Field(None, max_length=10, description="파일 확장자")
    stg_typ: str = Field(default="LOCAL", max_length=20, description="저장소 타입")
    pub_yn: bool = Field(default=False, description="공개 여부")


class FileCreate(FileBase):
    """파일 생성 스키마"""
    user_id: str = Field(..., description="업로드한 사용자 ID")


class FileUpdate(BaseModel):
    """파일 수정 스키마"""
    file_nm: Optional[str] = Field(None, max_length=255)
    pub_yn: Optional[bool] = None
    use_yn: Optional[bool] = None


class FileResponse(FileBase):
    """파일 응답 스키마"""
    common_file_sn: int
    file_id: str
    user_id: str
    crt_dt: datetime
    upd_dt: Optional[datetime]
    use_yn: bool
    
    class Config:
        from_attributes = True

