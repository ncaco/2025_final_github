/**
 * API 클라이언트 기본 설정
 * 토큰 관리, 인터셉터, 에러 처리 등을 포함합니다.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  detail?: string | { [key: string]: any };
  message?: string;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: ApiError
  ) {
    const message =
      typeof data?.detail === 'string'
        ? data.detail
        : typeof data?.message === 'string'
          ? data.message
          : statusText;
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * 토큰 저장 및 관리
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },
  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

/**
 * API 요청 옵션
 */
export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  params?: Record<string, any>;
}

/**
 * 기본 API 클라이언트
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, skipRefresh = false, params, ...fetchOptions } = options;

  // URL 생성 및 쿼리 파라미터 추가
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const paramString = searchParams.toString();
    if (paramString) {
      url += (url.includes('?') ? '&' : '?') + paramString;
    }
  }

  console.log('🌐 API 요청 URL:', url);

  // 헤더 설정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // 인증 토큰 추가
  if (!skipAuth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // 401 에러 처리 (토큰 갱신 시도)
    if (response.status === 401 && !skipAuth && !skipRefresh) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // 재시도
        const newAccessToken = tokenStorage.getAccessToken();
        if (newAccessToken) {
          const retryHeaders: Record<string, string> = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          };
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
          });
          return handleResponse<T>(retryResponse);
        }
      }
      // 토큰 갱신 실패 시 로그아웃 처리
      tokenStorage.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw new ApiClientError(401, 'Unauthorized', {
        message: '인증이 만료되었습니다. 다시 로그인해주세요.',
      });
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(0, 'Network Error', {
      message: error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
    });
  }
}

/**
 * 응답 처리
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorData: ApiError = {};
    if (isJson) {
      try {
        errorData = await response.json();
      } catch {
        // JSON 파싱 실패
      }
    }
    throw new ApiClientError(
      response.status,
      response.statusText,
      errorData
    );
  }

  // 204 No Content 응답은 본문이 없으므로 빈 객체 반환
  if (response.status === 204) {
    return {} as T;
  }

  if (isJson) {
    // 본문이 있는지 확인
    const text = await response.text();
    if (!text || text.trim() === '') {
      return {} as T;
    }
    try {
      return JSON.parse(text);
    } catch {
      // JSON 파싱 실패 시 빈 객체 반환
      return {} as T;
    }
  }

  return response.text() as unknown as T;
}

/**
 * 토큰 갱신 시도
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.access_token && data.refresh_token) {
        tokenStorage.setTokens(data.access_token, data.refresh_token);
        return true;
      }
    }
  } catch {
    // 토큰 갱신 실패
  }

  return false;
}

/**
 * GET 요청
 */
export function get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * POST 요청
 */
export function post<T>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 요청
 */
export function put<T>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청
 */
export function del<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
}

/**
 * PATCH 요청
 */
export function patch<T>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

