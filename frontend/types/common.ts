/**
 * 공통 타입 정의
 */

/**
 * API 에러 응답
 */
export interface ApiError {
  detail?: string | { [key: string]: any };
  message?: string;
}

/**
 * 선택 옵션
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

