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
  common_permission_sn: number;
  permission_id: string;
  permission_cd: string;
  permission_nm: string;
  dsc?: string;
  rsrc: string;
  act: string;
  actv_yn: boolean;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
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

/**
 * 권한 생성 요청
 */
export interface PermissionCreate {
  permission_cd: string;
  permission_nm: string;
  dsc?: string;
  rsrc: string;
  act: string;
  actv_yn?: boolean;
}

/**
 * 권한 수정 요청
 */
export interface PermissionUpdate {
  permission_cd?: string;
  permission_nm?: string;
  dsc?: string;
  rsrc?: string;
  act?: string;
  actv_yn?: boolean;
}

/**
 * 감사 로그
 */
export interface AuditLog {
  common_audit_log_sn: number;
  audit_log_id: string;
  user_id?: string;
  act_typ: string;
  rsrc_typ?: string;
  rsrc_id?: string;
  old_val?: unknown;
  new_val?: unknown;
  ip_addr?: string;
  user_agent?: string;
  req_mthd?: string;
  req_path?: string;
  stts_cd?: number;
  err_msg?: string;
  crt_dt: string;
  use_yn: boolean;
}

export interface File {
  common_file_sn: number;
  file_id: string;
  user_id: string;
  file_nm: string;
  file_path: string;
  file_sz: number;
  mime_typ?: string;
  file_ext?: string;
  stg_typ: string;
  pub_yn: boolean;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

export interface FileCreate {
  user_id: string;
  file_nm: string;
  file_path: string;
  file_sz: number;
  mime_typ?: string;
  file_ext?: string;
  stg_typ?: string;
  pub_yn?: boolean;
}

export interface FileUpdate {
  file_nm?: string;
  pub_yn?: boolean;
  use_yn?: boolean;
}

export interface RolePermission {
  common_role_permission_sn: number;
  role_permission_id: string;
  role_id: string;
  permission_id: string;
  crt_dt: string;
  use_yn: boolean;
  role?: {
    role_nm: string;
  };
  permission?: {
    rsrc: string;
    act: string;
    actv_yn: boolean;
  };
}

export interface RolePermissionCreate {
  role_id: string;
  permission_id: string;
}

export interface UserRole {
  common_user_role_sn: number;
  user_role_id: string;
  user_id: string;
  role_id: string;
  asgn_by?: string;
  asgn_dt?: string;
  expr_dt?: string;
  crt_dt: string;
  use_yn: boolean;
  user?: {
    username: string;
    eml: string;
  };
  role?: {
    role_nm: string;
  };
}

export interface UserRoleCreate {
  user_id: string;
  role_id: string;
  expr_dt?: string;
}

