"""감사 로그 관련 스키마"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class AuditLogBase(BaseModel):
    """감사 로그 기본 스키마"""
    act_typ: str = Field(..., max_length=50, description="액션 타입")
    rsrc_typ: Optional[str] = Field(None, max_length=50, description="리소스 타입")
    rsrc_id: Optional[str] = Field(None, max_length=100, description="리소스 ID")


class AuditLogCreate(AuditLogBase):
    """감사 로그 생성 스키마"""
    user_id: Optional[str] = Field(None, description="사용자 ID")
    old_val: Optional[Dict[str, Any]] = Field(None, description="변경 전 값")
    new_val: Optional[Dict[str, Any]] = Field(None, description="변경 후 값")
    ip_addr: Optional[str] = Field(None, max_length=45, description="IP 주소")
    user_agent: Optional[str] = Field(None, description="User Agent")
    req_mthd: Optional[str] = Field(None, max_length=10, description="HTTP 메서드")
    req_path: Optional[str] = Field(None, max_length=500, description="요청 경로")
    stts_cd: Optional[int] = Field(None, description="HTTP 상태 코드")
    err_msg: Optional[str] = Field(None, description="에러 메시지")


class AuditLogResponse(AuditLogBase):
    """감사 로그 응답 스키마"""
    common_audit_log_sn: int
    audit_log_id: str
    user_id: Optional[str]
    old_val: Optional[Dict[str, Any]]
    new_val: Optional[Dict[str, Any]]
    ip_addr: Optional[str]
    user_agent: Optional[str]
    req_mthd: Optional[str]
    req_path: Optional[str]
    stts_cd: Optional[int]
    err_msg: Optional[str]
    crt_dt: datetime
    use_yn: bool
    
    class Config:
        from_attributes = True

