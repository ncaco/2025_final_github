"""애플리케이션 설정"""
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
import json


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
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """CORS origins 파싱"""
        if isinstance(v, str):
            # JSON 문자열인 경우
            if v.startswith('['):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # 쉼표로 구분된 문자열인 경우
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v if isinstance(v, list) else ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

# 디버그 모드에서 CORS origins 확인
if settings.debug:
    print(f"CORS Origins: {settings.cors_origins}")

