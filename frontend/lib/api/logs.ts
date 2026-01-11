/**
 * 로그 관련 API 클라이언트
 */

import { get } from './client';

export interface ActivityLog {
  id: number;
  user_id: string;
  act_typ: 'LOGIN' | 'LOGOUT' | 'POST_CREATE' | 'POST_UPDATE' | 'POST_DELETE' | 'COMMENT_CREATE' | 'COMMENT_DELETE' | 'LIKE' | 'BOOKMARK' | 'REPORT';
  act_dsc?: string;
  target_typ?: string;
  target_id?: number;
  ip_addr?: string;
  user_agent?: string;
  meta_data?: Record<string, any>;
  crt_dt: string;
}

export interface PostHistory {
  id: number;
  post_id: number;
  user_id: string;
  prev_ttl?: string;
  new_ttl?: string;
  prev_cn?: string;
  new_cn?: string;
  change_typ: 'CREATE' | 'UPDATE' | 'DELETE';
  change_rsn?: string;
  crt_dt: string;
}

export interface SearchLog {
  id: number;
  user_id?: string;
  search_query: string;
  search_typ?: string;
  result_cnt: number;
  ip_addr?: string;
  crt_dt: string;
}

export interface AdminLog {
  id: number;
  admin_id: string;
  act_typ: 'USER_BAN' | 'USER_UNBAN' | 'POST_HIDE' | 'POST_SHOW' | 'COMMENT_HIDE' | 'COMMENT_SHOW' | 'REPORT_RESOLVE' | 'BOARD_CREATE' | 'BOARD_UPDATE' | 'BOARD_DELETE';
  act_dsc?: string;
  target_typ?: string;
  target_id?: number;
  old_val?: Record<string, any>;
  new_val?: Record<string, any>;
  ip_addr?: string;
  crt_dt: string;
}

export interface LogListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const logsApi = {
  /**
   * 활동 로그 조회
   */
  getActivityLogs: (params?: {
    act_typ?: ActivityLog['act_typ'];
    page?: number;
    limit?: number;
  }) =>
    get<LogListResponse<ActivityLog>>('/api/v1/logs/activity', { params }),

  /**
   * 게시글 히스토리 조회
   */
  getPostHistory: (postId: number, params?: {
    page?: number;
    limit?: number;
  }) =>
    get<LogListResponse<PostHistory>>(`/api/v1/logs/post-history/${postId}`, { params }),

  /**
   * 검색 로그 조회
   */
  getSearchLogs: (params?: {
    user_id?: string;
    search_typ?: string;
    page?: number;
    limit?: number;
  }) =>
    get<LogListResponse<SearchLog>>('/api/v1/logs/search', { params }),

  /**
   * 관리자 로그 조회
   */
  getAdminLogs: (params?: {
    admin_id?: string;
    act_typ?: AdminLog['act_typ'];
    target_typ?: string;
    page?: number;
    limit?: number;
  }) =>
    get<LogListResponse<AdminLog>>('/api/v1/logs/admin', { params }),
};
