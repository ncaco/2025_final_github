/**
 * 사용자 관련 API 함수
 */

import { get, put, del, post } from './client';
import type { User, UserDetailResponse, UserRoleAssignment, UserRoleResponse } from '@/types/user';

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

/**
 * 사용자 정보 수정
 */
export async function updateUser(
  userId: string,
  userData: Partial<User>
): Promise<User> {
  return put<User>(`/api/v1/users/${userId}`, userData);
}

/**
 * 사용자 삭제 (소프트 삭제)
 */
export async function deleteUser(userId: string): Promise<void> {
  return del<void>(`/api/v1/users/${userId}`);
}


/**
 * 사용자에게 역할 할당
 */
export async function assignUserRole(assignment: UserRoleAssignment): Promise<UserRoleResponse> {
  return post<UserRoleResponse>('/api/v1/users/roles', assignment);
}

/**
 * 사용자의 역할 제거
 */
export async function removeUserRole(userId: string, roleId: string): Promise<void> {
  return del<void>(`/api/v1/users/${userId}/roles/${roleId}`);
}

/**
 * 사용자의 역할 목록 조회
 */
export async function getUserRoles(userId: string): Promise<UserRoleResponse[]> {
  return get<UserRoleResponse[]>(`/api/v1/users/${userId}/roles`);
}
