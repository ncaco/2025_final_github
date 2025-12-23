"""감사 로그 관련 엔드포인트"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.audit_log import CommonAuditLog
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.audit_log import AuditLogCreate, AuditLogResponse
import uuid

router = APIRouter()


@router.post("", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_audit_log(
    audit_log_data: AuditLogCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """감사 로그 생성"""
    audit_log_id = f"LOG_{uuid.uuid4().hex[:8].upper()}"
    new_audit_log = CommonAuditLog(
        audit_log_id=audit_log_id,
        user_id=audit_log_data.user_id or current_user.user_id,
        act_typ=audit_log_data.act_typ,
        rsrc_typ=audit_log_data.rsrc_typ,
        rsrc_id=audit_log_data.rsrc_id,
        old_val=audit_log_data.old_val,
        new_val=audit_log_data.new_val,
        ip_addr=audit_log_data.ip_addr,
        user_agent=audit_log_data.user_agent,
        req_mthd=audit_log_data.req_mthd,
        req_path=audit_log_data.req_path,
        stts_cd=audit_log_data.stts_cd,
        err_msg=audit_log_data.err_msg,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_audit_log)
    db.commit()
    db.refresh(new_audit_log)
    
    return new_audit_log


@router.get("", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = Query(None, description="사용자 ID 필터"),
    act_typ: Optional[str] = Query(None, description="액션 타입 필터"),
    rsrc_typ: Optional[str] = Query(None, description="리소스 타입 필터"),
    rsrc_id: Optional[str] = Query(None, description="리소스 ID 필터"),
    start_date: Optional[datetime] = Query(None, description="시작 날짜"),
    end_date: Optional[datetime] = Query(None, description="종료 날짜"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """감사 로그 목록 조회"""
    query = db.query(CommonAuditLog).filter(CommonAuditLog.del_yn == False)
    
    if user_id:
        query = query.filter(CommonAuditLog.user_id == user_id)
    if act_typ:
        query = query.filter(CommonAuditLog.act_typ == act_typ)
    if rsrc_typ:
        query = query.filter(CommonAuditLog.rsrc_typ == rsrc_typ)
    if rsrc_id:
        query = query.filter(CommonAuditLog.rsrc_id == rsrc_id)
    if start_date:
        query = query.filter(CommonAuditLog.crt_dt >= start_date)
    if end_date:
        query = query.filter(CommonAuditLog.crt_dt <= end_date)
    
    audit_logs = query.order_by(CommonAuditLog.crt_dt.desc()).offset(skip).limit(limit).all()
    return audit_logs


@router.get("/{audit_log_id}", response_model=AuditLogResponse)
async def get_audit_log(
    audit_log_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """감사 로그 상세 조회"""
    audit_log = db.query(CommonAuditLog).filter(
        CommonAuditLog.audit_log_id == audit_log_id,
        CommonAuditLog.del_yn == False
    ).first()
    
    if not audit_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="감사 로그를 찾을 수 없습니다"
        )
    
    return audit_log

