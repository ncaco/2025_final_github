"""사용자-역할 매핑 관련 엔드포인트"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user_role import CommonUserRole
from app.models.user import CommonUser
from app.models.role import CommonRole
from app.dependencies import get_current_active_user
from app.schemas.user_role import UserRoleCreate, UserRoleUpdate, UserRoleResponse
import uuid

router = APIRouter()


@router.post(
    "",
    response_model=UserRoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="사용자-역할 매핑 생성",
    description="""
    사용자에게 역할을 할당합니다.
    
    **요청 본문:**
    - `user_id`: 사용자 고유 ID (필수)
    - `role_id`: 역할 고유 ID (필수)
    - `asgn_by`: 할당한 사용자 ID (선택, 기본값: 현재 사용자)
    - `asgn_dt`: 할당일시 (선택, 기본값: 현재 시간)
    - `expr_dt`: 만료일시 (선택, NULL이면 무기한)
    
    **검증:**
    - 사용자와 역할의 존재 여부를 확인합니다.
    - 중복 매핑을 방지합니다 (동일한 사용자-역할 조합은 한 번만 생성 가능).
    - 매핑 ID는 자동으로 생성됩니다 (형식: `UR_XXXXXXXX`)
    
    **에러:**
    - 400: 이미 존재하는 사용자-역할 매핑
    - 404: 사용자 또는 역할을 찾을 수 없음
    
    **응답:**
    - 생성된 사용자-역할 매핑 정보를 반환합니다.
    """,
    response_description="생성된 사용자-역할 매핑 정보를 반환합니다."
)
async def create_user_role(
    user_role_data: UserRoleCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 생성"""
    # 사용자 존재 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == user_role_data.user_id,
        CommonUser.del_yn == False
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 역할 존재 확인
    role = db.query(CommonRole).filter(
        CommonRole.role_id == user_role_data.role_id,
        CommonRole.del_yn == False
    ).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="역할을 찾을 수 없습니다"
        )
    
    # 중복 체크 (del_yn이 False이거나 use_yn이 True인 경우)
    existing = db.query(CommonUserRole).filter(
        CommonUserRole.user_id == user_role_data.user_id,
        CommonUserRole.role_id == user_role_data.role_id,
        CommonUserRole.del_yn == False
    ).first()

    if existing:
        if existing.use_yn:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 존재하는 사용자-역할 매핑입니다"
            )
        else:
            # use_yn이 False인 경우 재활성화
            existing.use_yn = True
            existing.upd_by = current_user.user_id
            existing.upd_by_nm = current_user.username
            db.commit()
            db.refresh(existing)
            return existing
    
    user_role_id = f"UR_{uuid.uuid4().hex[:8].upper()}"
    asgn_by = user_role_data.asgn_by or current_user.user_id
    asgn_dt = user_role_data.asgn_dt or datetime.utcnow()
    
    new_user_role = CommonUserRole(
        user_role_id=user_role_id,
        user_id=user_role_data.user_id,
        role_id=user_role_data.role_id,
        asgn_by=asgn_by,
        asgn_dt=asgn_dt,
        expr_dt=user_role_data.expr_dt,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.username
    )
    
    db.add(new_user_role)
    db.commit()
    db.refresh(new_user_role)
    
    return new_user_role


