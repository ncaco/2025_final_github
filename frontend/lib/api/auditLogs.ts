/**
 * 감사 로그 관련 API 함수
 */

import { get } from './client';
import type { AuditLog } from '@/types/user';

/**
 * 감사 로그 목록 조회
 */
export async function getAuditLogs(params?: {
  skip?: number;
  limit?: number;
  user_id?: string;
  act_typ?: string;
  rsrc_typ?: string;
  rsrc_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AuditLog[]> {
  const queryParams = new URLSearchParams();

  if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params?.user_id) queryParams.append('user_id', params.user_id);
  if (params?.act_typ) queryParams.append('act_typ', params.act_typ);
  if (params?.rsrc_typ) queryParams.append('rsrc_typ', params.rsrc_typ);
  if (params?.rsrc_id) queryParams.append('rsrc_id', params.rsrc_id);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const queryString = queryParams.toString();
  return get<AuditLog[]>(`/api/v1/audit-logs${queryString ? `?${queryString}` : ''}`);
}

/**
 * 감사 로그 상세 조회
 */
export async function getAuditLogDetail(auditLogId: string): Promise<AuditLog> {
  return get<AuditLog>(`/api/v1/audit-logs/${auditLogId}`);
}
