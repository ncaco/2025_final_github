/**
 * 인증 관련 API 함수
 */

import { post } from './client';
import type { Token, LoginRequest, RegisterRequest, RefreshTokenRequest } from '@/types/auth';
import type { User } from '@/types/user';

/**
 * 회원가입
 */
export async function register(data: RegisterRequest): Promise<User> {
  return post<User>('/api/v1/auth/register', data, { skipAuth: true });
}

/**
 * 로그인
 * 백엔드가 form-urlencoded 형식을 요구하므로 별도 처리
 */
export async function login(data: LoginRequest): Promise<Token> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const formData = new URLSearchParams();
  formData.append('username', data.username);
  formData.append('password', data.password);

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || '로그인에 실패했습니다.');
  }

  return response.json();
}

/**
 * 로그아웃
 * 인증이 필요하므로 skipAuth를 false로 설정 (기본값)
 */
export async function logout(): Promise<void> {
  await post('/api/v1/auth/logout', {});
}

/**
 * 토큰 갱신
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<Token> {
  return post<Token>('/api/v1/auth/refresh', data, { skipAuth: true });
}

/**
 * 토큰 검증
 */
export async function verifyToken(): Promise<{ valid: boolean }> {
  return post<{ valid: boolean }>('/api/v1/auth/verify', {}, { skipAuth: true });
}

/**
 * 로그아웃 (API 호출)
 * 인증이 필요하므로 skipAuth를 false로 설정 (기본값)
 */
export async function logoutApi(): Promise<void> {
  try {
    await post('/api/v1/auth/logout', {});
  } catch (error) {
    // 로그아웃 실패해도 클라이언트에서는 토큰 삭제
    console.error('Logout API error:', error);
  }
}

