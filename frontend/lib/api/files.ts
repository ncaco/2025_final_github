/**
 * 파일 관련 API 함수들
 */

import { get, post, put, del } from './client';
import type { File, FileCreate, FileUpdate } from '@/types/user';

export async function getFiles(params?: {
  skip?: number;
  limit?: number;
  user_id?: string;
  file_ext?: string;
  mime_typ?: string;
  stg_typ?: string;
  pub_yn?: boolean;
}): Promise<File[]> {
  const queryParams = new URLSearchParams();
  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.user_id) queryParams.append('user_id', params.user_id);
  if (params?.file_ext) queryParams.append('file_ext', params.file_ext);
  if (params?.mime_typ) queryParams.append('mime_typ', params.mime_typ);
  if (params?.stg_typ) queryParams.append('stg_typ', params.stg_typ);
  if (params?.pub_yn !== undefined) queryParams.append('pub_yn', params.pub_yn.toString());

  const endpoint = queryParams.toString() ? `/api/v1/files?${queryParams.toString()}` : '/api/v1/files';
  console.log('📡 파일 API 호출 엔드포인트:', endpoint);
  return get(endpoint);
}

export async function getFileDetail(fileId: string): Promise<File> {
  return get(`/api/v1/files/${fileId}`);
}

export async function createFile(fileData: FileCreate): Promise<File> {
  return post('/api/v1/files', fileData);
}

export async function updateFile(fileId: string, fileData: FileUpdate): Promise<File> {
  return put(`/api/v1/files/${fileId}`, fileData);
}

export async function deleteFile(fileId: string): Promise<void> {
  return del(`/api/v1/files/${fileId}`);
}
