"""사용자-역할 매핑 관련 엔드포인트"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_role import CommonUserRole
from app.models.user import CommonUser
from app.models.role import CommonRole
from app.dependencies import get_current_active_user
from app.schemas.user_role import UserRoleCreate, UserRoleUpdate, UserRoleResponse
import uuid

router = APIRouter()


@router.post("", response_model=UserRoleResponse, status_code=status.HTTP_201_CREATED)
async def create_user_role(
    user_role_data: UserRoleCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 생성"""
    # 사용자 존재 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == user_role_data.user_id,
        CommonUser.del_yn == False
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 역할 존재 확인
    role = db.query(CommonRole).filter(
        CommonRole.role_id == user_role_data.role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    # 중복 체크
    existing = db.query(CommonUserRole).filter(
        CommonUserRole.user_id == user_role_data.user_id,
        CommonUserRole.role_id == user_role_data.role_id,
        CommonUserRole.del_yn == False,
        CommonUserRole.use_yn == True
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 사용자-역할 매핑입니다"
        )
    
    user_role_id = f"UR_{uuid.uuid4().hex[:8].upper()}"
    asgn_by = user_role_data.asgn_by or current_user.user_id
    asgn_dt = user_role_data.asgn_dt or datetime.utcnow()
    
    new_user_role = CommonUserRole(
        user_role_id=user_role_id,
        user_id=user_role_data.user_id,
        role_id=user_role_data.role_id,
        asgn_by=asgn_by,
        asgn_dt=asgn_dt,
        expr_dt=user_role_data.expr_dt,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_user_role)
    db.commit()
    db.refresh(new_user_role)
    
    return new_user_role


@router.get("", response_model=List[UserRoleResponse])
async def get_user_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: str = Query(None, description="사용자 ID 필터"),
    role_id: str = Query(None, description="역할 ID 필터"),
    use_yn: bool = Query(None, description="사용 여부 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 목록 조회"""
    query = db.query(CommonUserRole).filter(CommonUserRole.del_yn == False)
    
    if user_id:
        query = query.filter(CommonUserRole.user_id == user_id)
    if role_id:
        query = query.filter(CommonUserRole.role_id == role_id)
    if use_yn is not None:
        query = query.filter(CommonUserRole.use_yn == use_yn)
    
    user_roles = query.offset(skip).limit(limit).all()
    return user_roles


@router.get("/{user_role_id}", response_model=UserRoleResponse)
async def get_user_role(
    user_role_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 상세 조회"""
    user_role = db.query(CommonUserRole).filter(
        CommonUserRole.user_role_id == user_role_id,
        CommonUserRole.del_yn == False
    ).first()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자-역할 매핑을 찾을 수 없습니다"
        )
    
    return user_role


@router.put("/{user_role_id}", response_model=UserRoleResponse)
async def update_user_role(
    user_role_id: str,
    user_role_data: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 수정"""
    user_role = db.query(CommonUserRole).filter(
        CommonUserRole.user_role_id == user_role_id,
        CommonUserRole.del_yn == False
    ).first()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자-역할 매핑을 찾을 수 없습니다"
        )
    
    update_data = user_role_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user_role, field, value)
    
    user_role.upd_by = current_user.user_id
    user_role.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(user_role)
    
    return user_role


@router.delete("/{user_role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_role(
    user_role_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 삭제 (소프트 삭제)"""
    user_role = db.query(CommonUserRole).filter(
        CommonUserRole.user_role_id == user_role_id,
        CommonUserRole.del_yn == False
    ).first()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자-역할 매핑을 찾을 수 없습니다"
        )
    
    user_role.del_yn = True
    user_role.del_dt = datetime.utcnow()
    user_role.del_by = current_user.user_id
    user_role.del_by_nm = current_user.username
    
    db.commit()
    
    return None

