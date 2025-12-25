/**
 * 역할 관련 API 함수
 */

import { get } from './client';
import type { Role } from '@/types/user';

export interface RoleDetail {
  common_role_sn: number;
  role_id: string;
  role_cd: string;
  role_nm: string;
  dsc?: string;
  actv_yn: boolean;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

/**
 * 역할 목록 조회
 */
export async function getRoles(params?: { skip?: number; limit?: number; actv_yn?: boolean }): Promise<RoleDetail[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip) queryParams.append('skip', params.skip.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.actv_yn !== undefined) queryParams.append('actv_yn', params.actv_yn.toString());
  
  const queryString = queryParams.toString();
  return get<RoleDetail[]>(`/api/v1/roles${queryString ? `?${queryString}` : ''}`);
}

/**
 * 특정 역할 조회
 */
export async function getRole(roleId: string): Promise<RoleDetail> {
  return get<RoleDetail>(`/api/v1/roles/${roleId}`);
}

