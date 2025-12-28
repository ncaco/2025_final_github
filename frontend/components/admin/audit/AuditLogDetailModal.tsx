/**
 * 감사 로그 상세 모달 컴포넌트
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuditLog } from '@/types/user';
import { getAuditLogDetail } from '@/lib/api/auditLogs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';

interface AuditLogDetailModalProps {
  auditLog: AuditLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailModal({
  auditLog: initialAuditLog,
  open,
  onOpenChange,
}: AuditLogDetailModalProps) {
  const [auditLog, setAuditLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  // 감사 로그 상세 정보 로드
  const loadAuditLogDetail = useCallback(async () => {
    try {
      setLoading(true);
      const auditLogDetail = await getAuditLogDetail(initialAuditLog.audit_log_id);
      setAuditLog(auditLogDetail);
    } catch (error) {
      console.error('감사 로그 상세 조회 실패:', error);
      toast({
        title: '감사 로그 상세 조회 실패',
        description: error instanceof Error ? error.message : '감사 로그 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [initialAuditLog.audit_log_id, toast]);

  // 모달 열릴 때 감사 로그 정보 로드
  useEffect(() => {
    if (open && initialAuditLog) {
      loadAuditLogDetail();
    }
  }, [open, initialAuditLog, loadAuditLogDetail]);

  // 모달 닫기
  const handleClose = () => {
    onOpenChange(false);
  };

  // JSON 데이터를 보기 좋게 포맷팅
  const formatJson = (data: unknown): string => {
    if (data === null || data === undefined) return '-';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  if (!auditLog) {
    return null;
  }

  // 타입 assertion: auditLog가 null이 아님을 보장
  const currentAuditLog: AuditLog = auditLog;


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">감사 로그 상세 정보</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            감사 로그의 상세 정보를 조회합니다.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* 기본 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">기본 정보</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">로그 ID</Label>
                  <div className="font-mono text-sm py-2 px-3 bg-muted/50 rounded-md border">
                    {currentAuditLog.audit_log_id}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">사용자 ID</Label>
                  <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                    {currentAuditLog.user_id || '-'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">액션 타입</Label>
                  <div className="py-2">
                    <Badge variant={actionTypeMap[currentAuditLog.act_typ]?.variant || 'outline'}>
                      {actionTypeMap[currentAuditLog.act_typ]?.label || currentAuditLog.act_typ}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">리소스 타입</Label>
                  <div className="py-2">
                    {currentAuditLog.rsrc_typ ? (
                      <Badge variant="secondary">
                        {resourceTypeMap[currentAuditLog.rsrc_typ] || currentAuditLog.rsrc_typ}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 리소스 정보 */}
            {Boolean(currentAuditLog.rsrc_id || currentAuditLog.req_path) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">리소스 정보</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">리소스 ID</Label>
                    <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                      {currentAuditLog.rsrc_id || '-'}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">요청 경로</Label>
                    <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center font-mono text-sm">
                      {currentAuditLog.req_path || '-'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HTTP 정보 */}
            {Boolean(currentAuditLog.req_mthd || currentAuditLog.stts_cd) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">HTTP 정보</h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">메서드</Label>
                    <div className="py-2">
                      {currentAuditLog.req_mthd ? (
                        <Badge variant={methodMap[currentAuditLog.req_mthd]?.variant || 'outline'}>
                          {methodMap[currentAuditLog.req_mthd]?.label || currentAuditLog.req_mthd}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">상태 코드</Label>
                    <div className="py-2">
                      {currentAuditLog.stts_cd ? (
                        <Badge
                          variant={currentAuditLog.stts_cd >= 200 && currentAuditLog.stts_cd < 300 ? 'default' : 'destructive'}
                        >
                          {currentAuditLog.stts_cd}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">IP 주소</Label>
                    <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center font-mono text-sm">
                      {currentAuditLog.ip_addr || '-'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 변경 내용 */}
            {Boolean(currentAuditLog.old_val || currentAuditLog.new_val) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">변경 내용</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">변경 전 값</Label>
                    <div className="p-3 bg-muted/30 rounded-md border max-h-32 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {formatJson(currentAuditLog.old_val)}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">변경 후 값</Label>
                    <div className="p-3 bg-muted/30 rounded-md border max-h-32 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {formatJson(currentAuditLog.new_val)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 에러 정보 */}
            {currentAuditLog.err_msg && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">에러 정보</h3>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">에러 메시지</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <pre className="text-sm text-red-800 whitespace-pre-wrap">
                      {currentAuditLog.err_msg}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 추가 정보 */}
            {currentAuditLog.user_agent && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">추가 정보</h3>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">User Agent</Label>
                  <div className="p-2 bg-muted/50 rounded-md border text-sm break-all">
                    {currentAuditLog.user_agent}
                  </div>
                </div>
              </div>
            )}

            {/* 메타 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">메타 정보</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">생성일</Label>
                  <div className="py-2 px-3 bg-muted/50 rounded-md border text-sm">
                    {new Date(currentAuditLog.crt_dt).toLocaleString('ko-KR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={handleClose} size="sm">
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
