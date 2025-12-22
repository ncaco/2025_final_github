"""FastAPI 애플리케이션 진입점"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

# FastAPI 애플리케이션 생성
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="2026 Challenge Project Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "2026 Challenge Project Backend API",
        "version": settings.app_version,
        "docs": "/docs"
    }

