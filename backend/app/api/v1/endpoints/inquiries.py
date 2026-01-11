"""문의(Inquiry) 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.inquiry import CommonInquiry, InquiryStatus, InquiryCategory
from app.models.user import CommonUser
from app.models.role import CommonRole
from app.models.user_role import CommonUserRole
from app.dependencies import get_current_active_user, is_admin_user
from app.schemas.inquiry import (
    InquiryCreate, InquiryUpdate, InquiryResponse,
    InquiryAnswer, InquiryClose
)
from datetime import datetime

router = APIRouter()


@router.post(
    "/",
    response_model=InquiryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="문의 생성",
    description="새로운 문의를 생성합니다."
)
async def create_inquiry(
    inquiry: InquiryCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """문의 생성"""
    db_inquiry = CommonInquiry(
        user_id=current_user.user_id,
        title=inquiry.title,
        content=inquiry.content,
        category=inquiry.category,
        status=InquiryStatus.PENDING,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.nickname or current_user.username
    )
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    return db_inquiry


@router.get(
    "/",
    response_model=List[InquiryResponse],
    summary="내 문의 목록 조회",
    description="현재 사용자의 문의 목록을 조회합니다."
)
async def get_my_inquiries(
    status_filter: Optional[InquiryStatus] = Query(None, alias="status", description="상태 필터"),
    category_filter: Optional[InquiryCategory] = Query(None, alias="category", description="유형 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """내 문의 목록 조회"""
    skip = (page - 1) * limit

    query = db.query(CommonInquiry).filter(
        CommonInquiry.user_id == current_user.user_id,
        CommonInquiry.del_yn == False
    )

    if status_filter:
        query = query.filter(CommonInquiry.status == status_filter)

    if category_filter:
        query = query.filter(CommonInquiry.category == category_filter)

    inquiries = query.order_by(CommonInquiry.crt_dt.desc()).offset(skip).limit(limit).all()
    return inquiries


@router.get(
    "/admin/all",
    response_model=List[InquiryResponse],
    summary="모든 문의 목록 조회 (관리자용)",
    description="모든 사용자의 문의 목록을 조회합니다. 관리자 권한이 필요합니다."
)
async def get_all_inquiries_admin(
    status_filter: Optional[InquiryStatus] = Query(None, alias="status", description="상태 필터"),
    category_filter: Optional[InquiryCategory] = Query(None, alias="category", description="유형 필터"),
    user_id: Optional[str] = Query(None, description="사용자 ID 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(is_admin_user)
):
    """모든 문의 목록 조회 (관리자용)"""
    skip = (page - 1) * limit

    query = db.query(CommonInquiry).filter(
        CommonInquiry.del_yn == False
    )

    if status_filter:
        query = query.filter(CommonInquiry.status == status_filter)

    if category_filter:
        query = query.filter(CommonInquiry.category == category_filter)

    if user_id:
        query = query.filter(CommonInquiry.user_id == user_id)

    inquiries = query.order_by(CommonInquiry.crt_dt.desc()).offset(skip).limit(limit).all()
    return inquiries


@router.get(
    "/{inquiry_id}",
    response_model=InquiryResponse,
    summary="문의 상세 조회",
    description="문의 상세 정보를 조회합니다."
)
async def get_inquiry(
    inquiry_id: int = Path(..., description="문의 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """문의 상세 조회"""
    inquiry = db.query(CommonInquiry).filter(
        CommonInquiry.id == inquiry_id,
        CommonInquiry.del_yn == False
    ).first()

    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문의를 찾을 수 없습니다"
        )

    # 본인 또는 관리자만 조회 가능
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
    
    if inquiry.user_id != current_user.user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 문의를 조회할 권한이 없습니다"
        )

    return inquiry


@router.put(
    "/{inquiry_id}",
    response_model=InquiryResponse,
    summary="문의 수정",
    description="문의 내용을 수정합니다. (본인만 가능)"
)
async def update_inquiry(
    inquiry_id: int = Path(..., description="문의 ID"),
    inquiry_update: InquiryUpdate = ...,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """문의 수정"""
    inquiry = db.query(CommonInquiry).filter(
        CommonInquiry.id == inquiry_id,
        CommonInquiry.del_yn == False
    ).first()

    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문의를 찾을 수 없습니다"
        )

    # 본인만 수정 가능
    if inquiry.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 문의를 수정할 권한이 없습니다"
        )

    # 답변이 있으면 수정 불가
    if inquiry.status == InquiryStatus.ANSWERED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="답변이 완료된 문의는 수정할 수 없습니다"
        )

    # 업데이트
    update_data = inquiry_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inquiry, field, value)
    
    inquiry.upd_by = current_user.user_id
    inquiry.upd_by_nm = current_user.nickname or current_user.username
    db.commit()
    db.refresh(inquiry)

    return inquiry


@router.put(
    "/{inquiry_id}/answer",
    response_model=InquiryResponse,
    summary="문의 답변",
    description="문의에 답변합니다. (관리자만 가능)"
)
async def answer_inquiry(
    inquiry_id: int = Path(..., description="문의 ID"),
    answer: InquiryAnswer = ...,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(is_admin_user)
):
    """문의 답변"""
    inquiry = db.query(CommonInquiry).filter(
        CommonInquiry.id == inquiry_id,
        CommonInquiry.del_yn == False
    ).first()

    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문의를 찾을 수 없습니다"
        )

    # 답변 업데이트
    inquiry.answer = answer.answer
    inquiry.status = InquiryStatus.ANSWERED
    inquiry.answered_by = current_user.user_id
    inquiry.answered_at = datetime.utcnow()
    inquiry.upd_by = current_user.user_id
    inquiry.upd_by_nm = current_user.nickname or current_user.username
    
    db.commit()
    db.refresh(inquiry)

    return inquiry


@router.put(
    "/{inquiry_id}/close",
    response_model=InquiryResponse,
    summary="문의 종료",
    description="문의를 종료합니다. (본인 또는 관리자)"
)
async def close_inquiry(
    inquiry_id: int = Path(..., description="문의 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """문의 종료"""
    inquiry = db.query(CommonInquiry).filter(
        CommonInquiry.id == inquiry_id,
        CommonInquiry.del_yn == False
    ).first()

    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문의를 찾을 수 없습니다"
        )

    # 본인 또는 관리자만 종료 가능
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
    
    if inquiry.user_id != current_user.user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 문의를 종료할 권한이 없습니다"
        )

    inquiry.status = InquiryStatus.CLOSED
    inquiry.upd_by = current_user.user_id
    inquiry.upd_by_nm = current_user.nickname or current_user.username
    
    db.commit()
    db.refresh(inquiry)

    return inquiry


@router.delete(
    "/{inquiry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="문의 삭제",
    description="문의를 삭제합니다. (본인만 가능, 소프트 삭제)"
)
async def delete_inquiry(
    inquiry_id: int = Path(..., description="문의 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """문의 삭제"""
    inquiry = db.query(CommonInquiry).filter(
        CommonInquiry.id == inquiry_id,
        CommonInquiry.del_yn == False
    ).first()

    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="문의를 찾을 수 없습니다"
        )

    # 본인만 삭제 가능
    if inquiry.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="이 문의를 삭제할 권한이 없습니다"
        )

    # 소프트 삭제
    inquiry.del_yn = True
    inquiry.del_by = current_user.user_id
    inquiry.del_by_nm = current_user.nickname or current_user.username
    inquiry.del_dt = func.current_timestamp()
    
    db.commit()

    return None
