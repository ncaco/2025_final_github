"""로그 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models.board import (
    BbsActivityLog, BbsPostHistory, BbsSearchLog, BbsAdminLog,
    ActivityType, ChangeType, AdminActionType
)
from app.models.user import CommonUser
from app.dependencies import get_current_active_user, is_admin_user
from app.schemas.logs import (
    ActivityLogResponse, PostHistoryResponse, SearchLogResponse,
    AdminLogResponse, LogListResponse
)

router = APIRouter()


@router.get(
    "/activity",
    response_model=LogListResponse,
    summary="활동 로그 조회",
    description="현재 사용자의 활동 로그를 조회합니다."
)
async def get_activity_logs(
    act_typ: Optional[ActivityType] = Query(None, description="활동 유형 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """활동 로그 조회"""
    skip = (page - 1) * limit

    query = db.query(BbsActivityLog).filter(
        BbsActivityLog.user_id == current_user.user_id
    )

    if act_typ:
        query = query.filter(BbsActivityLog.act_typ == act_typ)

    # 전체 개수 조회
    total = query.count()

    # 로그 목록 조회
    logs = query.order_by(desc(BbsActivityLog.crt_dt)).offset(skip).limit(limit).all()

    items = [ActivityLogResponse.from_orm(log) for log in logs]

    return LogListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


@router.get(
    "/post-history/{post_id}",
    response_model=LogListResponse,
    summary="게시글 히스토리 조회",
    description="특정 게시글의 수정 히스토리를 조회합니다."
)
async def get_post_history(
    post_id: int,
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 히스토리 조회"""
    from app.models.board import BbsPost

    # 게시글 존재 확인 및 권한 확인
    post = db.query(BbsPost).filter(BbsPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 본인 또는 관리자만 조회 가능
    from app.models.role import CommonRole
    from app.models.user_role import CommonUserRole
    from datetime import datetime

    admin_role = db.query(CommonUserRole).join(CommonRole).filter(
        CommonUserRole.user_id == current_user.user_id,
        CommonUserRole.use_yn == True,
        CommonUserRole.del_yn == False,
        CommonRole.role_cd == "ADMIN",
        CommonRole.actv_yn == True,
        CommonRole.del_yn == False,
        (CommonUserRole.expr_dt.is_(None)) | (CommonUserRole.expr_dt > datetime.utcnow())
    ).first()

    is_admin = admin_role is not None

    if post.user_id != current_user.user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 게시글의 히스토리를 조회할 권한이 없습니다"
        )

    skip = (page - 1) * limit

    query = db.query(BbsPostHistory).filter(
        BbsPostHistory.post_id == post_id
    )

    # 전체 개수 조회
    total = query.count()

    # 히스토리 목록 조회
    histories = query.order_by(desc(BbsPostHistory.crt_dt)).offset(skip).limit(limit).all()

    items = [PostHistoryResponse.from_orm(history) for history in histories]

    return LogListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


@router.get(
    "/search",
    response_model=LogListResponse,
    summary="검색 로그 조회",
    description="검색 로그를 조회합니다. (관리자만 전체 조회 가능, 일반 사용자는 자신의 로그만 조회)"
)
async def get_search_logs(
    user_id: Optional[str] = Query(None, description="사용자 ID 필터 (관리자만 사용 가능)"),
    search_typ: Optional[str] = Query(None, description="검색 유형 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """검색 로그 조회"""
    from app.models.role import CommonRole
    from app.models.user_role import CommonUserRole
    from datetime import datetime

    # 관리자 권한 확인
    admin_role = db.query(CommonUserRole).join(CommonRole).filter(
        CommonUserRole.user_id == current_user.user_id,
        CommonUserRole.use_yn == True,
        CommonUserRole.del_yn == False,
        CommonRole.role_cd == "ADMIN",
        CommonRole.actv_yn == True,
        CommonRole.del_yn == False,
        (CommonUserRole.expr_dt.is_(None)) | (CommonUserRole.expr_dt > datetime.utcnow())
    ).first()

    is_admin = admin_role is not None

    skip = (page - 1) * limit

    query = db.query(BbsSearchLog)

    # 일반 사용자는 자신의 로그만 조회 가능
    if not is_admin:
        query = query.filter(BbsSearchLog.user_id == current_user.user_id)
    elif user_id:
        # 관리자는 특정 사용자 필터 가능
        query = query.filter(BbsSearchLog.user_id == user_id)

    if search_typ:
        query = query.filter(BbsSearchLog.search_typ == search_typ)

    # 전체 개수 조회
    total = query.count()

    # 로그 목록 조회
    logs = query.order_by(desc(BbsSearchLog.crt_dt)).offset(skip).limit(limit).all()

    items = [SearchLogResponse.from_orm(log) for log in logs]

    return LogListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )


@router.get(
    "/admin",
    response_model=LogListResponse,
    summary="관리자 로그 조회",
    description="관리자 작업 로그를 조회합니다. (관리자만 조회 가능)"
)
async def get_admin_logs(
    admin_id: Optional[str] = Query(None, description="관리자 ID 필터"),
    act_typ: Optional[AdminActionType] = Query(None, description="작업 유형 필터"),
    target_typ: Optional[str] = Query(None, description="대상 유형 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(is_admin_user)
):
    """관리자 로그 조회"""
    skip = (page - 1) * limit

    query = db.query(BbsAdminLog)

    if admin_id:
        query = query.filter(BbsAdminLog.admin_id == admin_id)

    if act_typ:
        query = query.filter(BbsAdminLog.act_typ == act_typ)

    if target_typ:
        query = query.filter(BbsAdminLog.target_typ == target_typ)

    # 전체 개수 조회
    total = query.count()

    # 로그 목록 조회
    logs = query.order_by(desc(BbsAdminLog.crt_dt)).offset(skip).limit(limit).all()

    items = [AdminLogResponse.from_orm(log) for log in logs]

    return LogListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit
    )
