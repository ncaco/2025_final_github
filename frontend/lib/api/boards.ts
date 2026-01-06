/**
 * 게시판 관리 API
 */
import { get, post, put, del } from './client';

// 게시판 관련 타입들
export interface Board {
  id: number;
  nm: string;
  dsc?: string;
  typ: 'GENERAL' | 'NOTICE' | 'QNA' | 'IMAGE' | 'VIDEO';
  actv_yn: boolean;
  read_permission: 'ALL' | 'USER' | 'ADMIN';
  write_permission: 'ALL' | 'USER' | 'ADMIN';
  comment_permission: 'ALL' | 'USER' | 'ADMIN';
  allow_attachment: boolean;
  allow_image: boolean;
  max_file_size: number;
  sort_order: number;
  post_count: number;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

export interface BoardCreate {
  nm: string;
  dsc?: string;
  typ?: 'GENERAL' | 'NOTICE' | 'QNA' | 'IMAGE' | 'VIDEO';
  read_permission?: 'ALL' | 'USER' | 'ADMIN';
  write_permission?: 'ALL' | 'USER' | 'ADMIN';
  comment_permission?: 'ALL' | 'USER' | 'ADMIN';
  allow_attachment?: boolean;
  allow_image?: boolean;
  max_file_size?: number;
  sort_order?: number;
}

export interface BoardUpdate {
  nm?: string;
  dsc?: string;
  typ?: 'GENERAL' | 'NOTICE' | 'QNA' | 'IMAGE' | 'VIDEO';
  actv_yn?: boolean;
  read_permission?: 'ALL' | 'USER' | 'ADMIN';
  write_permission?: 'ALL' | 'USER' | 'ADMIN';
  comment_permission?: 'ALL' | 'USER' | 'ADMIN';
  allow_attachment?: boolean;
  allow_image?: boolean;
  max_file_size?: number;
  sort_order?: number;
}

export interface Category {
  id: number;
  board_id: number;
  nm: string;
  dsc?: string;
  color?: string;
  icon?: string;
  sort_order: number;
  actv_yn: boolean;
  post_count: number;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

export interface CategoryCreate {
  board_id: number;
  nm: string;
  dsc?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface CategoryUpdate {
  nm?: string;
  dsc?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
  actv_yn?: boolean;
}

// 게시글 관련 타입들
export interface Post {
  id: number;
  board_id: number;
  category_id?: number;
  user_id: string;
  ttl: string;
  cn: string;
  smmry?: string;
  stts: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  ntce_yn: boolean;
  scr_yn: boolean;
  vw_cnt: number;
  lk_cnt: number;
  cmt_cnt: number;
  att_cnt: number;
  lst_cmt_dt?: string;
  pbl_dt: string;
  crt_dt: string;
  upd_dt?: string;
  author_nickname: string;
  category_nm?: string;
  tags?: string[];
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface PostCreate {
  board_id: number;
  category_id?: number;
  ttl: string;
  cn: string;
  smmry?: string;
  ntce_yn?: boolean;
  scr_yn?: boolean;
  pwd?: string;
  tags?: string[];
}

export interface PostUpdate {
  ttl?: string;
  cn?: string;
  smmry?: string;
  category_id?: number;
  ntce_yn?: boolean;
  scr_yn?: boolean;
  pwd?: string;
  stts?: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  tags?: string[];
  change_rsn?: string;
}

// 팔로우 상태 확인 함수
export function getBoardFollowStatusFunc(boardId: number) {
  return get<{ is_following: boolean }>(`/api/v1/board-extra/follow/status/board/${boardId}`);
}

// 게시판 API 함수들
export const boardApi = {
  // 게시판 목록 조회
  getBoards: (params?: { skip?: number; limit?: number; include_inactive?: boolean }) =>
    get<Board[]>('/api/v1/boards/boards', { params }),

  // 게시판 상세 조회
  getBoard: (boardId: number) =>
    get<Board>(`/api/v1/boards/boards/${boardId}`),

  // 게시판 생성
  createBoard: (data: BoardCreate) =>
    post<Board>('/api/v1/boards/boards', data),

  // 게시판 수정
  updateBoard: (boardId: number, data: BoardUpdate) =>
    put<Board>(`/api/v1/boards/boards/${boardId}`, data),

  // 게시판 삭제
  deleteBoard: (boardId: number) =>
    del<void>(`/api/v1/boards/boards/${boardId}`),

  // 게시판별 카테고리 조회
  getCategoriesByBoard: (boardId: number) =>
    get<Category[]>(`/api/v1/boards/boards/${boardId}/categories`),
};

// 카테고리 API 함수들
export const categoryApi = {
  // 카테고리 생성
  createCategory: (data: CategoryCreate) =>
    post<Category>('/api/v1/boards/categories', data),

  // 카테고리 수정
  updateCategory: (categoryId: number, data: CategoryUpdate) =>
    put<Category>(`/api/v1/boards/categories/${categoryId}`, data),

  // 카테고리 삭제
  deleteCategory: (categoryId: number) =>
    del<void>(`/api/v1/boards/categories/${categoryId}`),
};

// 게시글 API 함수들
export const postApi = {
  // 게시글 목록 조회
  getPosts: (boardId: number, params?: { skip?: number; limit?: number; status?: string }) =>
    get<Post[]>(`/api/v1/boards/boards/${boardId}/posts`, { params }),

  // 게시글 상세 조회
  getPost: (postId: number, accessToken?: string) =>
    get<Post>(`/api/v1/boards/posts/${postId}`, accessToken ? { params: { access_token: accessToken } } : {}),

  // 비밀글 비밀번호 검증
  verifyPassword: (postId: number, password: string) =>
    post<{ verified: boolean; access_token: string }>(`/api/v1/boards/posts/${postId}/verify-password`, { password }),

  // 게시글 생성
  createPost: (data: PostCreate) =>
    post<Post>('/api/v1/boards/posts', data),

  // 게시글 수정
  updatePost: (postId: number, data: PostUpdate) =>
    put<Post>(`/api/v1/boards/posts/${postId}`, data),

  // 게시글 삭제
  deletePost: (postId: number) =>
    del<void>(`/api/v1/boards/posts/${postId}`),

  // 게시글 좋아요 토글
  toggleLike: (postId: number) =>
    post<{ liked: boolean; like_count: number }>(`/api/v1/boards/posts/${postId}/like`),

  // 게시글 조회수 증가
  incrementViewCount: (postId: number) =>
    put<void>(`/api/v1/boards/posts/${postId}/view`),

  // 팔로우 관련 API
  getBoardFollowStatus: getBoardFollowStatusFunc,

  followBoard: (boardId: number) =>
    post<{ id: number; follower_id: string; following_id: string; typ: string; crt_dt: string }>(
      '/api/v1/board-extra/follow',
      { following_id: boardId.toString(), typ: 'BOARD' }
    ),

  unfollowBoard: (boardId: number) =>
    del<void>(`/api/v1/board-extra/follow/${boardId}?follow_type=BOARD`),
};

// 댓글 관련 타입들
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
}

export interface CommentCreate {
  post_id: number;
  cn: string;
  parent_id?: number;
  scr_yn?: boolean;
}

export interface CommentUpdate {
  cn?: string;
  scr_yn?: boolean;
  stts?: 'PUBLISHED' | 'DELETED' | 'HIDDEN' | 'SECRET';
}

// 댓글 API 함수들
export const commentApi = {
  // 댓글 목록 조회
  getComments: (postId: number) =>
    get<Comment[]>(`/api/v1/boards/posts/${postId}/comments`),

  // 댓글 생성
  createComment: (data: CommentCreate) =>
    post<Comment>('/api/v1/boards/comments', data),

  // 댓글 수정
  updateComment: (commentId: number, data: CommentUpdate) =>
    put<Comment>(`/api/v1/boards/comments/${commentId}`, data),

  // 댓글 삭제
  deleteComment: (commentId: number) =>
    del<void>(`/api/v1/boards/comments/${commentId}`),

  // 댓글 좋아요 토글
  toggleLike: (commentId: number) =>
    post<{ liked: boolean; like_count: number }>(`/api/v1/boards/comments/${commentId}/like`),
};
