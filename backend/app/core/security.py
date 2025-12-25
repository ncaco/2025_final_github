"""보안 관련 유틸리티"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
import hashlib
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# bcrypt는 최대 72바이트까지만 처리 가능
BCRYPT_MAX_PASSWORD_LENGTH = 72


def _truncate_password(password: str, max_bytes: int = BCRYPT_MAX_PASSWORD_LENGTH) -> bytes:
    """비밀번호를 지정된 바이트 길이로 자르기"""
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > max_bytes:
        logger.warning(f"비밀번호가 {max_bytes}바이트를 초과하여 잘렸습니다. (원본 길이: {len(password_bytes)}바이트)")
        return password_bytes[:max_bytes]
    return password_bytes


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증
    
    bcrypt를 직접 사용하여 비밀번호를 검증합니다.
    """
    try:
        # bcrypt는 72바이트 제한이 있으므로 초과 시 자동으로 자름
        password_bytes = _truncate_password(plain_password)
        
        # 해시된 비밀번호를 bytes로 변환
        if isinstance(hashed_password, str):
            hashed_bytes = hashed_password.encode('utf-8')
        else:
            hashed_bytes = hashed_password
        
        # bcrypt로 검증
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except ValueError as e:
        logger.error(f"비밀번호 검증 중 ValueError 발생: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"비밀번호 검증 중 예상치 못한 오류 발생: {type(e).__name__}: {str(e)}")
        return False


def get_password_hash(password: str) -> str:
    """비밀번호 해싱
    
    bcrypt를 직접 사용하여 비밀번호를 해싱합니다.
    
    주의: bcrypt는 최대 72바이트까지만 처리 가능합니다.
    72바이트를 초과하는 비밀번호는 자동으로 잘립니다.
    """
    try:
        # bcrypt는 72바이트 제한이 있으므로 초과 시 자동으로 자름
        password_bytes = _truncate_password(password)
        
        # 솔트 생성 및 해싱
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        
        # 문자열로 반환
        return hashed.decode('utf-8')
    except ValueError as e:
        logger.error(f"비밀번호 해싱 중 ValueError 발생: {str(e)}")
        raise ValueError("비밀번호 해싱에 실패했습니다. 비밀번호가 너무 깁니다.") from e
    except Exception as e:
        logger.error(f"비밀번호 해싱 중 예상치 못한 오류 발생: {type(e).__name__}: {str(e)}")
        raise ValueError(f"비밀번호 해싱에 실패했습니다: {str(e)}") from e


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """액세스 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """리프레시 토큰 생성"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """토큰 디코딩"""
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        return None


def hash_token(token: str) -> str:
    """리프레시 토큰 해싱
    
    JWT 토큰은 길이가 길 수 있으므로 SHA256으로 먼저 해시한 후
    bcrypt를 적용하여 저장합니다.
    
    Args:
        token: 리프레시 토큰 문자열
        
    Returns:
        해시된 토큰 문자열
    """
    try:
        # JWT 토큰은 길 수 있으므로 SHA256으로 먼저 해시
        token_bytes = token.encode('utf-8')
        sha256_hash = hashlib.sha256(token_bytes).digest()
        
        # SHA256 해시 결과(32바이트)를 bcrypt로 해싱
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(sha256_hash, salt)
        
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"토큰 해싱 중 오류 발생: {type(e).__name__}: {str(e)}")
        raise ValueError(f"토큰 해싱에 실패했습니다: {str(e)}") from e


def verify_token_hash(token: str, token_hash: str) -> bool:
    """리프레시 토큰 해시 검증
    
    Args:
        token: 원본 리프레시 토큰 문자열
        token_hash: 저장된 토큰 해시값
        
    Returns:
        검증 성공 여부
    """
    try:
        # 원본 토큰을 SHA256으로 해시
        token_bytes = token.encode('utf-8')
        sha256_hash = hashlib.sha256(token_bytes).digest()
        
        # 해시된 토큰을 bytes로 변환
        if isinstance(token_hash, str):
            hashed_bytes = token_hash.encode('utf-8')
        else:
            hashed_bytes = token_hash
        
        # bcrypt로 검증
        return bcrypt.checkpw(sha256_hash, hashed_bytes)
    except Exception as e:
        logger.error(f"토큰 해시 검증 중 오류 발생: {type(e).__name__}: {str(e)}")
        return False

