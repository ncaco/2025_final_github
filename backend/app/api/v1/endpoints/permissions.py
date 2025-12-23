"""권한 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.permission import CommonPermission
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.permission import PermissionCreate, PermissionUpdate, PermissionResponse
import uuid

router = APIRouter()


@router.post("", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
async def create_permission(
    permission_data: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 생성"""
    # 중복 체크
    existing_permission = db.query(CommonPermission).filter(
        CommonPermission.permission_cd == permission_data.permission_cd
    ).first()
    
    if existing_permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 권한 코드입니다"
        )
    
    permission_id = f"PERM_{uuid.uuid4().hex[:8].upper()}"
    new_permission = CommonPermission(
        permission_id=permission_id,
        permission_cd=permission_data.permission_cd,
        permission_nm=permission_data.permission_nm,
        dsc=permission_data.dsc,
        rsrc=permission_data.rsrc,
        act=permission_data.act,
        actv_yn=permission_data.actv_yn,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)
    
    return new_permission


@router.get("", response_model=List[PermissionResponse])
async def get_permissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    rsrc: Optional[str] = Query(None, description="리소스 필터"),
    act: Optional[str] = Query(None, description="액션 필터"),
    actv_yn: Optional[bool] = Query(None, description="활성 상태 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 목록 조회"""
    query = db.query(CommonPermission).filter(CommonPermission.del_yn == False)
    
    if rsrc:
        query = query.filter(CommonPermission.rsrc == rsrc)
    if act:
        query = query.filter(CommonPermission.act == act)
    if actv_yn is not None:
        query = query.filter(CommonPermission.actv_yn == actv_yn)
    
    permissions = query.offset(skip).limit(limit).all()
    return permissions


@router.get("/{permission_id}", response_model=PermissionResponse)
async def get_permission(
    permission_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 상세 조회"""
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    return permission


@router.put("/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: str,
    permission_data: PermissionUpdate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 수정"""
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    update_data = permission_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(permission, field, value)
    
    permission.upd_by = current_user.user_id
    permission.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(permission)
    
    return permission


@router.delete("/{permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_permission(
    permission_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 삭제 (소프트 삭제)"""
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    from datetime import datetime
    permission.del_yn = True
    permission.del_dt = datetime.utcnow()
    permission.del_by = current_user.user_id
    permission.del_by_nm = current_user.username
    
    db.commit()
    
    return None

