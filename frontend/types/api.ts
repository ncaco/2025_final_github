/**
 * API 공통 타입 정의
 */

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  detail?: string;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

/**
 * 정렬 파라미터
 */
export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

