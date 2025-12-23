"""역할 관련 엔드포인트"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.role import CommonRole
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.role import RoleCreate, RoleUpdate, RoleResponse
import uuid

router = APIRouter()


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="역할 생성",
    description="""
    새로운 역할을 생성합니다.
    
    **요청 본문:**
    - `role_cd`: 역할 코드 (필수, 예: "ADMIN", "USER", "MODERATOR")
    - `role_nm`: 역할 이름 (필수)
    - `dsc`: 역할 설명 (선택)
    - `actv_yn`: 활성 상태 (기본값: true)
    
    **검증:**
    - 역할 코드 중복 체크를 수행합니다.
    - 역할 ID는 자동으로 생성됩니다 (형식: `ROLE_XXXXXXXX`)
    
    **에러:**
    - 400: 이미 존재하는 역할 코드
    
    **응답:**
    - 생성된 역할 정보를 반환합니다.
    """,
    response_description="생성된 역할 정보를 반환합니다."
)
async def create_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 생성"""
    # 중복 체크
    existing_role = db.query(CommonRole).filter(
        (CommonRole.role_cd == role_data.role_cd) |
        (CommonRole.role_id == f"ROLE_{role_data.role_cd}")
    ).first()
    
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 역할 코드입니다"
        )
    
    role_id = f"ROLE_{uuid.uuid4().hex[:8].upper()}"
    new_role = CommonRole(
        role_id=role_id,
        role_cd=role_data.role_cd,
        role_nm=role_data.role_nm,
        dsc=role_data.dsc,
        actv_yn=role_data.actv_yn,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    
    return new_role


@router.get(
    "",
    response_model=List[RoleResponse],
    summary="역할 목록 조회",
    description="""
    삭제되지 않은 역할 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `actv_yn`: 활성 상태 필터 (true/false, 선택)
    
    **응답:**
    - 역할 목록을 배열로 반환합니다.
    - 삭제된 역할은 제외됩니다.
    """,
    response_description="역할 목록을 배열로 반환합니다."
)
async def get_roles(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    actv_yn: bool = Query(None, description="활성 상태 필터 (true/false)"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 목록 조회"""
    query = db.query(CommonRole).filter(CommonRole.del_yn == False)
    
    if actv_yn is not None:
        query = query.filter(CommonRole.actv_yn == actv_yn)
    
    roles = query.offset(skip).limit(limit).all()
    return roles


@router.get(
    "/{role_id}",
    response_model=RoleResponse,
    summary="역할 상세 조회",
    description="""
    특정 역할의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `role_id`: 조회할 역할의 고유 ID
    
    **에러:**
    - 404: 역할을 찾을 수 없음
    
    **응답:**
    - 역할의 상세 정보를 반환합니다.
    """,
    response_description="역할의 상세 정보를 반환합니다."
)
async def get_role(
    role_id: str = Path(..., description="역할 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 상세 조회"""
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    return role


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
    summary="역할 수정",
    description="""
    역할의 정보를 수정합니다.
    
    **경로 파라미터:**
    - `role_id`: 수정할 역할의 고유 ID
    
    **요청 본문:**
    - 수정할 필드만 포함하면 됩니다 (부분 업데이트 지원)
    - 수정 가능한 필드: `role_cd`, `role_nm`, `dsc`, `actv_yn`
    
    **에러:**
    - 404: 역할을 찾을 수 없음
    
    **응답:**
    - 수정된 역할 정보를 반환합니다.
    """,
    response_description="수정된 역할 정보를 반환합니다."
)
async def update_role(
    role_id: str,
    role_data: RoleUpdate = ...,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 수정"""
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    update_data = role_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(role, field, value)
    
    role.upd_by = current_user.user_id
    role.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(role)
    
    return role


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="역할 삭제",
    description="""
    역할을 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `role_id`: 삭제할 역할의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 역할은 조회되지 않습니다.
    
    **주의사항:**
    - 역할을 삭제하면 관련된 역할-권한 매핑과 사용자-역할 매핑에 영향을 줄 수 있습니다.
    
    **에러:**
    - 404: 역할을 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_role(
    role_id: str = Path(..., description="역할 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할 삭제 (소프트 삭제)"""
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    from datetime import datetime
    role.del_yn = True
    role.del_dt = datetime.utcnow()
    role.del_by = current_user.user_id
    role.del_by_nm = current_user.username
    
    db.commit()
    
    return None
