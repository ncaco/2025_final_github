/**
 * 감사 로그 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '@/lib/api/auditLogs';
import type { AuditLog } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { AuditLogTable } from '@/components/admin/audit/AuditLogTable';
import { AuditLogDetailModal } from '@/components/admin/audit/AuditLogDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_audit_logs_items_per_page';

export default function AuditLogsPage() {
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('act_typ');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { toast } = useToast();

  // 검색 옵션
  const searchOptions = [
    { value: 'act_typ', label: '액션 타입' },
    { value: 'rsrc_typ', label: '리소스 타입' },
    { value: 'user_id', label: '사용자 ID' },
    { value: 'rsrc_id', label: '리소스 ID' },
  ];

  // 필터링된 감사 로그 목록
  const filteredAuditLogs = auditLogs.filter(auditLog => {
    if (!searchKeyword) return true;

    const value = auditLog[selectedSearchColumn as keyof AuditLog];
    if (!value) return false;

    return String(value).toLowerCase().includes(searchKeyword.toLowerCase());
  });

  // 페이지네이션 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAuditLogs = filteredAuditLogs.slice(startIndex, startIndex + itemsPerPage);

  // 감사 로그 목록 로드
  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);

      // 디버깅: 토큰 상태 확인
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        console.log('🔍 토큰 상태 확인:', {
          accessToken: accessToken ? `있음 (${accessToken.length}자)` : '없음',
          refreshToken: refreshToken ? `있음 (${refreshToken.length}자)` : '없음',
        });

        if (!accessToken) {
          throw new Error('액세스 토큰이 없습니다. 로그인이 필요합니다.');
        }

        if (!refreshToken) {
          console.warn('⚠️ 리프레시 토큰이 없습니다.');
        }
      }

      const params: {
        skip?: number;
        limit?: number;
      } = {
        skip: 0,
        limit: 1000, // 전체 데이터 로드 후 클라이언트에서 필터링
      };

      console.log('📡 감사 로그 API 호출 파라미터:', params);
      console.log('🌐 API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/audit-logs`);
      const data = await getAuditLogs(params);
      console.log('✅ 감사 로그 API 응답:', data);
      setAuditLogs(data);
    } catch (error) {
      console.error('❌ 감사 로그 목록 로드 실패:', error);

      // 더 자세한 오류 정보
      if (error instanceof Error) {
        console.error('📝 오류 메시지:', error.message);
        console.error('🔧 오류 스택:', error.stack);

        // ApiClientError인 경우 추가 정보 표시
        if ('status' in error) {
          const apiError = error as unknown as { status: unknown; data: unknown };
          console.error('📊 HTTP 상태 코드:', apiError.status);
          console.error('📋 응답 데이터:', apiError.data);
        }
      }

      toast({
        title: '감사 로그 목록 로드 실패',
        description: error instanceof Error ? error.message : '감사 로그 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 컴포넌트 마운트 시 감사 로그 목록 로드
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  // itemsPerPage 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, itemsPerPage.toString());
  }, [itemsPerPage]);

  // 페이지 변경 시 currentPage 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedSearchColumn]);

  // 감사 로그 상세 보기
  const handleViewAuditLog = (auditLog: AuditLog) => {
    setSelectedAuditLog(auditLog);
    setIsDetailModalOpen(true);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value, 10));
    setCurrentPage(1); // 첫 페이지로 리셋
    if (typeof window !== 'undefined') {
      localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, String(parseInt(value, 10)));
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  // 인증 상태 확인
  if (!isInitialized || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          로그인이 필요합니다
        </h2>
        <p className="text-muted-foreground text-center">
          감사 로그를 확인하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
        <div className="shrink-0 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">감사 로그</h1>
            <div className="flex items-center gap-2">
              <Button onClick={loadAuditLogs} variant="outline" size="icon" title="새로고침">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </Button>
            </div>
          </div>

          {/* 검색 필터 */}
          <div className="rounded-md border bg-card">
            <div className="p-3">
              <div className="flex gap-3">
                <Select value={selectedSearchColumn} onValueChange={setSelectedSearchColumn}>
                  <SelectTrigger className="w-[180px] h-8 text-sm bg-white">
                    <SelectValue placeholder="검색 컬럼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {searchOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="h-8 text-sm"
                  placeholder="검색어를 입력하세요..."
                  value={searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

      {/* 테이블 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 pt-4">
          <AuditLogTable
            auditLogs={paginatedAuditLogs}
            loading={loading}
            onViewAuditLog={handleViewAuditLog}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredAuditLogs.length}
          />
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
        {!loading && filteredAuditLogs.length > 0 && (() => {
          const totalPages = Math.ceil(filteredAuditLogs.length / itemsPerPage);

          // 페이지 번호 계산 (최대 7개 표시)
          let startPage: number;
          let endPage: number;

          if (totalPages <= 7) {
            // 전체 페이지가 7개 이하면 모두 표시
            startPage = 1;
            endPage = totalPages;
          } else {
            // 현재 페이지 주변 7개 표시
            if (currentPage <= 4) {
              // 앞쪽에 있을 때: 1~7
              startPage = 1;
              endPage = 7;
            } else if (currentPage >= totalPages - 3) {
              // 뒤쪽에 있을 때: 마지막 7개
              startPage = totalPages - 6;
              endPage = totalPages;
            } else {
              // 중간에 있을 때: 현재 페이지 기준 앞뒤 3개씩
              startPage = currentPage - 3;
              endPage = currentPage + 3;
            }
          }

          const pageNumbers = [];
          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }

          return (
            <div className="flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
              {/* 왼쪽: 출력 개수 셀렉트 */}
              <div className="flex items-center gap-2">
                <select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="10">10</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              </div>

              {/* 가운데: 페이지네이션 */}
              <div className="flex items-center justify-center gap-2">
              {/* 맨 처음 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="맨 처음"
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
                  <path d="m11 17-5-5 5-5" />
                  <path d="m18 17-5-5 5-5" />
                </svg>
              </Button>

              {/* 이전 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>

              {/* 페이지 번호 */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-10"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              {/* 다음 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>

              {/* 맨 끝 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="맨 끝"
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
                  <path d="m6 17 5-5-5-5" />
                  <path d="m13 17 5-5-5-5" />
                </svg>
              </Button>
              </div>
            </div>
          );
        })()}
        </div>
      </div>

      {/* 감사 로그 상세 모달 */}
      {selectedAuditLog && (
        <AuditLogDetailModal
          auditLog={selectedAuditLog}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
        />
      )}
    </div>
  );
}