/**
 * 사용자 관련 타입 정의
 */

/**
 * 사용자 기본 정보
 */
export interface User {
  common_user_sn: number;
  user_id: string;
  eml: string;
  username: string;
  nm?: string;
  nickname?: string;
  telno?: string;
  actv_yn: boolean;
  eml_vrf_yn: boolean;
  telno_vrf_yn: boolean;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

/**
 * 사용자 생성 요청
 */
export interface UserCreate {
  eml: string;
  username: string;
  password: string;
  nm?: string;
  nickname?: string;
  telno?: string;
}

/**
 * 사용자 수정 요청
 */
export interface UserUpdate {
  eml?: string;
  username?: string;
  nm?: string;
  nickname?: string;
  telno?: string;
  actv_yn?: boolean;
  eml_vrf_yn?: boolean;
  telno_vrf_yn?: boolean;
}

/**
 * 사용자 응답 (상세)
 */
export interface UserDetailResponse extends User {
  roles?: Role[];
  permissions?: Permission[];
}

/**
 * 역할
 */
export interface Role {
  role_id: string;
  role_cd?: string;
  role_nm: string;
  role_dc?: string;
}

/**
 * 권한
 */
export interface Permission {
  permission_id: string;
  permission_nm: string;
  permission_dc?: string;
  rsrc?: string;
  act?: string;
}

/**
 * 역할 생성 요청
 */
export interface RoleCreate {
  role_cd: string;
  role_nm: string;
  role_dc?: string;
  actv_yn?: boolean;
}

/**
 * 역할 수정 요청
 */
export interface RoleUpdate {
  role_nm?: string;
  role_cd?: string;
  role_dc?: string;
  actv_yn?: boolean;
}

/**
 * 권한이 포함된 역할
 */
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
  actv_yn: boolean;
  crt_dt?: string;
  upd_dt?: string;
}

/**
 * 사용자-역할 할당
 */
export interface UserRoleAssignment {
  user_id: string;
  role_id: string;
  expr_dt?: string; // 만료일시
}

/**
 * 사용자-역할 할당 응답
 */
export interface UserRoleResponse {
  user_role_id: string;
  user_id: string;
  role_id: string;
  asgn_dt: string;
  expr_dt?: string;
  use_yn: boolean;
}

