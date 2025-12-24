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
}

