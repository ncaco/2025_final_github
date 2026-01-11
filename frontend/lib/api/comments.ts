/**
 * 댓글 관리 API 클라이언트 (관리자용)
 */

import { get, put, del } from './client';

export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  cn: string;
  parent_id?: number;
  scr_yn: boolean;
  stts: 'PUBLISHED' | 'DELETED' | 'HIDDEN' | 'SECRET';
  lk_cnt: number;
  depth: number;
  sort_order: number;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
  author_nickname?: string;
  is_liked?: boolean;
  children?: Comment[];
  post_title?: string;
  board_id?: number;
}

export const commentApi = {
  /**
   * 전체 댓글 목록 조회 (관리자용)
   */
  getAllComments: (params?: {
    board_id?: number;
    post_id?: number;
    status?: 'PUBLISHED' | 'DELETED' | 'HIDDEN' | 'SECRET';
    search_query?: string;
    skip?: number;
    limit?: number;
  }) =>
    get<Comment[]>('/api/v1/boards/comments/admin', { params }),

  /**
   * 댓글 숨김 (관리자용)
   */
  hideComment: (commentId: number) =>
    put<Comment>(`/api/v1/boards/comments/${commentId}/hide`),

  /**
   * 댓글 표시 (관리자용)
   */
  showComment: (commentId: number) =>
    put<Comment>(`/api/v1/boards/comments/${commentId}/show`),

  /**
   * 댓글 삭제 (관리자용)
   */
  deleteComment: (commentId: number) =>
    del<void>(`/api/v1/boards/comments/${commentId}/admin`),
};
