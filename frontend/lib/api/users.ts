/**
 * 사용자 관련 API 함수
 */

import { get, put, del, post } from './client';
import type { User, UserDetailResponse, Role, RoleCreate, RoleUpdate, RoleWithPermissions, Permission, UserRoleAssignment, UserRoleResponse } from '@/types/user';

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
 * 역할 목록 조회
 */
export async function getRoles(): Promise<RoleWithPermissions[]> {
  return get<RoleWithPermissions[]>('/api/v1/roles');
}

/**
 * 역할 상세 조회 (권한 포함)
 */
export async function getRoleDetail(roleId: string): Promise<RoleWithPermissions> {
  return get<RoleWithPermissions>(`/api/v1/roles/${roleId}`);
}

/**
 * 역할 생성
 */
export async function createRole(roleData: RoleCreate): Promise<Role> {
  return post<Role>('/api/v1/roles', roleData);
}

/**
 * 역할 수정
 */
export async function updateRole(
  roleId: string,
  roleData: RoleUpdate
): Promise<Role> {
  return put<Role>(`/api/v1/roles/${roleId}`, roleData);
}

/**
 * 역할 삭제 (소프트 삭제)
 */
export async function deleteRole(roleId: string): Promise<void> {
  return del<void>(`/api/v1/roles/${roleId}`);
}

/**
 * 권한 목록 조회
 */
export async function getPermissions(): Promise<Permission[]> {
  return get<Permission[]>('/api/v1/permissions');
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
