/**
 * OAuth 계정 관리 관련 API 함수들
 */

import { get, post, put, del } from './client';
import type { OauthAccount, OauthAccountCreate, OauthAccountUpdate } from '@/types/user';

export async function getOauthAccounts(params?: {
  skip?: number;
  limit?: number;
  user_id?: string;
  provider?: string;
  use_yn?: boolean;
}): Promise<OauthAccount[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.user_id) queryParams.append('user_id', params.user_id);
  if (params?.provider) queryParams.append('provider', params.provider);
  if (params?.use_yn !== undefined) queryParams.append('use_yn', params.use_yn.toString());

  const endpoint = queryParams.toString() ? `/api/v1/oauth-accounts?${queryParams.toString()}` : '/api/v1/oauth-accounts';
  return get(endpoint);
}

export async function getOauthAccountDetail(oauthAccountId: string): Promise<OauthAccount> {
  return get(`/api/v1/oauth-accounts/${oauthAccountId}`);
}

export async function createOauthAccount(oauthAccountData: OauthAccountCreate): Promise<OauthAccount> {
  return post('/api/v1/oauth-accounts', oauthAccountData);
}

export async function updateOauthAccount(oauthAccountId: string, oauthAccountData: OauthAccountUpdate): Promise<OauthAccount> {
  return put(`/api/v1/oauth-accounts/${oauthAccountId}`, oauthAccountData);
}

export async function deleteOauthAccount(oauthAccountId: string): Promise<void> {
  return del(`/api/v1/oauth-accounts/${oauthAccountId}`);
}
