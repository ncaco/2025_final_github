/**
 * 신고 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReportTable } from '@/components/admin/report/ReportTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { reportApi } from '@/lib/api/reports';
import type { Report } from '@/lib/api/reports';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_reports_items_per_page';

export default function ReportsPage() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('reporter_id');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);

  // 신고 목록 로드 (전체 목록 가져오기)
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      // 전체 신고 목록 가져오기 (필터링을 위해)
      const data = await reportApi.getReports({ skip: 0, limit: 1000 });
      setReports(data);
    } catch (error) {
      console.error('신고 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '신고 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 신고 처리
  const handleResolve = async (reportId: number) => {
    try {
      await reportApi.resolveReport(reportId);
      toast({
        title: '성공',
        description: '신고가 처리되었습니다.',
        variant: 'success',
      });
      loadReports(); // 목록 새로고침
    } catch (error) {
      console.error('신고 처리 실패:', error);
      toast({
        title: '오류',
        description: '신고 처리에 실패했습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // 신고 거부
  const handleDismiss = async (reportId: number) => {
    try {
      await reportApi.dismissReport(reportId);
      toast({
        title: '성공',
        description: '신고가 거부되었습니다.',
        variant: 'success',
      });
      loadReports(); // 목록 새로고침
    } catch (error) {
      console.error('신고 거부 실패:', error);
      toast({
        title: '오류',
        description: '신고 거부에 실패했습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // 검색 필터링
  const filteredReports = reports.filter((report) => {
    // 상태 필터
    if (statusFilter !== 'all' && report.stts !== statusFilter) {
      return false;
    }

    // 검색 필터
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'reporter_id':
        return report.reporter_id?.toLowerCase().includes(keyword);
      case 'target_id':
        return String(report.target_id).includes(keyword);
      case 'description':
        return report.dsc?.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">신고 관리</h1>
          <div className="flex items-center gap-2">
            <Button onClick={loadReports} variant="outline" size="icon" title="새로고침">
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
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[180px] h-8 text-sm bg-white">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="PENDING">대기 중</SelectItem>
                  <SelectItem value="REVIEWED">검토 중</SelectItem>
                  <SelectItem value="RESOLVED">처리 완료</SelectItem>
                  <SelectItem value="DISMISSED">거부됨</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSearchColumn} onValueChange={setSelectedSearchColumn}>
                <SelectTrigger className="w-[180px] h-8 text-sm bg-white">
                  <SelectValue placeholder="검색 컬럼 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reporter_id">신고자 ID</SelectItem>
                  <SelectItem value="target_id">대상 ID</SelectItem>
                  <SelectItem value="description">상세 설명</SelectItem>
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
          <ReportTable
            reports={filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredReports.length}
          />
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
          {!loading && filteredReports.length > 0 && (() => {
            const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

            // 페이지 번호 계산 (최대 7개 표시)
            let startPage: number;
            let endPage: number;

            if (totalPages <= 7) {
              startPage = 1;
              endPage = totalPages;
            } else {
              if (currentPage <= 4) {
                startPage = 1;
                endPage = 7;
              } else if (currentPage >= totalPages - 3) {
                startPage = totalPages - 6;
                endPage = totalPages;
              } else {
                startPage = currentPage - 3;
                endPage = currentPage + 3;
              }
            }

            const pageNumbers = [];
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(i);
            }

            const handleItemsPerPageChange = (value: string) => {
              const newItemsPerPage = parseInt(value, 10);
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
              if (typeof window !== 'undefined') {
                localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, String(newItemsPerPage));
              }
            };

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
    </div>
  );
}
