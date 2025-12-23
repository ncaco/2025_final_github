"""역할-권한 매핑 관련 엔드포인트"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.role_permission import CommonRolePermission
from app.models.role import CommonRole
from app.models.permission import CommonPermission
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.role_permission import RolePermissionCreate, RolePermissionResponse
import uuid

router = APIRouter()


@router.post("", response_model=RolePermissionResponse, status_code=status.HTTP_201_CREATED)
async def create_role_permission(
    role_permission_data: RolePermissionCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 생성"""
    # 역할 존재 확인
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_permission_data.role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    # 권한 존재 확인
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == role_permission_data.permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    # 중복 체크
    existing = db.query(CommonRolePermission).filter(
        CommonRolePermission.role_id == role_permission_data.role_id,
        CommonRolePermission.permission_id == role_permission_data.permission_id,
        CommonRolePermission.del_yn == False
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 역할-권한 매핑입니다"
        )
    
    role_permission_id = f"RP_{uuid.uuid4().hex[:8].upper()}"
    new_role_permission = CommonRolePermission(
        role_permission_id=role_permission_id,
        role_id=role_permission_data.role_id,
        permission_id=role_permission_data.permission_id,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_role_permission)
    db.commit()
    db.refresh(new_role_permission)
    
    return new_role_permission


@router.get("", response_model=List[RolePermissionResponse])
async def get_role_permissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role_id: str = Query(None, description="역할 ID 필터"),
    permission_id: str = Query(None, description="권한 ID 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 목록 조회"""
    query = db.query(CommonRolePermission).filter(CommonRolePermission.del_yn == False)
    
    if role_id:
        query = query.filter(CommonRolePermission.role_id == role_id)
    if permission_id:
        query = query.filter(CommonRolePermission.permission_id == permission_id)
    
    role_permissions = query.offset(skip).limit(limit).all()
    return role_permissions


@router.get("/{role_permission_id}", response_model=RolePermissionResponse)
async def get_role_permission(
    role_permission_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 상세 조회"""
    role_permission = db.query(CommonRolePermission).filter(
        CommonRolePermission.role_permission_id == role_permission_id,
        CommonRolePermission.del_yn == False
    ).first()
    
    if not role_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할-권한 매핑을 찾을 수 없습니다"
        )
    
    return role_permission


@router.delete("/{role_permission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_role_permission(
    role_permission_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 삭제 (소프트 삭제)"""
    role_permission = db.query(CommonRolePermission).filter(
        CommonRolePermission.role_permission_id == role_permission_id,
        CommonRolePermission.del_yn == False
    ).first()
    
    if not role_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할-권한 매핑을 찾을 수 없습니다"
        )
    
    from datetime import datetime
    role_permission.del_yn = True
    role_permission.del_dt = datetime.utcnow()
    role_permission.del_by = current_user.user_id
    role_permission.del_by_nm = current_user.username
    
    db.commit()
    
    return None

