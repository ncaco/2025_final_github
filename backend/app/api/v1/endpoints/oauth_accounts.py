"""OAuth 계정 관련 엔드포인트"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.oauth_account import CommonOauthAccount
from app.models.user import CommonUser
from app.dependencies import get_current_active_user
from app.schemas.oauth_account import OauthAccountCreate, OauthAccountUpdate, OauthAccountResponse
import uuid

router = APIRouter()


@router.post("", response_model=OauthAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_oauth_account(
    oauth_account_data: OauthAccountCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """OAuth 계정 생성"""
    # 사용자 존재 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == oauth_account_data.user_id,
        CommonUser.del_yn == False
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 중복 체크 (제공자 + 제공자 사용자 ID)
    existing = db.query(CommonOauthAccount).filter(
        CommonOauthAccount.provider == oauth_account_data.provider,
        CommonOauthAccount.provider_user_id == oauth_account_data.provider_user_id,
        CommonOauthAccount.del_yn == False
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 OAuth 계정입니다"
        )
    
    oauth_account_id = f"OAUTH_{uuid.uuid4().hex[:8].upper()}"
    new_oauth_account = CommonOauthAccount(
        oauth_account_id=oauth_account_id,
        user_id=oauth_account_data.user_id,
        provider=oauth_account_data.provider,
        provider_user_id=oauth_account_data.provider_user_id,
        provider_eml=oauth_account_data.provider_eml,
        provider_username=oauth_account_data.provider_username,
        access_token=oauth_account_data.access_token,
        refresh_token=oauth_account_data.refresh_token,
        token_expr_dt=oauth_account_data.token_expr_dt,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_oauth_account)
    db.commit()
    db.refresh(new_oauth_account)
    
    return new_oauth_account


@router.get("", response_model=List[OauthAccountResponse])
async def get_oauth_accounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: str = Query(None, description="사용자 ID 필터"),
    provider: str = Query(None, description="제공자 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """OAuth 계정 목록 조회"""
    query = db.query(CommonOauthAccount).filter(CommonOauthAccount.del_yn == False)
    
    if user_id:
        query = query.filter(CommonOauthAccount.user_id == user_id)
    if provider:
        query = query.filter(CommonOauthAccount.provider == provider)
    
    oauth_accounts = query.offset(skip).limit(limit).all()
    return oauth_accounts


@router.get("/{oauth_account_id}", response_model=OauthAccountResponse)
async def get_oauth_account(
    oauth_account_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """OAuth 계정 상세 조회"""
    oauth_account = db.query(CommonOauthAccount).filter(
        CommonOauthAccount.oauth_account_id == oauth_account_id,
        CommonOauthAccount.del_yn == False
    ).first()
    
    if not oauth_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OAuth 계정을 찾을 수 없습니다"
        )
    
    return oauth_account


@router.put("/{oauth_account_id}", response_model=OauthAccountResponse)
async def update_oauth_account(
    oauth_account_id: str,
    oauth_account_data: OauthAccountUpdate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """OAuth 계정 수정"""
    oauth_account = db.query(CommonOauthAccount).filter(
        CommonOauthAccount.oauth_account_id == oauth_account_id,
        CommonOauthAccount.del_yn == False
    ).first()
    
    if not oauth_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OAuth 계정을 찾을 수 없습니다"
        )
    
    update_data = oauth_account_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(oauth_account, field, value)
    
    oauth_account.upd_by = current_user.user_id
    oauth_account.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(oauth_account)
    
    return oauth_account


@router.delete("/{oauth_account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_oauth_account(
    oauth_account_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """OAuth 계정 삭제 (소프트 삭제)"""
    oauth_account = db.query(CommonOauthAccount).filter(
        CommonOauthAccount.oauth_account_id == oauth_account_id,
        CommonOauthAccount.del_yn == False
    ).first()
    
    if not oauth_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="OAuth 계정을 찾을 수 없습니다"
        )
    
    from datetime import datetime
    oauth_account.del_yn = True
    oauth_account.del_dt = datetime.utcnow()
    oauth_account.del_by = current_user.user_id
    oauth_account.del_by_nm = current_user.username
    
    db.commit()
    
    return None

