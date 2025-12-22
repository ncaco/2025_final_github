"""인증 관련 엔드포인트"""
from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import CommonUser
from app.models.refresh_token import CommonRefreshToken
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.config import settings
from app.schemas.auth import Token
from app.schemas.user import UserCreate, UserResponse, UserLogin
import uuid

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """사용자 회원가입"""
    # 중복 체크
    existing_user = db.query(CommonUser).filter(
        (CommonUser.username == user_data.username) |
        (CommonUser.eml == user_data.eml)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 사용자명 또는 이메일입니다"
        )
    
    # 사용자 생성
    user_id = f"USER_{uuid.uuid4().hex[:8].upper()}"
    new_user = CommonUser(
        user_id=user_id,
        eml=user_data.eml,
        username=user_data.username,
        pwd_hash=get_password_hash(user_data.password),
        nm=user_data.nm,
        nickname=user_data.nickname,
        telno=user_data.telno,
        crt_by="SYSTEM",
        crt_by_nm="시스템"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """사용자 로그인"""
    # 사용자 조회 (username 또는 email로)
    user = db.query(CommonUser).filter(
        (CommonUser.username == form_data.username) |
        (CommonUser.eml == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.pwd_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자명 또는 비밀번호가 올바르지 않습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.actv_yn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화된 사용자입니다"
        )
    
    if user.del_yn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="삭제된 사용자입니다"
        )
    
    # 토큰 생성
    access_token = create_access_token(data={"sub": user.user_id, "username": user.username})
    refresh_token = create_refresh_token(data={"sub": user.user_id})
    
    # 리프레시 토큰 저장
    from app.core.security import pwd_context
    token_hash = pwd_context.hash(refresh_token)
    refresh_token_id = f"RT_{uuid.uuid4().hex[:8].upper()}"
    
    new_refresh_token = CommonRefreshToken(
        refresh_token_id=refresh_token_id,
        user_id=user.user_id,
        token_hash=token_hash,
        expr_dt=datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days),
        crt_by=user.user_id,
        crt_by_nm=user.username or user.user_id
    )
    
    db.add(new_refresh_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """리프레시 토큰으로 액세스 토큰 갱신"""
    payload = decode_token(refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    # 사용자 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == user_id,
        CommonUser.del_yn == False,
        CommonUser.actv_yn == True
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 리프레시 토큰 확인 (해시로 저장된 토큰과 비교)
    from app.core.security import pwd_context
    
    # 저장된 모든 리프레시 토큰 확인
    stored_tokens = db.query(CommonRefreshToken).filter(
        CommonRefreshToken.user_id == user_id,
        CommonRefreshToken.rvk_yn == False,
        CommonRefreshToken.del_yn == False,
        CommonRefreshToken.expr_dt > datetime.utcnow()
    ).all()
    
    stored_token = None
    for token in stored_tokens:
        if pwd_context.verify(refresh_token, token.token_hash):
            stored_token = token
            break
    
    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    # 토큰 갱신
    stored_token.last_use_dt = datetime.utcnow()
    db.commit()
    
    # 새 액세스 토큰 생성
    access_token = create_access_token(data={"sub": user.user_id, "username": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

