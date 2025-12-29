/**
 * 리프레시 토큰 관리 관련 API 함수들
 */

import { get, put, del } from './client';
import type { RefreshToken } from '@/types/user';

export async function getRefreshTokens(params?: {
  skip?: number;
  limit?: number;
  user_id?: string;
  rvk_yn?: boolean;
  use_yn?: boolean;
}): Promise<RefreshToken[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.user_id) queryParams.append('user_id', params.user_id);
  if (params?.rvk_yn !== undefined) queryParams.append('rvk_yn', params.rvk_yn.toString());
  if (params?.use_yn !== undefined) queryParams.append('use_yn', params.use_yn.toString());

  const endpoint = queryParams.toString() ? `/api/v1/refresh-tokens?${queryParams.toString()}` : '/api/v1/refresh-tokens';
  return get(endpoint);
}

export async function getRefreshTokenDetail(refreshTokenId: string): Promise<RefreshToken> {
  return get(`/api/v1/refresh-tokens/${refreshTokenId}`);
}

export async function revokeRefreshToken(refreshTokenId: string): Promise<RefreshToken> {
  return put(`/api/v1/refresh-tokens/${refreshTokenId}/revoke`);
}

export async function deleteRefreshToken(refreshTokenId: string): Promise<void> {
  return del(`/api/v1/refresh-tokens/${refreshTokenId}`);
}
