"""파일 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.file import CommonFile
from app.models.user import CommonUser
from app.dependencies import get_current_active_user
from app.schemas.file import FileCreate, FileUpdate, FileResponse
import uuid

router = APIRouter()


@router.post("", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def create_file(
    file_data: FileCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """파일 메타데이터 생성"""
    # 사용자 존재 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == file_data.user_id,
        CommonUser.del_yn == False
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    file_id = f"FILE_{uuid.uuid4().hex[:8].upper()}"
    new_file = CommonFile(
        file_id=file_id,
        user_id=file_data.user_id,
        file_nm=file_data.file_nm,
        file_path=file_data.file_path,
        file_sz=file_data.file_sz,
        mime_typ=file_data.mime_typ,
        file_ext=file_data.file_ext,
        stg_typ=file_data.stg_typ,
        pub_yn=file_data.pub_yn,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    return new_file


@router.get("", response_model=List[FileResponse])
async def get_files(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[str] = Query(None, description="사용자 ID 필터"),
    file_ext: Optional[str] = Query(None, description="파일 확장자 필터"),
    mime_typ: Optional[str] = Query(None, description="MIME 타입 필터"),
    stg_typ: Optional[str] = Query(None, description="저장소 타입 필터"),
    pub_yn: Optional[bool] = Query(None, description="공개 여부 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """파일 목록 조회"""
    query = db.query(CommonFile).filter(CommonFile.del_yn == False)
    
    if user_id:
        query = query.filter(CommonFile.user_id == user_id)
    if file_ext:
        query = query.filter(CommonFile.file_ext == file_ext)
    if mime_typ:
        query = query.filter(CommonFile.mime_typ == mime_typ)
    if stg_typ:
        query = query.filter(CommonFile.stg_typ == stg_typ)
    if pub_yn is not None:
        query = query.filter(CommonFile.pub_yn == pub_yn)
    
    files = query.order_by(CommonFile.crt_dt.desc()).offset(skip).limit(limit).all()
    return files


@router.get("/{file_id}", response_model=FileResponse)
async def get_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """파일 상세 조회"""
    file = db.query(CommonFile).filter(
        CommonFile.file_id == file_id,
        CommonFile.del_yn == False
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="파일을 찾을 수 없습니다"
        )
    
    # 공개 파일이 아니고 본인 파일이 아닌 경우 접근 제한
    if not file.pub_yn and file.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="파일 접근 권한이 없습니다"
        )
    
    return file


@router.put("/{file_id}", response_model=FileResponse)
async def update_file(
    file_id: str,
    file_data: FileUpdate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """파일 메타데이터 수정"""
    file = db.query(CommonFile).filter(
        CommonFile.file_id == file_id,
        CommonFile.del_yn == False
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="파일을 찾을 수 없습니다"
        )
    
    # 본인 파일만 수정 가능
    if file.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="파일 수정 권한이 없습니다"
        )
    
    update_data = file_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(file, field, value)
    
    file.upd_by = current_user.user_id
    file.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(file)
    
    return file


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """파일 삭제 (소프트 삭제)"""
    file = db.query(CommonFile).filter(
        CommonFile.file_id == file_id,
        CommonFile.del_yn == False
    ).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="파일을 찾을 수 없습니다"
        )
    
    # 본인 파일만 삭제 가능
    if file.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="파일 삭제 권한이 없습니다"
        )
    
    from datetime import datetime
    file.del_yn = True
    file.del_dt = datetime.utcnow()
    file.del_by = current_user.user_id
    file.del_by_nm = current_user.username
    
    db.commit()
    
    return None

