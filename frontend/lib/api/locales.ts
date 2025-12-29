/**
 * 다국어 관리 관련 API 함수들
 */

import { get, post, put, del } from './client';
import type { Locale, LocaleCreate, LocaleUpdate } from '@/types/user';

export async function getLocales(params?: {
  skip?: number;
  limit?: number;
  lang_cd?: string;
  rsrc_typ?: string;
  rsrc_key?: string;
  use_yn?: boolean;
}): Promise<Locale[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.lang_cd) queryParams.append('lang_cd', params.lang_cd);
  if (params?.rsrc_typ) queryParams.append('rsrc_typ', params.rsrc_typ);
  if (params?.rsrc_key) queryParams.append('rsrc_key', params.rsrc_key);
  if (params?.use_yn !== undefined) queryParams.append('use_yn', params.use_yn.toString());

  const endpoint = queryParams.toString() ? `/api/v1/locales?${queryParams.toString()}` : '/api/v1/locales';
  return get(endpoint);
}

export async function getLocaleDetail(localeId: string): Promise<Locale> {
  return get(`/api/v1/locales/${localeId}`);
}

export async function createLocale(localeData: LocaleCreate): Promise<Locale> {
  return post('/api/v1/locales', localeData);
}

export async function updateLocale(localeId: string, localeData: LocaleUpdate): Promise<Locale> {
  return put(`/api/v1/locales/${localeId}`, localeData);
}

export async function deleteLocale(localeId: string): Promise<void> {
  return del(`/api/v1/locales/${localeId}`);
}
