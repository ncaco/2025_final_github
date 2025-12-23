"""리프레시 토큰 관련 엔드포인트"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.refresh_token import CommonRefreshToken
from app.models.user import CommonUser
from app.dependencies import get_current_active_user
from app.schemas.refresh_token import RefreshTokenResponse

router = APIRouter()


@router.get("", response_model=List[RefreshTokenResponse])
async def get_refresh_tokens(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: str = Query(None, description="사용자 ID 필터"),
    rvk_yn: bool = Query(None, description="취소 여부 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """리프레시 토큰 목록 조회"""
    query = db.query(CommonRefreshToken).filter(CommonRefreshToken.del_yn == False)
    
    if user_id:
        query = query.filter(CommonRefreshToken.user_id == user_id)
    if rvk_yn is not None:
        query = query.filter(CommonRefreshToken.rvk_yn == rvk_yn)
    
    refresh_tokens = query.offset(skip).limit(limit).all()
    return refresh_tokens


@router.get("/{refresh_token_id}", response_model=RefreshTokenResponse)
async def get_refresh_token(
    refresh_token_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """리프레시 토큰 상세 조회"""
    refresh_token = db.query(CommonRefreshToken).filter(
        CommonRefreshToken.refresh_token_id == refresh_token_id,
        CommonRefreshToken.del_yn == False
    ).first()
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리프레시 토큰을 찾을 수 없습니다"
        )
    
    return refresh_token


@router.post("/{refresh_token_id}/revoke", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_refresh_token(
    refresh_token_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """리프레시 토큰 취소"""
    refresh_token = db.query(CommonRefreshToken).filter(
        CommonRefreshToken.refresh_token_id == refresh_token_id,
        CommonRefreshToken.del_yn == False
    ).first()
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리프레시 토큰을 찾을 수 없습니다"
        )
    
    refresh_token.rvk_yn = True
    refresh_token.rvk_dt = datetime.utcnow()
    
    db.commit()
    
    return None


@router.delete("/{refresh_token_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_refresh_token(
    refresh_token_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """리프레시 토큰 삭제 (소프트 삭제)"""
    refresh_token = db.query(CommonRefreshToken).filter(
        CommonRefreshToken.refresh_token_id == refresh_token_id,
        CommonRefreshToken.del_yn == False
    ).first()
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="리프레시 토큰을 찾을 수 없습니다"
        )
    
    refresh_token.del_yn = True
    refresh_token.del_dt = datetime.utcnow()
    refresh_token.del_by = current_user.user_id
    refresh_token.del_by_nm = current_user.username
    
    db.commit()
    
    return None

