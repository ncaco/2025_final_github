"""헬스 체크 엔드포인트"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """헬스 체크 응답"""
    status: str
    message: str


@router.get(
    "",
    response_model=HealthResponse,
    summary="헬스 체크",
    description="""
    서버의 상태를 확인합니다.
    
    **응답:**
    - 서버가 정상적으로 동작 중이면 `{"status": "ok", "message": "Server is running"}`를 반환합니다.
    - 이 엔드포인트는 인증이 필요하지 않습니다.
    
    **사용 예시:**
    - 로드 밸런서나 모니터링 시스템에서 서버 상태 확인용으로 사용할 수 있습니다.
    - Kubernetes liveness/readiness probe로 사용할 수 있습니다.
    """,
    response_description="서버 상태 정보를 반환합니다."
)
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "ok",
        "message": "Server is running"
    }

