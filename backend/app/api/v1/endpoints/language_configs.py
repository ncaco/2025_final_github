"""언어 설정 API 엔드포인트"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Path
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.models.language_config import CommonLanguageConfig
from app.schemas.language_config import (
    LanguageConfigCreate,
    LanguageConfigUpdate,
    LanguageConfigResponse
)

router = APIRouter()


@router.get(
    "",
    response_model=List[LanguageConfigResponse],
    summary="언어 설정 목록 조회",
    description="""
    시스템에서 사용 가능한 언어 설정 목록을 조회합니다.

    **쿼리 파라미터:**
    - `use_yn`: 사용 여부 필터 (선택, true/false)

    **정렬:** 표시 순서(display_order)로 오름차순 정렬
    """,
    response_description="언어 설정 목록을 배열로 반환합니다."
)
async def get_language_configs(
    use_yn: Optional[bool] = Query(None, description="사용 여부 필터 (true/false)"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """언어 설정 목록 조회"""
    query = db.query(CommonLanguageConfig).filter(CommonLanguageConfig.del_yn == False)

    if use_yn is not None:
        query = query.filter(CommonLanguageConfig.use_yn == use_yn)

    # 표시 순서로 정렬
    language_configs = query.order_by(CommonLanguageConfig.display_order).all()

    return language_configs


@router.post(
    "",
    response_model=LanguageConfigResponse,
    status_code=status.HTTP_201_CREATED,
    summary="언어 설정 생성",
    description="""
    새로운 언어 설정을 생성합니다.

    **요청 본문:**
    - `lang_cd`: 언어 코드 (필수, 예: "ko", "en", "ja")
    - `lang_nm`: 언어 이름 (필수, 예: "한국어", "English")
    - `display_order`: 표시 순서 (선택, 기본값: 0)
    - `use_yn`: 사용 여부 (선택, 기본값: true)

    **중복 체크:** 동일한 언어 코드(lang_cd)는 생성할 수 없습니다.

    **에러:**
    - 400: 이미 존재하는 언어 코드

    **응답:**
    - 생성된 언어 설정 정보를 반환합니다.
    """,
    response_description="생성된 언어 설정 정보를 반환합니다."
)
async def create_language_config(
    language_config: LanguageConfigCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """언어 설정 생성"""
    # 중복 언어 코드 체크
    existing = db.query(CommonLanguageConfig).filter(
        CommonLanguageConfig.lang_cd == language_config.lang_cd,
        CommonLanguageConfig.del_yn == False
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 언어 코드입니다."
        )

    # 새로운 언어 설정 생성
    db_language_config = CommonLanguageConfig(
        lang_cd=language_config.lang_cd,
        lang_nm=language_config.lang_nm,
        display_order=language_config.display_order,
        use_yn=language_config.use_yn,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )

    db.add(db_language_config)
    db.commit()
    db.refresh(db_language_config)

    return db_language_config


@router.get(
    "/{language_config_id}",
    response_model=LanguageConfigResponse,
    summary="언어 설정 상세 조회",
    description="""
    특정 언어 설정의 상세 정보를 조회합니다.

    **경로 파라미터:**
    - `language_config_id`: 조회할 언어 설정의 고유 ID

    **에러:**
    - 404: 언어 설정을 찾을 수 없음

    **응답:**
    - 언어 설정의 상세 정보를 반환합니다.
    """,
    response_description="언어 설정의 상세 정보를 반환합니다."
)
async def get_language_config(
    language_config_id: int = Path(..., description="언어 설정 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """언어 설정 상세 조회"""
    language_config = db.query(CommonLanguageConfig).filter(
        CommonLanguageConfig.common_language_config_sn == language_config_id,
        CommonLanguageConfig.del_yn == False
    ).first()

    if not language_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="언어 설정을 찾을 수 없습니다."
        )

    return language_config


@router.put(
    "/{language_config_id}",
    response_model=LanguageConfigResponse,
    summary="언어 설정 수정",
    description="""
    언어 설정의 정보를 수정합니다.

    **경로 파라미터:**
    - `language_config_id`: 수정할 언어 설정의 고유 ID

    **요청 본문:**
    - 수정할 필드만 포함하면 됩니다 (부분 업데이트 지원)
    - 수정 가능한 필드: `lang_nm` (언어 이름), `display_order` (표시 순서), `use_yn` (사용 여부)

    **주의:** 언어 코드(lang_cd)는 수정할 수 없습니다.

    **에러:**
    - 404: 언어 설정을 찾을 수 없음

    **응답:**
    - 수정된 언어 설정 정보를 반환합니다.
    """,
    response_description="수정된 언어 설정 정보를 반환합니다."
)
async def update_language_config(
    language_config_id: int = Path(..., description="언어 설정 고유 ID"),
    language_config_update: LanguageConfigUpdate = ...,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """언어 설정 수정"""
    # 기존 언어 설정 조회
    db_language_config = db.query(CommonLanguageConfig).filter(
        CommonLanguageConfig.common_language_config_sn == language_config_id,
        CommonLanguageConfig.del_yn == False
    ).first()

    if not db_language_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="언어 설정을 찾을 수 없습니다."
        )

    # 업데이트할 필드들만 업데이트
    update_data = language_config_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_language_config, field, value)

    # 감사 필드 업데이트
    db_language_config.upd_by = current_user.user_id
    db_language_config.upd_by_nm = current_user.username

    db.commit()
    db.refresh(db_language_config)

    return db_language_config


@router.delete(
    "/{language_config_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="언어 설정 삭제",
    description="""
    언어 설정을 소프트 삭제합니다.

    **경로 파라미터:**
    - `language_config_id`: 삭제할 언어 설정의 고유 ID

    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 설정은 조회되지 않습니다.

    **에러:**
    - 404: 언어 설정을 찾을 수 없음

    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_language_config(
    language_config_id: int = Path(..., description="언어 설정 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """언어 설정 삭제 (소프트 삭제)"""
    # 기존 언어 설정 조회
    db_language_config = db.query(CommonLanguageConfig).filter(
        CommonLanguageConfig.common_language_config_sn == language_config_id,
        CommonLanguageConfig.del_yn == False
    ).first()

    if not db_language_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="언어 설정을 찾을 수 없습니다."
        )

    # 소프트 삭제
    db_language_config.del_yn = True
    db_language_config.del_dt = datetime.utcnow()
    db_language_config.del_by = current_user.user_id
    db_language_config.del_by_nm = current_user.username

    db.commit()

    return None
