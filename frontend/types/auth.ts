/**
 * 인증 관련 타입 정의
 */

/**
 * 토큰 응답
 */
export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * 토큰 데이터
 */
export interface TokenData {
  user_id?: string;
  username?: string;
}

/**
 * 로그인 요청
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 회원가입 요청
 */
export interface RegisterRequest {
  eml: string;
  username: string;
  password: string;
  nm?: string;
  nickname?: string;
  telno?: string;
}

/**
 * 토큰 갱신 요청
 */
export interface RefreshTokenRequest {
  refresh_token: string;
}

