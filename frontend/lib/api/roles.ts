/**
 * 역할 관련 API 함수
 */

import { get, put, del, post } from './client';
import type { Role, RoleCreate, RoleUpdate, RoleWithPermissions } from '@/types/user';

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