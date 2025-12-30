"""인증 관련 엔드포인트"""
from datetime import datetime, timedelta
from typing import Annotated, Optional
import re
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import CommonUser
from app.models.refresh_token import CommonRefreshToken
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_token,
    verify_token_hash,
)
from app.core.config import settings
from app.schemas.auth import Token, LogoutRequest
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.dependencies import get_current_user
import uuid

router = APIRouter()


def get_client_ip(request: Request) -> str:
    """클라이언트 IP 주소 추출"""
    # X-Forwarded-For 헤더 확인 (프록시/로드밸런서 뒤에 있는 경우)
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        # 여러 IP가 있을 수 있으므로 첫 번째 IP 사용
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        # 직접 연결인 경우
        ip = request.client.host if request.client else "unknown"

    # IPv4 주소 검증 및 정리
    ip = ip.split(":")[0] if ":" in ip else ip  # IPv6에서 IPv4 부분만 추출
    return ip


def parse_user_agent(user_agent: str) -> str:
    """User-Agent에서 디바이스 정보 파싱"""
    if not user_agent:
        return "unknown"

    # 브라우저 정보 추출
    browsers = {
        'Chrome': r'Chrome/([\d.]+)',
        'Firefox': r'Firefox/([\d.]+)',
        'Safari': r'Safari/([\d.]+)',
        'Edge': r'Edge/([\d.]+)',
        'Opera': r'Opera/([\d.]+)',
        'IE': r'MSIE ([\d.]+)|Trident',
    }

    # OS 정보 추출
    os_patterns = {
        'Windows': r'Windows NT ([\d.]+)',
        'macOS': r'Mac OS X ([\d._]+)',
        'Linux': r'Linux',
        'Android': r'Android ([\d.]+)',
        'iOS': r'iPhone|iPad|iPod.*OS ([\d_]+)',
    }

    device_info = []

    # 브라우저 정보
    for browser, pattern in browsers.items():
        match = re.search(pattern, user_agent, re.IGNORECASE)
        if match:
            version = match.group(1) if len(match.groups()) > 0 else ""
            device_info.append(f"{browser} {version}".strip())
            break

    # OS 정보
    for os_name, pattern in os_patterns.items():
        match = re.search(pattern, user_agent, re.IGNORECASE)
        if match:
            if os_name == 'iOS':
                version = match.group(1).replace('_', '.') if match.groups() else ""
                device_info.append(f"{os_name} {version}".strip())
            elif os_name in ['Windows', 'macOS', 'Android']:
                version = match.group(1).replace('_', '.') if match.groups() else ""
                device_info.append(f"{os_name} {version}".strip())
            else:
                device_info.append(os_name)
            break

    # 모바일 디바이스 확인
    if re.search(r'Mobile|iPhone|iPad|iPod|Android', user_agent, re.IGNORECASE):
        device_info.append("Mobile")
    else:
        device_info.append("Desktop")

    return " | ".join(device_info) if device_info else "unknown"


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="사용자 회원가입",
    description="""
    새로운 사용자를 등록합니다.
    
    **요청 본문:**
    - `eml`: 이메일 주소 (필수, 중복 불가)
    - `username`: 사용자명 (필수, 최소 3자, 중복 불가)
    - `password`: 비밀번호 (필수, 최소 8자)
    - `nm`: 이름 (선택)
    - `nickname`: 닉네임 (선택)
    - `telno`: 전화번호 (선택)
    
    **검증:**
    - 사용자명과 이메일 중복 체크를 수행합니다.
    - 비밀번호는 bcrypt로 해싱되어 저장됩니다.
    - 사용자 ID는 자동으로 생성됩니다 (형식: `USER_XXXXXXXX`)
    
    **에러:**
    - 400: 이미 존재하는 사용자명 또는 이메일
    
    **응답:**
    - 생성된 사용자 정보를 반환합니다 (비밀번호 제외)
    """,
    response_description="생성된 사용자 정보를 반환합니다."
)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """사용자 회원가입"""
    # 중복 체크
    existing_user = db.query(CommonUser).filter(
        (CommonUser.username == user_data.username) |
        (CommonUser.eml == user_data.eml)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 사용자명 또는 이메일입니다"
        )
    
    # 사용자 생성
    user_id = f"USER_{uuid.uuid4().hex[:8].upper()}"
    new_user = CommonUser(
        user_id=user_id,
        eml=user_data.eml,
        username=user_data.username,
        pwd_hash=get_password_hash(user_data.password),
        nm=user_data.nm,
        nickname=user_data.nickname,
        telno=user_data.telno,
        crt_by="SYSTEM",
        crt_by_nm="시스템"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post(
    "/login",
    response_model=Token,
    summary="사용자 로그인",
    description="""
    사용자 인증을 수행하고 액세스 토큰과 리프레시 토큰을 발급합니다.
    
    **요청 형식:**
    - `application/x-www-form-urlencoded` 형식으로 전송해야 합니다.
    - `username`: 사용자명 또는 이메일 주소
    - `password`: 비밀번호
    
    **인증 과정:**
    1. 사용자명 또는 이메일로 사용자 조회
    2. 비밀번호 검증 (bcrypt)
    3. 사용자 활성 상태 확인
    4. JWT 액세스 토큰 및 리프레시 토큰 생성
    5. 리프레시 토큰을 데이터베이스에 저장 (해시화)
    
    **토큰 정보:**
    - `access_token`: JWT 액세스 토큰 (기본 만료 시간: 30분)
    - `refresh_token`: 리프레시 토큰 (기본 만료 시간: 7일)
    - `token_type`: "bearer"
    
    **에러:**
    - 401: 사용자명 또는 비밀번호가 올바르지 않음
    - 400: 비활성화된 사용자 또는 삭제된 사용자
    
    **사용 예시:**
    ```
    curl -X POST "http://localhost:8000/api/v1/auth/login" \\
         -H "Content-Type: application/x-www-form-urlencoded" \\
         -d "username=user@example.com&password=yourpassword"
    ```
    """,
    response_description="액세스 토큰과 리프레시 토큰을 포함한 인증 정보를 반환합니다."
)
async def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """사용자 로그인"""
    # 사용자 조회 (username 또는 email로)
    user = db.query(CommonUser).filter(
        (CommonUser.username == form_data.username) |
        (CommonUser.eml == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.pwd_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자명 또는 비밀번호가 올바르지 않습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.actv_yn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화된 사용자입니다"
        )
    
    if user.del_yn:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="삭제된 사용자입니다"
        )
    
    # 토큰 생성
    access_token = create_access_token(data={"sub": user.user_id, "username": user.username})
    refresh_token = create_refresh_token(data={"sub": user.user_id})
    
    # 클라이언트 정보 추출
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")
    device_info = parse_user_agent(user_agent)

    # 리프레시 토큰 저장 (해시화)
    # 리프레시 토큰은 JWT이므로 전용 해시 함수 사용 (SHA256 + bcrypt)
    token_hash = hash_token(refresh_token)
    refresh_token_id = f"RT_{uuid.uuid4().hex[:8].upper()}"

    new_refresh_token = CommonRefreshToken(
        refresh_token_id=refresh_token_id,
        user_id=user.user_id,
        token_hash=token_hash,
        dvc_info=device_info,  # 디바이스 정보 저장
        ip_addr=client_ip,     # IP 주소 저장
        expr_dt=datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days),
        crt_by=user.user_id,
        crt_by_nm=user.username or user.user_id
    )
    
    db.add(new_refresh_token)
    db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post(
    "/refresh",
    response_model=Token,
    summary="액세스 토큰 갱신",
    description="""
    리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.
    
    **요청 본문:**
    - `refresh_token`: 유효한 리프레시 토큰 (JSON 형식: `{"refresh_token": "..."}`)
    
    **갱신 과정:**
    1. 리프레시 토큰 검증 (JWT 디코딩 및 타입 확인)
    2. 사용자 존재 및 활성 상태 확인
    3. 데이터베이스에 저장된 리프레시 토큰과 비교 (해시 검증)
    4. 토큰 만료 여부 확인
    5. 토큰 취소 여부 확인
    6. 새 액세스 토큰 생성 및 반환
    
    **주의사항:**
    - 리프레시 토큰은 만료되기 전까지 재사용 가능합니다.
    - 토큰 사용 시 `last_use_dt`가 업데이트됩니다.
    - 취소된 토큰(`rvk_yn=True`)은 사용할 수 없습니다.
    
    **에러:**
    - 401: 유효하지 않은 리프레시 토큰
    - 401: 사용자를 찾을 수 없음
    
    **응답:**
    - 새로운 액세스 토큰과 기존 리프레시 토큰을 반환합니다.
    """,
    response_description="새로운 액세스 토큰과 리프레시 토큰을 반환합니다."
)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """리프레시 토큰으로 액세스 토큰 갱신"""
    payload = decode_token(refresh_token)
    
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    # 사용자 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == user_id,
        CommonUser.del_yn == False,
        CommonUser.actv_yn == True
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 리프레시 토큰 확인 (해시로 저장된 토큰과 비교)
    # 저장된 모든 리프레시 토큰 확인
    stored_tokens = db.query(CommonRefreshToken).filter(
        CommonRefreshToken.user_id == user_id,
        CommonRefreshToken.rvk_yn == False,
        CommonRefreshToken.del_yn == False,
        CommonRefreshToken.expr_dt > datetime.utcnow()
    ).all()
    
    stored_token = None
    for token in stored_tokens:
        # 리프레시 토큰은 전용 검증 함수 사용 (SHA256 + bcrypt)
        if verify_token_hash(refresh_token, token.token_hash):
            stored_token = token
            break
    
    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다"
        )
    
    # 토큰 갱신
    stored_token.last_use_dt = datetime.utcnow()
    db.commit()
    
    # 새 액세스 토큰 생성
    access_token = create_access_token(data={"sub": user.user_id, "username": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="사용자 로그아웃",
    description="""
    사용자를 로그아웃하고 리프레시 토큰을 취소합니다.
    
    **요청:**
    - 인증 헤더에 액세스 토큰이 필요합니다.
    - 선택적으로 요청 본문에 `refresh_token`을 포함할 수 있습니다.
      - `refresh_token`이 제공되면 해당 토큰만 취소합니다.
      - 제공되지 않으면 해당 사용자의 모든 활성 리프레시 토큰을 취소합니다.
    
    **로그아웃 과정:**
    1. 현재 사용자 인증 확인
    2. 사용자의 리프레시 토큰 조회
    3. 리프레시 토큰 취소 (rvk_yn=True, rvk_dt=현재시간)
    
    **에러:**
    - 401: 인증되지 않은 사용자
    
    **응답:**
    - 성공 메시지 반환
    """,
    response_description="로그아웃 성공 메시지를 반환합니다."
)
async def logout(
    request: Request,
    logout_request: Optional[LogoutRequest] = Body(default=None),
    current_user: CommonUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자 로그아웃"""
    # 클라이언트 정보 추출 (로그아웃한 디바이스 정보)
    client_ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")
    logout_device_info = parse_user_agent(user_agent)

    # 리프레시 토큰이 제공된 경우 해당 토큰만 취소
    refresh_token = logout_request.refresh_token if logout_request else None
    if refresh_token:
        # 토큰 해시 생성
        token_hash = hash_token(refresh_token)
        
        # 해당 토큰 찾기
        stored_token = db.query(CommonRefreshToken).filter(
            CommonRefreshToken.user_id == current_user.user_id,
            CommonRefreshToken.token_hash == token_hash,
            CommonRefreshToken.rvk_yn == False,
            CommonRefreshToken.del_yn == False
        ).first()
        
        if stored_token:
            stored_token.rvk_yn = True
            stored_token.rvk_dt = datetime.utcnow()
            # TODO: 추후 rvk_ip_addr, rvk_dvc_info 필드 추가하여 취소 디바이스 정보 기록
            print(f"토큰 취소: 사용자={current_user.user_id}, 토큰ID={stored_token.refresh_token_id}, 취소IP={client_ip}, 취소디바이스={logout_device_info}")
    else:
        # 모든 활성 리프레시 토큰 취소
        active_tokens = db.query(CommonRefreshToken).filter(
            CommonRefreshToken.user_id == current_user.user_id,
            CommonRefreshToken.rvk_yn == False,
            CommonRefreshToken.del_yn == False,
            CommonRefreshToken.expr_dt > datetime.utcnow()
        ).all()

        print(f"전체 토큰 취소: 사용자={current_user.user_id}, 취소토큰수={len(active_tokens)}, 취소IP={client_ip}, 취소디바이스={logout_device_info}")
        for token in active_tokens:
            token.rvk_yn = True
            token.rvk_dt = datetime.utcnow()
            # TODO: 추후 rvk_ip_addr, rvk_dvc_info 필드 추가하여 취소 디바이스 정보 기록
    
    db.commit()
    
    return {"message": "로그아웃되었습니다"}

