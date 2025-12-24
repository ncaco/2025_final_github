/**
 * 사용자 관리 API 함수
 */

import { get, put, del, post } from './client';
import type { User, UserCreate, UserUpdate, UserDetailResponse } from '@/types/user';
import type { PaginatedResponse, PaginationParams } from '@/types/api';

/**
 * 현재 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User> {
  return get<User>('/api/v1/users/me');
}

/**
 * 사용자 목록 조회
 */
export async function getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams();
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append('page_size', params.page_size.toString());
  }
  const query = queryParams.toString();
  return get<PaginatedResponse<User>>(`/api/v1/users${query ? `?${query}` : ''}`);
}

/**
 * 사용자 상세 정보 조회
 */
export async function getUserById(userId: string): Promise<UserDetailResponse> {
  return get<UserDetailResponse>(`/api/v1/users/${userId}`);
}

/**
 * 현재 사용자 정보 수정
 */
export async function updateCurrentUser(data: UserUpdate): Promise<User> {
  return put<User>('/api/v1/users/me', data);
}

/**
 * 사용자 정보 수정 (관리자)
 */
export async function updateUser(userId: string, data: UserUpdate): Promise<User> {
  return put<User>(`/api/v1/users/${userId}`, data);
}

/**
 * 사용자 삭제 (관리자)
 */
export async function deleteUser(userId: string): Promise<void> {
  return del(`/api/v1/users/${userId}`);
}

