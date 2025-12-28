/**
 * 사용자-역할 매핑 관련 API 함수들
 */

import { get, post, del } from './client';
import type { UserRole, UserRoleCreate } from '@/types/user';

export async function getUserRoles(params?: {
  skip?: number;
  limit?: number;
  user_id?: string;
  role_id?: string;
}): Promise<UserRole[]>;
export async function getUserRoles(userId?: string): Promise<UserRole[]>;
export async function getUserRoles(paramsOrUserId?: any): Promise<UserRole[]> {
  if (typeof paramsOrUserId === 'string') {
    // userId가 직접 전달된 경우
    return get(`/api/v1/user-roles?user_id=${paramsOrUserId}&limit=1000`);
  } else {
    // 객체 형태의 파라미터가 전달된 경우
    const params = paramsOrUserId;
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.user_id) queryParams.append('user_id', params.user_id);
    if (params?.role_id) queryParams.append('role_id', params.role_id);

    const endpoint = queryParams.toString() ? `/api/v1/user-roles?${queryParams.toString()}` : '/api/v1/user-roles';
    return get(endpoint);
  }
}

export async function getCurrentUserRoles(): Promise<UserRole[]> {
  return get('/api/v1/user-roles/me');
}

export async function getUserRoleDetail(userRoleId: string): Promise<UserRole> {
  return get(`/api/v1/user-roles/${userRoleId}`);
}

export async function createUserRole(userRoleData: UserRoleCreate): Promise<UserRole> {
  return post('/api/v1/user-roles', userRoleData);
}

export async function deleteUserRole(userRoleId: string): Promise<void> {
  return del(`/api/v1/user-roles/${userRoleId}`);
}