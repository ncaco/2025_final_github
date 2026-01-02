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

// 게시판 API 함수들
export const boardApi = {
  // 게시판 목록 조회
  getBoards: (params?: { skip?: number; limit?: number }) =>
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
