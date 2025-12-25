/**
 * 사용자-역할 관련 API 함수
 */

import { get } from './client';

export interface UserRole {
  common_user_role_sn: number;
  user_role_id: string;
  user_id: string;
  role_id: string;
  asgn_by?: string;
  asgn_dt?: string;
  expr_dt?: string;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

/**
 * 특정 사용자의 역할 목록 조회
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  return get<UserRole[]>(`/api/v1/user-roles?user_id=${userId}&use_yn=true`);
}

/**
 * 현재 사용자의 역할 목록 조회
 */
export async function getCurrentUserRoles(): Promise<UserRole[]> {
  try {
    const { getCurrentUser } = await import('./users');
    const user = await getCurrentUser();
    console.log('현재 사용자 정보:', user);
    const roles = await getUserRoles(user.user_id);
    console.log('사용자 역할 조회 결과:', roles);
    return roles;
  } catch (error) {
    console.error('현재 사용자 역할 조회 중 오류:', error);
    throw error;
  }
}

