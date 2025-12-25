"""애플리케이션 설정"""
from typing import List, Union, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, ValidationError
import json
import logging
import sys

# 로거 설정
logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 애플리케이션 정보
    app_name: str = Field(alias="APP_NAME")
    app_version: str = Field(alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # 서버 설정
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    # 데이터베이스 설정 (필수)
    database_url: str = Field(alias="DATABASE_URL")
    
    # 보안 설정 (필수)
    secret_key: str = Field(alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30,
        alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_days: int = Field(
        default=7,
        alias="REFRESH_TOKEN_EXPIRE_DAYS"
    )
    
    # CORS 설정 (필수)
    cors_origins: List[str] = Field(alias="CORS_ORIGINS")
    
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
            origins = [origin.strip() for origin in v.split(',') if origin.strip()]
            if origins:
                return origins
        elif isinstance(v, list):
            return v
        
        # 값이 없거나 빈 경우 예외 발생
        raise ValueError("CORS_ORIGINS는 필수 설정값입니다. 환경 변수 또는 .env 파일에 설정해주세요.")
    
    @field_validator('database_url', mode='before')
    @classmethod
    def validate_database_url(cls, v: Optional[str]) -> str:
        """데이터베이스 URL 검증"""
        if not v or not v.strip():
            raise ValueError("DATABASE_URL은 필수 설정값입니다. 환경 변수 또는 .env 파일에 설정해주세요.")
        return v.strip()
    
    @field_validator('secret_key', mode='before')
    @classmethod
    def validate_secret_key(cls, v: Optional[str]) -> str:
        """시크릿 키 검증"""
        if not v or not v.strip():
            raise ValueError("SECRET_KEY는 필수 설정값입니다. 환경 변수 또는 .env 파일에 설정해주세요.")
        if len(v.strip()) < 32:
            logger.warning("SECRET_KEY가 너무 짧습니다. 최소 32자 이상을 권장합니다.")
        return v.strip()
    
    @field_validator('app_name', mode='before')
    @classmethod
    def validate_app_name(cls, v: Optional[str]) -> str:
        """애플리케이션 이름 검증"""
        if not v or not v.strip():
            raise ValueError("APP_NAME은 필수 설정값입니다. 환경 변수 또는 .env 파일에 설정해주세요.")
        return v.strip()
    
    @field_validator('app_version', mode='before')
    @classmethod
    def validate_app_version(cls, v: Optional[str]) -> str:
        """애플리케이션 버전 검증"""
        if not v or not v.strip():
            raise ValueError("APP_VERSION은 필수 설정값입니다. 환경 변수 또는 .env 파일에 설정해주세요.")
        return v.strip()
    
    class Config:
        env_file = [".env", "env.local"]  # .env 또는 env.local 파일 읽기
        case_sensitive = False


def load_settings() -> Settings:
    """설정 로드 및 검증"""
    try:
        settings = Settings()
        
        # 설정 로드 성공 로그
        logger.info(f"애플리케이션 설정 로드 완료: {settings.app_name} v{settings.app_version}")
        logger.info(f"데이터베이스: {settings.database_url.split('@')[1] if '@' in settings.database_url else '설정됨'}")
        logger.info(f"CORS Origins: {settings.cors_origins}")
        logger.info(f"디버그 모드: {settings.debug}")
        
        return settings
    except ValidationError as e:
        logger.error("=" * 80)
        logger.error("설정 로드 실패: 필수 환경 변수가 설정되지 않았습니다.")
        logger.error("=" * 80)
        logger.error("\n필수 환경 변수:")
        logger.error("  - DATABASE_URL: 데이터베이스 연결 URL")
        logger.error("  - SECRET_KEY: JWT 토큰 서명용 시크릿 키")
        logger.error("  - CORS_ORIGINS: CORS 허용 오리진 목록")
        logger.error("  - APP_NAME: 애플리케이션 이름")
        logger.error("  - APP_VERSION: 애플리케이션 버전")
        logger.error("\n설정 방법:")
        logger.error("  1. backend 디렉토리에 .env 또는 env.local 파일 생성")
        logger.error("  2. 환경 변수로 직접 설정")
        logger.error("\n상세 오류:")
        for error in e.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            message = error["msg"]
            logger.error(f"  - {field}: {message}")
        logger.error("=" * 80)
        sys.exit(1)
    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"설정 로드 중 예상치 못한 오류 발생: {type(e).__name__}")
        logger.error(f"오류 메시지: {str(e)}")
        logger.error("=" * 80)
        sys.exit(1)


# 설정 로드
settings = load_settings()

