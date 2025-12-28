/**
 * 권한 관련 API 함수
 */

import { get, put, del, post } from './client';
import type { Permission } from '@/types/user';

/**
 * 권한 목록 조회
 */
export async function getPermissions(params?: {
  skip?: number;
  limit?: number;
  rsrc?: string;
  act?: string;
  actv_yn?: boolean;
}): Promise<Permission[]> {
  const queryParams = new URLSearchParams();

  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.rsrc) queryParams.append('rsrc', params.rsrc);
  if (params?.act) queryParams.append('act', params.act);
  if (params?.actv_yn !== undefined) queryParams.append('actv_yn', params.actv_yn.toString());

  const queryString = queryParams.toString();
  return get<Permission[]>(`/api/v1/permissions${queryString ? `?${queryString}` : ''}`);
}

/**
 * 권한 상세 조회
 */
export async function getPermissionDetail(permissionId: string): Promise<Permission> {
  return get<Permission>(`/api/v1/permissions/${permissionId}`);
}

/**
 * 권한 생성
 */
export async function createPermission(permissionData: any): Promise<Permission> {
  return post<Permission>('/api/v1/permissions', permissionData);
}

/**
 * 권한 수정
 */
export async function updatePermission(
  permissionId: string,
  permissionData: any
): Promise<Permission> {
  return put<Permission>(`/api/v1/permissions/${permissionId}`, permissionData);
}

/**
 * 권한 삭제
 */
export async function deletePermission(permissionId: string): Promise<void> {
  return del<void>(`/api/v1/permissions/${permissionId}`);
}
