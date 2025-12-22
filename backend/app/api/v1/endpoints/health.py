"""헬스 체크 엔드포인트"""
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """헬스 체크 응답"""
    status: str
    message: str


@router.get("", response_model=HealthResponse)
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "ok",
        "message": "Server is running"
    }

