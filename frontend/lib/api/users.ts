/**
 * 사용자 관련 API 함수
 */

import { get } from './client';
import type { User, UserDetailResponse } from '@/types/user';

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  return get<User>('/api/v1/users/me');
}

/**
 * 사용자 상세 정보 조회 (역할 포함)
 */
export async function getUserDetail(userId: string): Promise<UserDetailResponse> {
  return get<UserDetailResponse>(`/api/v1/users/${userId}`);
}

/**
 * 사용자 목록 조회
 */
export async function getUsers(params?: { skip?: number; limit?: number }): Promise<User[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const queryString = queryParams.toString();
  return get<User[]>(`/api/v1/users${queryString ? `?${queryString}` : ''}`);
}
