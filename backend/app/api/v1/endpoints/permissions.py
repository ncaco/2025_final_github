"""권한 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.permission import CommonPermission
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.permission import PermissionCreate, PermissionUpdate, PermissionResponse
import uuid

router = APIRouter()


@router.post(
    "",
    response_model=PermissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="권한 생성",
    description="""
    새로운 권한을 생성합니다.
    
    **요청 본문:**
    - `permission_cd`: 권한 코드 (필수, 예: "USER_CREATE", "FILE_DELETE")
    - `permission_nm`: 권한 이름 (필수)
    - `dsc`: 권한 설명 (선택)
    - `rsrc`: 리소스 타입 (필수, 예: "USER", "FILE", "ADMIN")
    - `act`: 액션 타입 (필수, 예: "CREATE", "READ", "UPDATE", "DELETE")
    - `actv_yn`: 활성 상태 (기본값: true)
    
    **검증:**
    - 권한 코드 중복 체크를 수행합니다.
    - 권한 ID는 자동으로 생성됩니다 (형식: `PERM_XXXXXXXX`)
    
    **에러:**
    - 400: 이미 존재하는 권한 코드
    
    **응답:**
    - 생성된 권한 정보를 반환합니다.
    """,
    response_description="생성된 권한 정보를 반환합니다."
)
async def create_permission(
    permission_data: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 생성"""
    # 중복 체크
    existing_permission = db.query(CommonPermission).filter(
        CommonPermission.permission_cd == permission_data.permission_cd
    ).first()
    
    if existing_permission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 권한 코드입니다"
        )
    
    permission_id = f"PERM_{uuid.uuid4().hex[:8].upper()}"
    new_permission = CommonPermission(
        permission_id=permission_id,
        permission_cd=permission_data.permission_cd,
        permission_nm=permission_data.permission_nm,
        dsc=permission_data.dsc,
        rsrc=permission_data.rsrc,
        act=permission_data.act,
        actv_yn=permission_data.actv_yn,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)
    
    return new_permission


@router.get(
    "",
    response_model=List[PermissionResponse],
    summary="권한 목록 조회",
    description="""
    삭제되지 않은 권한 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `rsrc`: 리소스 타입 필터 (선택, 예: "USER", "FILE")
    - `act`: 액션 타입 필터 (선택, 예: "CREATE", "DELETE")
    - `actv_yn`: 활성 상태 필터 (true/false, 선택)
    
    **응답:**
    - 권한 목록을 배열로 반환합니다.
    - 삭제된 권한은 제외됩니다.
    """,
    response_description="권한 목록을 배열로 반환합니다."
)
async def get_permissions(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    rsrc: Optional[str] = Query(None, description="리소스 타입 필터 (예: USER, FILE)"),
    act: Optional[str] = Query(None, description="액션 타입 필터 (예: CREATE, DELETE)"),
    actv_yn: Optional[bool] = Query(None, description="활성 상태 필터 (true/false)"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 목록 조회"""
    query = db.query(CommonPermission).filter(CommonPermission.del_yn == False)
    
    if rsrc:
        query = query.filter(CommonPermission.rsrc == rsrc)
    if act:
        query = query.filter(CommonPermission.act == act)
    if actv_yn is not None:
        query = query.filter(CommonPermission.actv_yn == actv_yn)
    
    permissions = query.offset(skip).limit(limit).all()
    return permissions


@router.get(
    "/{permission_id}",
    response_model=PermissionResponse,
    summary="권한 상세 조회",
    description="""
    특정 권한의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `permission_id`: 조회할 권한의 고유 ID
    
    **에러:**
    - 404: 권한을 찾을 수 없음
    
    **응답:**
    - 권한의 상세 정보를 반환합니다.
    """,
    response_description="권한의 상세 정보를 반환합니다."
)
async def get_permission(
    permission_id: str = Path(..., description="권한 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 상세 조회"""
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    return permission


@router.put(
    "/{permission_id}",
    response_model=PermissionResponse,
    summary="권한 수정",
    description="""
    권한의 정보를 수정합니다.
    
    **경로 파라미터:**
    - `permission_id`: 수정할 권한의 고유 ID
    
    **요청 본문:**
    - 수정할 필드만 포함하면 됩니다 (부분 업데이트 지원)
    - 수정 가능한 필드: `permission_cd`, `permission_nm`, `dsc`, `rsrc`, `act`, `actv_yn`
    
    **에러:**
    - 404: 권한을 찾을 수 없음
    
    **응답:**
    - 수정된 권한 정보를 반환합니다.
    """,
    response_description="수정된 권한 정보를 반환합니다."
)
async def update_permission(
    permission_id: str = Path(..., description="권한 고유 ID"),
    permission_data: PermissionUpdate = ...,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 수정"""
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    update_data = permission_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(permission, field, value)
    
    permission.upd_by = current_user.user_id
    permission.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(permission)
    
    return permission


@router.delete(
    "/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="권한 삭제",
    description="""
    권한을 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `permission_id`: 삭제할 권한의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 권한은 조회되지 않습니다.
    
    **주의사항:**
    - 권한을 삭제하면 관련된 역할-권한 매핑에 영향을 줄 수 있습니다.
    
    **에러:**
    - 404: 권한을 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_permission(
    permission_id: str = Path(..., description="권한 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """권한 삭제 (소프트 삭제)"""
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    from datetime import datetime
    permission.del_yn = True
    permission.del_dt = datetime.utcnow()
    permission.del_by = current_user.user_id
    permission.del_by_nm = current_user.username
    
    db.commit()
    
    return None

