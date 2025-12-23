"""리프레시 토큰 관련 엔드포인트"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.refresh_token import CommonRefreshToken
from app.models.user import CommonUser
from app.dependencies import get_current_active_user
from app.schemas.refresh_token import RefreshTokenResponse

router = APIRouter()


@router.get(
    "",
    response_model=List[RefreshTokenResponse],
    summary="리프레시 토큰 목록 조회",
    description="""
    삭제되지 않은 리프레시 토큰 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `user_id`: 사용자 ID 필터 (선택, 특정 사용자의 토큰만 조회)
    - `rvk_yn`: 취소 여부 필터 (선택, true/false)
    
    **응답:**
    - 리프레시 토큰 목록을 배열로 반환합니다.
    - 삭제된 토큰은 제외됩니다.
    - 토큰 해시값은 보안상 반환되지 않습니다.
    """,
    response_description="리프레시 토큰 목록을 배열로 반환합니다."
)
async def get_refresh_tokens(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    user_id: str = Query(None, description="사용자 ID 필터"),
    rvk_yn: bool = Query(None, description="취소 여부 필터 (true/false)"),
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


@router.get(
    "/{refresh_token_id}",
    response_model=RefreshTokenResponse,
    summary="리프레시 토큰 상세 조회",
    description="""
    특정 리프레시 토큰의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `refresh_token_id`: 조회할 토큰의 고유 ID
    
    **에러:**
    - 404: 리프레시 토큰을 찾을 수 없음
    
    **응답:**
    - 리프레시 토큰의 상세 정보를 반환합니다.
    - 토큰 해시값은 보안상 반환되지 않습니다.
    """,
    response_description="리프레시 토큰의 상세 정보를 반환합니다."
)
async def get_refresh_token(
    refresh_token_id: str = Path(..., description="리프레시 토큰 고유 ID"),
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


@router.post(
    "/{refresh_token_id}/revoke",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="리프레시 토큰 취소",
    description="""
    리프레시 토큰을 취소하여 더 이상 사용할 수 없도록 합니다.
    
    **경로 파라미터:**
    - `refresh_token_id`: 취소할 토큰의 고유 ID
    
    **동작:**
    - 토큰의 `rvk_yn` 플래그를 `True`로 설정합니다.
    - 취소 일시(`rvk_dt`)가 기록됩니다.
    - 취소된 토큰은 액세스 토큰 갱신에 사용할 수 없습니다.
    
    **에러:**
    - 404: 리프레시 토큰을 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 취소됨
    
    **사용 예시:**
    - 사용자 로그아웃 시 모든 리프레시 토큰을 취소할 수 있습니다.
    - 특정 디바이스의 토큰만 취소할 수 있습니다.
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def revoke_refresh_token(
    refresh_token_id: str = Path(..., description="리프레시 토큰 고유 ID"),
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


@router.delete(
    "/{refresh_token_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="리프레시 토큰 삭제",
    description="""
    리프레시 토큰을 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `refresh_token_id`: 삭제할 토큰의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 토큰은 조회되지 않습니다.
    
    **주의사항:**
    - 토큰 취소(`revoke`)와 삭제(`delete`)는 다른 동작입니다.
    - 취소는 토큰을 무효화하지만, 삭제는 완전히 제거합니다.
    
    **에러:**
    - 404: 리프레시 토큰을 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_refresh_token(
    refresh_token_id: str = Path(..., description="리프레시 토큰 고유 ID"),
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

