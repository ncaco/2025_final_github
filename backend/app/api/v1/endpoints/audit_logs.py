"""감사 로그 관련 엔드포인트"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.audit_log import CommonAuditLog
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.audit_log import AuditLogCreate, AuditLogResponse
import uuid

router = APIRouter()


@router.post(
    "",
    response_model=AuditLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="감사 로그 생성",
    description="""
    새로운 감사 로그를 생성합니다.
    
    **요청 본문:**
    - `act_typ`: 액션 타입 (필수, 예: "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "API_CALL")
    - `user_id`: 사용자 ID (선택, 기본값: 현재 사용자)
    - `rsrc_typ`: 리소스 타입 (선택, 예: "USER", "FILE", "ROLE")
    - `rsrc_id`: 리소스 ID (선택)
    - `old_val`: 변경 전 값 (선택, JSON 형식)
    - `new_val`: 변경 후 값 (선택, JSON 형식)
    - `ip_addr`: IP 주소 (선택)
    - `user_agent`: User Agent (선택)
    - `req_mthd`: HTTP 메서드 (선택, 예: "GET", "POST", "PUT", "DELETE")
    - `req_path`: 요청 경로 (선택)
    - `stts_cd`: HTTP 상태 코드 (선택)
    - `err_msg`: 에러 메시지 (선택)
    
    **검증:**
    - 로그 ID는 자동으로 생성됩니다 (형식: `LOG_XXXXXXXX`)
    - 사용자 ID가 제공되지 않으면 현재 사용자 ID가 사용됩니다.
    
    **응답:**
    - 생성된 감사 로그 정보를 반환합니다.
    """,
    response_description="생성된 감사 로그 정보를 반환합니다."
)
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


@router.get(
    "",
    response_model=List[AuditLogResponse],
    summary="감사 로그 목록 조회",
    description="""
    삭제되지 않은 감사 로그 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `user_id`: 사용자 ID 필터 (선택, 특정 사용자의 로그만 조회)
    - `act_typ`: 액션 타입 필터 (선택, 예: "LOGIN", "CREATE", "DELETE")
    - `rsrc_typ`: 리소스 타입 필터 (선택, 예: "USER", "FILE")
    - `rsrc_id`: 리소스 ID 필터 (선택)
    - `start_date`: 시작 날짜 필터 (선택, ISO 8601 형식)
    - `end_date`: 종료 날짜 필터 (선택, ISO 8601 형식)
    
    **정렬:**
    - 생성일시(`crt_dt`) 기준 내림차순으로 정렬됩니다 (최신순).
    
    **응답:**
    - 감사 로그 목록을 배열로 반환합니다.
    - 삭제된 로그는 제외됩니다.
    """,
    response_description="감사 로그 목록을 배열로 반환합니다."
)
async def get_audit_logs(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    user_id: Optional[str] = Query(None, description="사용자 ID 필터"),
    act_typ: Optional[str] = Query(None, description="액션 타입 필터 (예: LOGIN, CREATE)"),
    rsrc_typ: Optional[str] = Query(None, description="리소스 타입 필터 (예: USER, FILE)"),
    rsrc_id: Optional[str] = Query(None, description="리소스 ID 필터"),
    start_date: Optional[datetime] = Query(None, description="시작 날짜 (ISO 8601 형식)"),
    end_date: Optional[datetime] = Query(None, description="종료 날짜 (ISO 8601 형식)"),
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


@router.get(
    "/{audit_log_id}",
    response_model=AuditLogResponse,
    summary="감사 로그 상세 조회",
    description="""
    특정 감사 로그의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `audit_log_id`: 조회할 로그의 고유 ID
    
    **에러:**
    - 404: 감사 로그를 찾을 수 없음
    
    **응답:**
    - 감사 로그의 상세 정보를 반환합니다.
    - 변경 전/후 값(`old_val`, `new_val`)이 JSON 형식으로 포함됩니다.
    """,
    response_description="감사 로그의 상세 정보를 반환합니다."
)
async def get_audit_log(
    audit_log_id: str = Path(..., description="감사 로그 고유 ID"),
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

