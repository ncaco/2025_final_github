"""다국어 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.locale import CommonLocale
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.locale import LocaleCreate, LocaleUpdate, LocaleResponse
import uuid

router = APIRouter()


@router.post(
    "",
    response_model=LocaleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="다국어 리소스 생성",
    description="""
    새로운 다국어 리소스를 생성합니다.
    
    **요청 본문:**
    - `lang_cd`: 언어 코드 (필수, 예: "ko", "en", "ja")
    - `rsrc_typ`: 리소스 타입 (필수, 예: "LABEL", "MESSAGE", "ERROR")
    - `rsrc_key`: 리소스 키 (필수, 예: "login.title", "error.not_found")
    - `rsrc_val`: 번역된 값 (필수)
    
    **검증:**
    - 언어 코드 + 리소스 타입 + 리소스 키 조합의 중복을 방지합니다.
    - 로케일 ID는 자동으로 생성됩니다 (형식: `LOCALE_XXXXXXXX`)
    
    **에러:**
    - 400: 이미 존재하는 다국어 리소스
    
    **응답:**
    - 생성된 다국어 리소스 정보를 반환합니다.
    
    **사용 예시:**
    - 한국어 레이블: `lang_cd="ko"`, `rsrc_typ="LABEL"`, `rsrc_key="login.title"`, `rsrc_val="로그인"`
    - 영어 레이블: `lang_cd="en"`, `rsrc_typ="LABEL"`, `rsrc_key="login.title"`, `rsrc_val="Login"`
    """,
    response_description="생성된 다국어 리소스 정보를 반환합니다."
)
async def create_locale(
    locale_data: LocaleCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """다국어 리소스 생성"""
    # 중복 체크 (언어 코드 + 리소스 타입 + 리소스 키)
    existing = db.query(CommonLocale).filter(
        CommonLocale.lang_cd == locale_data.lang_cd,
        CommonLocale.rsrc_typ == locale_data.rsrc_typ,
        CommonLocale.rsrc_key == locale_data.rsrc_key,
        CommonLocale.del_yn == False
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 다국어 리소스입니다"
        )
    
    locale_id = f"LOCALE_{uuid.uuid4().hex[:8].upper()}"
    new_locale = CommonLocale(
        locale_id=locale_id,
        lang_cd=locale_data.lang_cd,
        rsrc_typ=locale_data.rsrc_typ,
        rsrc_key=locale_data.rsrc_key,
        rsrc_val=locale_data.rsrc_val,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_locale)
    db.commit()
    db.refresh(new_locale)
    
    return new_locale


@router.get(
    "",
    response_model=List[LocaleResponse],
    summary="다국어 리소스 목록 조회",
    description="""
    삭제되지 않은 다국어 리소스 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `lang_cd`: 언어 코드 필터 (선택, 예: "ko", "en")
    - `rsrc_typ`: 리소스 타입 필터 (선택, 예: "LABEL", "MESSAGE")
    - `rsrc_key`: 리소스 키 필터 (선택, 부분 일치 검색)
    - `use_yn`: 사용 여부 필터 (선택, true/false)
    
    **응답:**
    - 다국어 리소스 목록을 배열로 반환합니다.
    - 삭제된 리소스는 제외됩니다.
    
    **사용 예시:**
    - 한국어 레이블만 조회: `?lang_cd=ko&rsrc_typ=LABEL`
    - 특정 키 검색: `?rsrc_key=login`
    """,
    response_description="다국어 리소스 목록을 배열로 반환합니다."
)
async def get_locales(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    lang_cd: Optional[str] = Query(None, description="언어 코드 필터 (예: ko, en)"),
    rsrc_typ: Optional[str] = Query(None, description="리소스 타입 필터 (예: LABEL, MESSAGE)"),
    rsrc_key: Optional[str] = Query(None, description="리소스 키 필터"),
    use_yn: Optional[bool] = Query(None, description="사용 여부 필터 (true/false)"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """다국어 리소스 목록 조회"""
    query = db.query(CommonLocale).filter(CommonLocale.del_yn == False)
    
    if lang_cd:
        query = query.filter(CommonLocale.lang_cd == lang_cd)
    if rsrc_typ:
        query = query.filter(CommonLocale.rsrc_typ == rsrc_typ)
    if rsrc_key:
        query = query.filter(CommonLocale.rsrc_key == rsrc_key)
    if use_yn is not None:
        query = query.filter(CommonLocale.use_yn == use_yn)
    
    locales = query.offset(skip).limit(limit).all()
    return locales


@router.get(
    "/{locale_id}",
    response_model=LocaleResponse,
    summary="다국어 리소스 상세 조회",
    description="""
    특정 다국어 리소스의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `locale_id`: 조회할 리소스의 고유 ID
    
    **에러:**
    - 404: 다국어 리소스를 찾을 수 없음
    
    **응답:**
    - 다국어 리소스의 상세 정보를 반환합니다.
    """,
    response_description="다국어 리소스의 상세 정보를 반환합니다."
)
async def get_locale(
    locale_id: str = Path(..., description="다국어 리소스 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """다국어 리소스 상세 조회"""
    locale = db.query(CommonLocale).filter(
        CommonLocale.locale_id == locale_id,
        CommonLocale.del_yn == False
    ).first()
    
    if not locale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="다국어 리소스를 찾을 수 없습니다"
        )
    
    return locale


@router.put(
    "/{locale_id}",
    response_model=LocaleResponse,
    summary="다국어 리소스 수정",
    description="""
    다국어 리소스의 정보를 수정합니다.
    
    **경로 파라미터:**
    - `locale_id`: 수정할 리소스의 고유 ID
    
    **요청 본문:**
    - 수정할 필드만 포함하면 됩니다 (부분 업데이트 지원)
    - 수정 가능한 필드: `rsrc_val` (번역된 값), `use_yn` (사용 여부)
    
    **에러:**
    - 404: 다국어 리소스를 찾을 수 없음
    
    **응답:**
    - 수정된 다국어 리소스 정보를 반환합니다.
    """,
    response_description="수정된 다국어 리소스 정보를 반환합니다."
)
async def update_locale(
    locale_id: str = Path(..., description="다국어 리소스 고유 ID"),
    locale_data: LocaleUpdate = ...,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """다국어 리소스 수정"""
    locale = db.query(CommonLocale).filter(
        CommonLocale.locale_id == locale_id,
        CommonLocale.del_yn == False
    ).first()
    
    if not locale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="다국어 리소스를 찾을 수 없습니다"
        )
    
    update_data = locale_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(locale, field, value)
    
    locale.upd_by = current_user.user_id
    locale.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(locale)
    
    return locale


@router.delete(
    "/{locale_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="다국어 리소스 삭제",
    description="""
    다국어 리소스를 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `locale_id`: 삭제할 리소스의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 리소스는 조회되지 않습니다.
    
    **에러:**
    - 404: 다국어 리소스를 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_locale(
    locale_id: str = Path(..., description="다국어 리소스 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """다국어 리소스 삭제 (소프트 삭제)"""
    locale = db.query(CommonLocale).filter(
        CommonLocale.locale_id == locale_id,
        CommonLocale.del_yn == False
    ).first()
    
    if not locale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="다국어 리소스를 찾을 수 없습니다"
        )
    
    from datetime import datetime
    locale.del_yn = True
    locale.del_dt = datetime.utcnow()
    locale.del_by = current_user.user_id
    locale.del_by_nm = current_user.username
    
    db.commit()
    
    return None

