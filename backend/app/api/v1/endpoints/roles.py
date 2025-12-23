"""역할 관련 엔드포인트"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.role import CommonRole
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
import uuid

router = APIRouter()


@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 생성"""
    # 중복 체크
    existing_role = db.query(CommonRole).filter(
        (CommonRole.role_cd == role_data.role_cd) |
        (CommonRole.role_id == f"ROLE_{role_data.role_cd}")
    ).first()
    
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 역할 코드입니다"
        )
    
    role_id = f"ROLE_{uuid.uuid4().hex[:8].upper()}"
    new_role = CommonRole(
        role_id=role_id,
        role_cd=role_data.role_cd,
        role_nm=role_data.role_nm,
        dsc=role_data.dsc,
        actv_yn=role_data.actv_yn,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    
    return new_role


@router.get("", response_model=List[RoleResponse])
async def get_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    actv_yn: bool = Query(None, description="활성 상태 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 목록 조회"""
    query = db.query(CommonRole).filter(CommonRole.del_yn == False)
    
    if actv_yn is not None:
        query = query.filter(CommonRole.actv_yn == actv_yn)
    
    roles = query.offset(skip).limit(limit).all()
    return roles


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 상세 조회"""
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    return role


@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: str,
    role_data: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 수정"""
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    update_data = role_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(role, field, value)
    
    role.upd_by = current_user.user_id
    role.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(role)
    
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 삭제 (소프트 삭제)"""
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    from datetime import datetime
    role.del_yn = True
    role.del_dt = datetime.utcnow()
    role.del_by = current_user.user_id
    role.del_by_nm = current_user.username
    
    db.commit()
    
    return None
