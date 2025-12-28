/**
 * 역할-권한 매핑 관련 API 함수들
 */

import { get, post, del } from './client';
import type { RolePermission, RolePermissionCreate } from '@/types/user';

export async function getRolePermissions(params?: {
  skip?: number;
  limit?: number;
  role_id?: string;
  permission_id?: string;
}): Promise<RolePermission[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.role_id) queryParams.append('role_id', params.role_id);
  if (params?.permission_id) queryParams.append('permission_id', params.permission_id);

  const endpoint = queryParams.toString() ? `/api/v1/role-permissions?${queryParams.toString()}` : '/api/v1/role-permissions';
  return get(endpoint);
}

export async function getRolePermissionDetail(rolePermissionId: string): Promise<RolePermission> {
  return get(`/api/v1/role-permissions/${rolePermissionId}`);
}

export async function createRolePermission(rolePermissionData: RolePermissionCreate): Promise<RolePermission> {
  return post('/api/v1/role-permissions', rolePermissionData);
}

export async function deleteRolePermission(rolePermissionId: string): Promise<void> {
  return del(`/api/v1/role-permissions/${rolePermissionId}`);
}
