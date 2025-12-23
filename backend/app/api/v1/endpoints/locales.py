"""다국어 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.locale import CommonLocale
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.locale import LocaleCreate, LocaleUpdate, LocaleResponse
import uuid

router = APIRouter()


@router.post("", response_model=LocaleResponse, status_code=status.HTTP_201_CREATED)
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


@router.get("", response_model=List[LocaleResponse])
async def get_locales(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    lang_cd: Optional[str] = Query(None, description="언어 코드 필터"),
    rsrc_typ: Optional[str] = Query(None, description="리소스 타입 필터"),
    rsrc_key: Optional[str] = Query(None, description="리소스 키 필터"),
    use_yn: Optional[bool] = Query(None, description="사용 여부 필터"),
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


@router.get("/{locale_id}", response_model=LocaleResponse)
async def get_locale(
    locale_id: str,
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


@router.put("/{locale_id}", response_model=LocaleResponse)
async def update_locale(
    locale_id: str,
    locale_data: LocaleUpdate,
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


@router.delete("/{locale_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_locale(
    locale_id: str,
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

