"""역할-권한 매핑 관련 엔드포인트"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.role_permission import CommonRolePermission
from app.models.role import CommonRole
from app.models.permission import CommonPermission
from app.dependencies import get_current_active_user
from app.models.user import CommonUser
from app.schemas.role_permission import RolePermissionCreate, RolePermissionResponse
import uuid

router = APIRouter()


@router.post(
    "",
    response_model=RolePermissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="역할-권한 매핑 생성",
    description="""
    역할에 권한을 할당합니다.
    
    **요청 본문:**
    - `role_id`: 역할 고유 ID (필수)
    - `permission_id`: 권한 고유 ID (필수)
    
    **검증:**
    - 역할과 권한의 존재 여부를 확인합니다.
    - 중복 매핑을 방지합니다 (동일한 역할-권한 조합은 한 번만 생성 가능).
    - 매핑 ID는 자동으로 생성됩니다 (형식: `RP_XXXXXXXX`)
    
    **에러:**
    - 400: 이미 존재하는 역할-권한 매핑
    - 404: 역할 또는 권한을 찾을 수 없음
    
    **응답:**
    - 생성된 역할-권한 매핑 정보를 반환합니다.
    """,
    response_description="생성된 역할-권한 매핑 정보를 반환합니다."
)
async def create_role_permission(
    role_permission_data: RolePermissionCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 생성"""
    # 역할 존재 확인
    role = db.query(CommonRole).filter(
        CommonRole.role_id == role_permission_data.role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    # 권한 존재 확인
    permission = db.query(CommonPermission).filter(
        CommonPermission.permission_id == role_permission_data.permission_id,
        CommonPermission.del_yn == False
    ).first()
    
    if not permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권한을 찾을 수 없습니다"
        )
    
    # 중복 체크
    existing = db.query(CommonRolePermission).filter(
        CommonRolePermission.role_id == role_permission_data.role_id,
        CommonRolePermission.permission_id == role_permission_data.permission_id,
        CommonRolePermission.del_yn == False
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 역할-권한 매핑입니다"
        )
    
    role_permission_id = f"RP_{uuid.uuid4().hex[:8].upper()}"
    new_role_permission = CommonRolePermission(
        role_permission_id=role_permission_id,
        role_id=role_permission_data.role_id,
        permission_id=role_permission_data.permission_id,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_role_permission)
    db.commit()
    db.refresh(new_role_permission)
    
    return new_role_permission


@router.get(
    "",
    response_model=List[RolePermissionResponse],
    summary="역할-권한 매핑 목록 조회",
    description="""
    삭제되지 않은 역할-권한 매핑 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `role_id`: 역할 ID 필터 (선택, 특정 역할에 할당된 권한만 조회)
    - `permission_id`: 권한 ID 필터 (선택, 특정 권한이 할당된 역할만 조회)
    
    **응답:**
    - 역할-권한 매핑 목록을 배열로 반환합니다.
    - 삭제된 매핑은 제외됩니다.
    """,
    response_description="역할-권한 매핑 목록을 배열로 반환합니다."
)
async def get_role_permissions(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    role_id: str = Query(None, description="역할 ID 필터"),
    permission_id: str = Query(None, description="권한 ID 필터"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 목록 조회"""
    query = db.query(CommonRolePermission).filter(CommonRolePermission.del_yn == False)
    
    if role_id:
        query = query.filter(CommonRolePermission.role_id == role_id)
    if permission_id:
        query = query.filter(CommonRolePermission.permission_id == permission_id)
    
    role_permissions = query.offset(skip).limit(limit).all()
    return role_permissions


@router.get(
    "/{role_permission_id}",
    response_model=RolePermissionResponse,
    summary="역할-권한 매핑 상세 조회",
    description="""
    특정 역할-권한 매핑의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `role_permission_id`: 조회할 매핑의 고유 ID
    
    **에러:**
    - 404: 역할-권한 매핑을 찾을 수 없음
    
    **응답:**
    - 역할-권한 매핑의 상세 정보를 반환합니다.
    """,
    response_description="역할-권한 매핑의 상세 정보를 반환합니다."
)
async def get_role_permission(
    role_permission_id: str = Path(..., description="역할-권한 매핑 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 상세 조회"""
    role_permission = db.query(CommonRolePermission).filter(
        CommonRolePermission.role_permission_id == role_permission_id,
        CommonRolePermission.del_yn == False
    ).first()
    
    if not role_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할-권한 매핑을 찾을 수 없습니다"
        )
    
    return role_permission


@router.delete(
    "/{role_permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="역할-권한 매핑 삭제",
    description="""
    역할-권한 매핑을 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `role_permission_id`: 삭제할 매핑의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 매핑은 조회되지 않습니다.
    
    **주의사항:**
    - 매핑을 삭제하면 해당 역할은 더 이상 해당 권한을 가지지 않습니다.
    
    **에러:**
    - 404: 역할-권한 매핑을 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_role_permission(
    role_permission_id: str = Path(..., description="역할-권한 매핑 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """역할-권한 매핑 삭제 (소프트 삭제)"""
    role_permission = db.query(CommonRolePermission).filter(
        CommonRolePermission.role_permission_id == role_permission_id,
        CommonRolePermission.del_yn == False
    ).first()
    
    if not role_permission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할-권한 매핑을 찾을 수 없습니다"
        )
    
    from datetime import datetime
    role_permission.del_yn = True
    role_permission.del_dt = datetime.utcnow()
    role_permission.del_by = current_user.user_id
    role_permission.del_by_nm = current_user.username
    
    db.commit()
    
    return None

