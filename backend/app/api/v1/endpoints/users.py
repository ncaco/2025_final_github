"""사용자 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import CommonUser
from app.dependencies import get_current_active_user
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserDetailResponse
from app.core.security import get_password_hash
import uuid

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: CommonUser = Depends(get_current_active_user)
):
    """현재 사용자 정보 조회"""
    return current_user


@router.get("", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 목록 조회"""
    users = db.query(CommonUser).filter(
        CommonUser.del_yn == False
    ).offset(skip).limit(limit).all()
    
    return users


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 상세 조회"""
    user = db.query(CommonUser).filter(
        CommonUser.user_id == user_id,
        CommonUser.del_yn == False
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 정보 수정"""
    # 본인 또는 관리자만 수정 가능 (간단한 예시)
    if current_user.user_id != user_id:
        # TODO: 관리자 권한 체크 추가
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="권한이 없습니다"
        )
    
    user = db.query(CommonUser).filter(
        CommonUser.user_id == user_id,
        CommonUser.del_yn == False
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 업데이트
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.upd_by = current_user.user_id
    user.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 삭제 (소프트 삭제)"""
    # 본인 또는 관리자만 삭제 가능
    if current_user.user_id != user_id:
        # TODO: 관리자 권한 체크 추가
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="권한이 없습니다"
        )
    
    user = db.query(CommonUser).filter(
        CommonUser.user_id == user_id,
        CommonUser.del_yn == False
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 소프트 삭제
    from datetime import datetime
    user.del_yn = True
    user.del_dt = datetime.utcnow()
    user.del_by = current_user.user_id
    user.del_by_nm = current_user.username
    
    db.commit()
    
    return None

