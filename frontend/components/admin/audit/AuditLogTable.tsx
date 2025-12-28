/**
 * 감사 로그 목록 테이블 컴포넌트
 */

'use client';

import { useRef } from 'react';
import type { AuditLog } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/common/Loading';

interface AuditLogTableProps {
  auditLogs: AuditLog[];
  loading: boolean;
  onViewAuditLog: (auditLog: AuditLog) => void;
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
}

export function AuditLogTable({
  auditLogs,
  loading,
  onViewAuditLog,
  currentPage = 1,
  itemsPerPage = 10,
  totalCount = 0,
}: AuditLogTableProps) {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

  // 액션 타입 매핑
  const actionTypeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    'LOGIN': { label: '로그인', variant: 'default' },
    'LOGOUT': { label: '로그아웃', variant: 'secondary' },
    'CREATE': { label: '생성', variant: 'default' },
    'READ': { label: '조회', variant: 'outline' },
    'UPDATE': { label: '수정', variant: 'default' },
    'DELETE': { label: '삭제', variant: 'destructive' },
    'API_CALL': { label: 'API 호출', variant: 'outline' },
  };

  // 리소스 타입 매핑
  const resourceTypeMap: Record<string, string> = {
    'USER': '사용자',
    'ROLE': '역할',
    'PERMISSION': '권한',
    'FILE': '파일',
    'ADMIN': '관리자',
    'SYSTEM': '시스템',
  };

  // HTTP 메서드 매핑
  const methodMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    'GET': { label: 'GET', variant: 'outline' },
    'POST': { label: 'POST', variant: 'default' },
    'PUT': { label: 'PUT', variant: 'default' },
    'DELETE': { label: 'DELETE', variant: 'destructive' },
    'PATCH': { label: 'PATCH', variant: 'secondary' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        감사 로그가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border flex flex-col h-full">
      {/* 테이블 헤더 (고정) */}
      <div
        className="shrink-0 overflow-x-auto"
        ref={headerScrollRef}
        onScroll={(e) => {
          if (isScrollingRef.current === 'body') return;
          const target = e.currentTarget;
          if (bodyScrollRef.current) {
            isScrollingRef.current = 'header';
            bodyScrollRef.current.scrollLeft = target.scrollLeft;
            requestAnimationFrame(() => {
              isScrollingRef.current = null;
            });
          }
        }}
      >
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-16" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-20" />
          </colgroup>
          <thead className="bg-background">
            <tr>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">번호</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">로그 ID</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">사용자 ID</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">액션</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">리소스</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">메서드</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">상태</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">시간</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">작업</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* 테이블 바디 (스크롤 가능) */}
      <div
        className="flex-1 min-h-0 overflow-auto"
        ref={bodyScrollRef}
        onScroll={(e) => {
          if (isScrollingRef.current === 'header') return;
          const target = e.currentTarget;
          if (headerScrollRef.current) {
            isScrollingRef.current = 'body';
            headerScrollRef.current.scrollLeft = target.scrollLeft;
            requestAnimationFrame(() => {
              isScrollingRef.current = null;
            });
          }
        }}
      >
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-16" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-20" />
          </colgroup>
          <tbody>
            {auditLogs.map((auditLog, index) => {
              // 역순 번호 계산: 전체 개수 - (현재 페이지 - 1) * itemsPerPage - index
              const rowNumber = totalCount > 0
                ? totalCount - (currentPage - 1) * itemsPerPage - index
                : (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr key={auditLog.audit_log_id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">{rowNumber}</td>
                  <td className="p-4 align-middle">
                    <span className="font-mono text-sm">{auditLog.audit_log_id}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <span className="font-mono text-sm">{auditLog.user_id || '-'}</span>
                  </td>
                  <td className="p-4 align-middle">
                    <Badge variant={actionTypeMap[auditLog.act_typ]?.variant || 'outline'} className="text-xs">
                      {actionTypeMap[auditLog.act_typ]?.label || auditLog.act_typ}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    {auditLog.rsrc_typ ? (
                      <Badge variant="secondary" className="text-xs">
                        {resourceTypeMap[auditLog.rsrc_typ] || auditLog.rsrc_typ}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {auditLog.req_mthd ? (
                      <Badge variant={methodMap[auditLog.req_mthd]?.variant || 'outline'} className="text-xs">
                        {methodMap[auditLog.req_mthd]?.label || auditLog.req_mthd}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {auditLog.stts_cd ? (
                      <Badge
                        variant={auditLog.stts_cd >= 200 && auditLog.stts_cd < 300 ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {auditLog.stts_cd}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-sm text-muted-foreground">
                      {new Date(auditLog.crt_dt).toLocaleDateString('ko-KR')}
                      <br />
                      {new Date(auditLog.crt_dt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex justify-center gap-0.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewAuditLog(auditLog)}
                        title="상세 보기"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
