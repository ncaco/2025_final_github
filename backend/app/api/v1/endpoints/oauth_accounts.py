"""OAuth 계정 관련 엔드포인트"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.oauth_account import CommonOauthAccount
from app.models.user import CommonUser
from app.dependencies import get_current_active_user
from app.schemas.oauth_account import OauthAccountCreate, OauthAccountUpdate, OauthAccountResponse
import uuid

router = APIRouter()


@router.post(
    "",
    response_model=OauthAccountResponse,
    status_code=status.HTTP_201_CREATED,
    summary="OAuth 계정 생성",
    description="""
    사용자의 OAuth 계정 정보를 등록합니다.
    
    **요청 본문:**
    - `user_id`: 사용자 고유 ID (필수)
    - `provider`: OAuth 제공자 (필수, 예: "GOOGLE", "GITHUB", "KAKAO", "NAVER")
    - `provider_user_id`: 제공자에서의 사용자 ID (필수)
    - `provider_eml`: 제공자에서 제공한 이메일 (선택)
    - `provider_username`: 제공자에서 제공한 사용자명 (선택)
    - `access_token`: 액세스 토큰 (선택, 암호화 저장 권장)
    - `refresh_token`: 리프레시 토큰 (선택, 암호화 저장 권장)
    - `token_expr_dt`: 토큰 만료일시 (선택)
    
    **검증:**
    - 사용자 존재 여부를 확인합니다.
    - 제공자와 제공자 사용자 ID 조합의 중복을 방지합니다.
    - OAuth 계정 ID는 자동으로 생성됩니다 (형식: `OAUTH_XXXXXXXX`)
    
    **에러:**
    - 400: 이미 존재하는 OAuth 계정
    - 404: 사용자를 찾을 수 없음
    
    **응답:**
    - 생성된 OAuth 계정 정보를 반환합니다.
    """,
    response_description="생성된 OAuth 계정 정보를 반환합니다."
)
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


@router.get(
    "",
    response_model=List[OauthAccountResponse],
    summary="OAuth 계정 목록 조회",
    description="""
    삭제되지 않은 OAuth 계정 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `user_id`: 사용자 ID 필터 (선택, 특정 사용자의 OAuth 계정만 조회)
    - `provider`: 제공자 필터 (선택, 예: "GOOGLE", "GITHUB")
    
    **응답:**
    - OAuth 계정 목록을 배열로 반환합니다.
    - 삭제된 계정은 제외됩니다.
    """,
    response_description="OAuth 계정 목록을 배열로 반환합니다."
)
async def get_oauth_accounts(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    user_id: str = Query(None, description="사용자 ID 필터"),
    provider: str = Query(None, description="제공자 필터 (예: GOOGLE, GITHUB)"),
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


@router.get(
    "/{oauth_account_id}",
    response_model=OauthAccountResponse,
    summary="OAuth 계정 상세 조회",
    description="""
    특정 OAuth 계정의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `oauth_account_id`: 조회할 OAuth 계정의 고유 ID
    
    **에러:**
    - 404: OAuth 계정을 찾을 수 없음
    
    **응답:**
    - OAuth 계정의 상세 정보를 반환합니다.
    """,
    response_description="OAuth 계정의 상세 정보를 반환합니다."
)
async def get_oauth_account(
    oauth_account_id: str = Path(..., description="OAuth 계정 고유 ID"),
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


@router.put(
    "/{oauth_account_id}",
    response_model=OauthAccountResponse,
    summary="OAuth 계정 수정",
    description="""
    OAuth 계정의 정보를 수정합니다.
    
    **경로 파라미터:**
    - `oauth_account_id`: 수정할 OAuth 계정의 고유 ID
    
    **요청 본문:**
    - 수정할 필드만 포함하면 됩니다 (부분 업데이트 지원)
    - 수정 가능한 필드: `provider_eml`, `provider_username`, `access_token`, `refresh_token`, `token_expr_dt`
    
    **에러:**
    - 404: OAuth 계정을 찾을 수 없음
    
    **응답:**
    - 수정된 OAuth 계정 정보를 반환합니다.
    """,
    response_description="수정된 OAuth 계정 정보를 반환합니다."
)
async def update_oauth_account(
    oauth_account_id: str = Path(..., description="OAuth 계정 고유 ID"),
    oauth_account_data: OauthAccountUpdate = ...,
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


@router.delete(
    "/{oauth_account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="OAuth 계정 삭제",
    description="""
    OAuth 계정을 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `oauth_account_id`: 삭제할 OAuth 계정의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 계정은 조회되지 않습니다.
    
    **에러:**
    - 404: OAuth 계정을 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_oauth_account(
    oauth_account_id: str = Path(..., description="OAuth 계정 고유 ID"),
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

