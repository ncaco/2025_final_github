"""사용자 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import CommonUser
from app.dependencies import get_current_active_user
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserDetailResponse
from app.core.security import get_password_hash
import uuid

router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    summary="현재 사용자 정보 조회",
    description="""
    현재 로그인한 사용자의 정보를 조회합니다.
    
    - 인증된 사용자만 접근 가능합니다.
    - JWT 토큰에서 사용자 정보를 추출하여 반환합니다.
    - 활성화된 사용자만 조회 가능합니다.
    """,
    response_description="현재 사용자의 상세 정보를 반환합니다."
)
async def get_current_user_info(
    current_user: CommonUser = Depends(get_current_active_user)
):
    """현재 사용자 정보 조회"""
    return current_user


@router.get(
    "",
    response_model=List[UserResponse],
    summary="사용자 목록 조회",
    description="""
    삭제되지 않은 사용자 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    
    **주의사항:**
    - 삭제된 사용자(`del_yn=True`)는 제외됩니다.
    - 인증된 사용자만 접근 가능합니다.
    """,
    response_description="사용자 목록을 배열로 반환합니다."
)
async def get_users(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 목록 조회"""
    users = db.query(CommonUser).filter(
        CommonUser.del_yn == False
    ).offset(skip).limit(limit).all()
    
    return users


@router.get(
    "/{user_id}",
    response_model=UserDetailResponse,
    summary="사용자 상세 조회",
    description="""
    특정 사용자의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `user_id`: 조회할 사용자의 고유 ID
    
    **응답:**
    - 사용자의 모든 상세 정보를 반환합니다.
    - 삭제된 사용자는 조회할 수 없습니다.
    
    **에러:**
    - 404: 사용자를 찾을 수 없음
    """,
    response_description="사용자의 상세 정보를 반환합니다."
)
async def get_user(
    user_id: str = Path(..., description="사용자 고유 ID"),
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


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="사용자 정보 수정",
    description="""
    사용자의 정보를 수정합니다.
    
    **경로 파라미터:**
    - `user_id`: 수정할 사용자의 고유 ID
    
    **요청 본문:**
    - 수정할 필드만 포함하면 됩니다 (부분 업데이트 지원)
    - 수정 가능한 필드: `eml`, `username`, `nm`, `nickname`, `telno`, `actv_yn`, `eml_vrf_yn`, `telno_vrf_yn`
    
    **권한:**
    - 본인만 수정 가능합니다 (관리자 권한 체크는 추후 추가 예정)
    
    **에러:**
    - 403: 권한 없음
    - 404: 사용자를 찾을 수 없음
    """,
    response_description="수정된 사용자 정보를 반환합니다."
)
async def update_user(
    user_id: str,
    user_data: UserUpdate = ...,
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


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="사용자 삭제",
    description="""
    사용자를 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `user_id`: 삭제할 사용자의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 사용자는 조회되지 않습니다.
    
    **권한:**
    - 본인만 삭제 가능합니다 (관리자 권한 체크는 추후 추가 예정)
    
    **에러:**
    - 403: 권한 없음
    - 404: 사용자를 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_user(
    user_id: str = Path(..., description="사용자 고유 ID"),
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

