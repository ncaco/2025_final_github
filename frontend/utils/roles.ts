/**
 * 역할 관련 유틸리티 함수
 */

import { getCurrentUserRoles, getUserRoles } from '@/lib/api/userRoles';
import { getRoleDetail } from '@/lib/api/roles';

/**
 * 사용자가 관리자 역할을 가지고 있는지 확인
 * 
 * 판단 방법:
 * 1. 사용자의 역할 목록을 조회 (user-roles API)
 * 2. 각 역할의 role_id로 역할 상세 정보 조회 (roles API)
 * 3. role_cd가 "ADMIN"인지 확인
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    console.log('관리자 역할 확인 시작, userId:', userId);
    const userRoles = userId 
      ? await getUserRoles(userId)
      : await getCurrentUserRoles();
    
    console.log('사용자 역할 매핑 목록:', userRoles);
    
    if (!userRoles || userRoles.length === 0) {
      console.log('사용자에게 할당된 역할이 없습니다.');
      return false;
    }
    
    // 각 역할의 role_id로 역할 상세 정보를 조회하여 role_cd 확인
    const roleChecks = await Promise.all(
      userRoles.map(async (userRole) => {
        try {
          const role = await getRoleDetail(userRole.role_id);
          console.log(`역할 ${userRole.role_id}의 role_cd:`, role.role_cd);
          return role.role_cd?.toUpperCase() === 'ADMIN';
        } catch (error) {
          console.error(`역할 ${userRole.role_id} 조회 중 오류:`, error);
          // role_id에 ADMIN이 포함되어 있는지 확인 (fallback)
          return userRole.role_id?.toUpperCase().includes('ADMIN') || false;
        }
      })
    );
    
    const isAdminRole = roleChecks.some(check => check === true);
    console.log('관리자 여부:', isAdminRole);
    return isAdminRole;
  } catch (error) {
    console.error('역할 확인 중 오류:', error);
    return false;
  }
}

/**
 * 사용자가 특정 역할 코드를 가지고 있는지 확인
 * 
 * @param roleCode 역할 코드 (예: "ADMIN", "USER", "MODERATOR")
 * @param userId 사용자 ID (선택, 없으면 현재 사용자)
 */
export async function hasRole(roleCode: string, userId?: string): Promise<boolean> {
  try {
    const userRoles = userId 
      ? await getUserRoles(userId)
      : await getCurrentUserRoles();
    
    if (!userRoles || userRoles.length === 0) {
      return false;
    }
    
    // 각 역할의 role_id로 역할 상세 정보를 조회하여 role_cd 확인
    const roleChecks = await Promise.all(
      userRoles.map(async (userRole) => {
        try {
          const { getRoleDetail } = await import('@/lib/api/roles');
          const role = await getRoleDetail(userRole.role_id);
          return role.role_cd?.toUpperCase() === roleCode.toUpperCase();
        } catch (error) {
          console.error(`역할 ${userRole.role_id} 조회 중 오류:`, error);
          // fallback: role_id에 roleCode가 포함되어 있는지 확인
          return userRole.role_id?.toUpperCase().includes(roleCode.toUpperCase()) || false;
        }
      })
    );
    
    return roleChecks.some(check => check === true);
  } catch (error) {
    console.error('역할 확인 중 오류:', error);
    return false;
  }
}

