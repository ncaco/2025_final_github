"""애플리케이션 설정"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 애플리케이션 정보
    app_name: str = Field(default="2026 Challenge API", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=True, alias="DEBUG")
    
    # 서버 설정
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    # 데이터베이스 설정
    database_url: str = Field(
        default="postgresql://postgres:password@localhost:5432/common_db",
        alias="DATABASE_URL"
    )
    
    # 보안 설정
    secret_key: str = Field(
        default="your-secret-key-change-this-in-production",
        alias="SECRET_KEY"
    )
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_days: int = Field(
        default=7,
        alias="REFRESH_TOKEN_EXPIRE_DAYS"
    )
    
    # CORS 설정
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        alias="CORS_ORIGINS"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

