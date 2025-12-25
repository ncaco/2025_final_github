"""의존성 주입"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError
from app.database import get_db
from app.models.user import CommonUser
from app.models.user_role import CommonUserRole
from app.models.role import CommonRole
from app.core.security import decode_token
from app.schemas.auth import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> CommonUser:
    """현재 사용자 조회"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보를 확인할 수 없습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    token_data = TokenData(user_id=user_id)
    
    user = db.query(CommonUser).filter(
        CommonUser.user_id == token_data.user_id,
        CommonUser.del_yn == False,
        CommonUser.actv_yn == True
    ).first()
    
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(
    current_user: CommonUser = Depends(get_current_user)
) -> CommonUser:
    """활성 사용자 조회"""
    if not current_user.actv_yn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화된 사용자입니다"
        )
    return current_user


def is_admin_user(user: CommonUser, db: Session) -> bool:
    """사용자가 관리자 권한을 가지고 있는지 확인"""
    from datetime import datetime
    
    # 사용자의 활성 역할 중 ADMIN 역할이 있는지 확인 (조인으로 한 번에 조회)
    admin_role = db.query(CommonUserRole).join(CommonRole).filter(
        CommonUserRole.user_id == user.user_id,
        CommonUserRole.use_yn == True,
        CommonUserRole.del_yn == False,
        CommonRole.role_cd == "ADMIN",
        CommonRole.actv_yn == True,
        CommonRole.del_yn == False,
        # 만료일시가 없거나 미래인 경우만
        (CommonUserRole.expr_dt.is_(None)) | (CommonUserRole.expr_dt > datetime.utcnow())
    ).first()
    
    return admin_role is not None