@router.get(
    "",
    response_model=List[UserRoleResponse],
    summary="사용자-역할 매핑 목록 조회",
    description="""
    삭제되지 않은 사용자-역할 매핑 목록을 페이지네이션으로 조회합니다.
    
    **쿼리 파라미터:**
    - `skip`: 건너뛸 레코드 수 (기본값: 0)
    - `limit`: 반환할 최대 레코드 수 (기본값: 100, 최대: 1000)
    - `user_id`: 사용자 ID 필터 (선택, 특정 사용자에게 할당된 역할만 조회)
    - `role_id`: 역할 ID 필터 (선택, 특정 역할이 할당된 사용자만 조회)
    - `use_yn`: 사용 여부 필터 (선택, true/false)
    
    **응답:**
    - 사용자-역할 매핑 목록을 배열로 반환합니다.
    - 삭제된 매핑은 제외됩니다.
    """,
    response_description="사용자-역할 매핑 목록을 배열로 반환합니다."
)
async def get_user_roles(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    user_id: str = Query(None, description="사용자 ID 필터"),
    role_id: str = Query(None, description="역할 ID 필터"),
    use_yn: bool = Query(None, description="사용 여부 필터 (true/false)"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 목록 조회"""
    query = db.query(CommonUserRole).filter(CommonUserRole.del_yn == False)
    
    if user_id:
        query = query.filter(CommonUserRole.user_id == user_id)
    if role_id:
        query = query.filter(CommonUserRole.role_id == role_id)
    if use_yn is not None:
        query = query.filter(CommonUserRole.use_yn == use_yn)
    
    user_roles = query.offset(skip).limit(limit).all()
    return user_roles


@router.get(
    "/me",
    response_model=List[UserRoleResponse],
    summary="현재 사용자의 역할 매핑 목록 조회",
    description="""
    현재 로그인된 사용자의 역할 매핑 목록을 조회합니다.
    
    **응답:**
    - 현재 사용자에게 할당된 역할 매핑 목록을 배열로 반환합니다.
    - 할당된 역할이 없으면 빈 리스트를 반환합니다.
    """,
    response_description="현재 사용자의 역할 매핑 목록을 배열로 반환합니다."
)
async def get_current_user_roles(
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """현재 사용자의 역할 매핑 목록 조회"""
    user_roles = db.query(CommonUserRole).filter(
        CommonUserRole.user_id == current_user.user_id,
        CommonUserRole.del_yn == False,
        CommonUserRole.use_yn == True
    ).all()
    return user_roles


@router.get(
    "/{user_role_id}",
    response_model=UserRoleResponse,
    summary="사용자-역할 매핑 상세 조회",
    description="""
    특정 사용자-역할 매핑의 상세 정보를 조회합니다.
    
    **경로 파라미터:**
    - `user_role_id`: 조회할 매핑의 고유 ID
    
    **에러:**
    - 404: 사용자-역할 매핑을 찾을 수 없음
    
    **응답:**
    - 사용자-역할 매핑의 상세 정보를 반환합니다.
    """,
    response_description="사용자-역할 매핑의 상세 정보를 반환합니다."
)
async def get_user_role(
    user_role_id: str = Path(..., description="사용자-역할 매핑 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 상세 조회"""
    user_role = db.query(CommonUserRole).filter(
        CommonUserRole.user_role_id == user_role_id,
        CommonUserRole.del_yn == False
    ).first()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자-역할 매핑을 찾을 수 없습니다"
        )
    
    return user_role


@router.put(
    "/{user_role_id}",
    response_model=UserRoleResponse,
    summary="사용자-역할 매핑 수정",
    description="""
    사용자-역할 매핑의 정보를 수정합니다.
    
    **경로 파라미터:**
    - `user_role_id`: 수정할 매핑의 고유 ID
    
    **요청 본문:**
    - 수정할 필드만 포함하면 됩니다 (부분 업데이트 지원)
    - 수정 가능한 필드: `expr_dt` (만료일시), `use_yn` (사용 여부)
    
    **에러:**
    - 404: 사용자-역할 매핑을 찾을 수 없음
    
    **응답:**
    - 수정된 사용자-역할 매핑 정보를 반환합니다.
    """,
    response_description="수정된 사용자-역할 매핑 정보를 반환합니다."
)
async def update_user_role(
    user_role_id: str = Path(..., description="사용자-역할 매핑 고유 ID"),
    user_role_data: UserRoleUpdate = ...,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 수정"""
    user_role = db.query(CommonUserRole).filter(
        CommonUserRole.user_role_id == user_role_id,
        CommonUserRole.del_yn == False
    ).first()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자-역할 매핑을 찾을 수 없습니다"
        )
    
    update_data = user_role_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user_role, field, value)
    
    user_role.upd_by = current_user.user_id
    user_role.upd_by_nm = current_user.username
    
    db.commit()
    db.refresh(user_role)
    
    return user_role


@router.delete(
    "/{user_role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="사용자-역할 매핑 삭제",
    description="""
    사용자-역할 매핑을 소프트 삭제합니다.
    
    **경로 파라미터:**
    - `user_role_id`: 삭제할 매핑의 고유 ID
    
    **소프트 삭제:**
    - 실제로 데이터베이스에서 삭제되지 않고 `del_yn` 플래그가 `True`로 설정됩니다.
    - 삭제 일시(`del_dt`)와 삭제자 정보가 기록됩니다.
    - 삭제된 매핑은 조회되지 않습니다.
    
    **주의사항:**
    - 매핑을 삭제하면 해당 사용자는 더 이상 해당 역할을 가지지 않습니다.
    
    **에러:**
    - 404: 사용자-역할 매핑을 찾을 수 없음
    
    **응답:**
    - 204 No Content: 성공적으로 삭제됨
    """,
    response_description="성공 시 응답 본문 없음 (204 No Content)"
)
async def delete_user_role(
    user_role_id: str = Path(..., description="사용자-역할 매핑 고유 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자-역할 매핑 삭제 (소프트 삭제)"""
    user_role = db.query(CommonUserRole).filter(
        CommonUserRole.user_role_id == user_role_id,
        CommonUserRole.del_yn == False
    ).first()
    
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자-역할 매핑을 찾을 수 없습니다"
        )
    
    user_role.del_yn = True
    user_role.del_dt = datetime.utcnow()
    user_role.del_by = current_user.user_id
    user_role.del_by_nm = current_user.username
    
    db.commit()
    
    return None

