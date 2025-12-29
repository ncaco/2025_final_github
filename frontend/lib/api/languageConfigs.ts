/**
 * 언어 설정 관련 API 함수들
 */

import { get, post, put, del } from './client';
import type { LanguageConfig, LanguageConfigCreate, LanguageConfigUpdate } from '@/types/user';

export async function getLanguageConfigs(params?: {
  use_yn?: boolean;
}): Promise<LanguageConfig[]> {
  const queryParams = new URLSearchParams();
  if (params?.use_yn !== undefined) queryParams.append('use_yn', params.use_yn.toString());

  const endpoint = queryParams.toString() ? `/api/v1/language-configs?${queryParams.toString()}` : '/api/v1/language-configs';
  return get(endpoint);
}

export async function getLanguageConfigDetail(languageConfigId: number): Promise<LanguageConfig> {
  return get(`/api/v1/language-configs/${languageConfigId}`);
}

export async function createLanguageConfig(languageConfigData: LanguageConfigCreate): Promise<LanguageConfig> {
  return post('/api/v1/language-configs', languageConfigData);
}

export async function updateLanguageConfig(languageConfigId: number, languageConfigData: LanguageConfigUpdate): Promise<LanguageConfig> {
  return put(`/api/v1/language-configs/${languageConfigId}`, languageConfigData);
}

export async function deleteLanguageConfig(languageConfigId: number): Promise<void> {
  return del(`/api/v1/language-configs/${languageConfigId}`);
}
