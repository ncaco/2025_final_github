/**
 * 내 신고 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Eye, Calendar, ArrowRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { dashboardApi } from '@/lib/api/dashboard';
import { Loading } from '@/components/common/Loading';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 안전한 날짜 포맷팅 함수
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '-';
    }
    return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error, dateString);
    return '-';
  }
};

interface MyReport {
  id: number;
  target_type: 'POST' | 'COMMENT' | 'USER';
  target_id: number;
  target_author_id?: string;
  target_author_nickname?: string;
  rsn: 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';
  dsc?: string;
  stts: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  processed_by?: string;
  prcs_dt?: string;
  crt_dt: string;
}

export default function MyReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<MyReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MyReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const limit = 20;

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getMyReports(page + 1, limit);
      
      console.log('API 응답:', response);
      
      // API 응답이 없거나 items가 없는 경우 처리
      if (!response || !response.items) {
        console.warn('API 응답에 items가 없습니다:', response);
        setReports([]);
        setHasMore(false);
        return;
      }
      
      // API 응답을 MyReport 형식으로 변환
      const reportsData = response.items.map((item: any) => {
        // 상태 매핑 (DashboardReportStatus -> 프론트엔드 형식)
        const statusMap: Record<string, 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'> = {
          'PENDING': 'PENDING',
          'PROCESSING': 'REVIEWED',
          'RESOLVED': 'RESOLVED',
          'REJECTED': 'DISMISSED',
        };
        
        return {
          id: parseInt(item.id) || item.id,
          target_type: (item.target_type || 'POST') as 'POST' | 'COMMENT' | 'USER',
          target_id: item.target_id || 0,
          target_author_id: item.target_author_id || undefined,
          target_author_nickname: item.target_author_nickname || undefined,
          rsn: (item.reason || 'OTHER') as 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER',
          dsc: item.description || undefined,
          stts: (statusMap[item.status] || 'PENDING') as 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED',
          processed_by: item.processed_by || undefined,
          prcs_dt: item.processed_at ? new Date(item.processed_at).toISOString() : undefined,
          crt_dt: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
        } as MyReport;
      });
      
      if (page === 0) {
        setReports(reportsData);
      } else {
        setReports((prev) => [...prev, ...reportsData]);
      }
      
      setHasMore(reportsData.length === limit);
    } catch (error) {
      console.error('신고 로드 실패:', error);
      toast({
        title: '오류',
        description: '신고 내역을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
    setReports([]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleReportClick = (report: MyReport) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: '대기 중', variant: 'outline' },
      REVIEWED: { label: '검토 중', variant: 'default' },
      RESOLVED: { label: '처리 완료', variant: 'default' },
      DISMISSED: { label: '거부됨', variant: 'destructive' },
      PROCESSING: { label: '처리 중', variant: 'default' },
      REJECTED: { label: '거부됨', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'POST':
        return '게시글';
      case 'COMMENT':
        return '댓글';
      case 'USER':
        return '사용자';
      default:
        return type;
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'SPAM':
        return '스팸';
      case 'ABUSE':
        return '욕설/비방';
      case 'INAPPROPRIATE':
        return '부적절한 내용';
      case 'COPYRIGHT':
        return '저작권 침해';
      case 'OTHER':
        return '기타';
      default:
        return reason;
    }
  };

  const filteredReports = searchQuery
    ? reports.filter(
        (report) =>
          getTargetTypeLabel(report.target_type).toLowerCase().includes(searchQuery.toLowerCase()) ||
          getReasonLabel(report.rsn).toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.dsc?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : statusFilter === 'all'
    ? reports
    : reports.filter((report) => report.stts === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 신고</h1>
          <p className="text-muted-foreground">
            신고한 내역을 확인하고 처리 상태를 확인하세요.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{filteredReports.length}</span>개의 신고
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="대상 유형, 신고 사유, 상세 설명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading && page === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '신고한 내역이 없습니다'}
              </p>
              {!searchQuery && (
                <p className="text-sm">
                  부적절한 콘텐츠를 발견하면 신고해주세요.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => handleReportClick(report)}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {getStatusBadge(report.stts)}
                          <span className="ml-2">{getTargetTypeLabel(report.target_type)} #{report.target_id}</span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{getTargetTypeLabel(report.target_type)}</Badge>
                        <Badge variant="secondary">{getReasonLabel(report.rsn)}</Badge>
                      </div>

                      {report.dsc && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {report.dsc}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(report.crt_dt)}</span>
                        </div>
                        {report.processed_by && report.prcs_dt && (
                          <div className="flex items-center gap-1">
                            <span>처리일: {formatDate(report.prcs_dt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                </div>
              ))}

              {/* 더보기 버튼 */}
              {hasMore && !searchQuery && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? '로딩 중...' : '더보기'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 신고 상세 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>신고 상세 정보</DialogTitle>
            <DialogDescription>
              신고 #{selectedReport?.id}의 상세 정보를 확인하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">상태</p>
                  <div className="mt-1">{getStatusBadge(selectedReport.stts)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">대상 유형</p>
                  <p className="mt-1">{getTargetTypeLabel(selectedReport.target_type)}</p>
                </div>
                {selectedReport.target_author_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">작성자</p>
                    <p className="mt-1">
                      {selectedReport.target_author_nickname}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">신고 사유</p>
                  <p className="mt-1">{getReasonLabel(selectedReport.rsn)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">신고일시</p>
                  <p className="mt-1">{formatDate(selectedReport.crt_dt)}</p>
                </div>
                {selectedReport.processed_by && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">처리자</p>
                    <p className="mt-1">{selectedReport.processed_by}</p>
                  </div>
                )}
                {selectedReport.prcs_dt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">처리일시</p>
                    <p className="mt-1">{formatDate(selectedReport.prcs_dt)}</p>
                  </div>
                )}
              </div>
              {selectedReport.dsc && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">상세 설명</p>
                  <p className="p-3 bg-muted rounded-md">{selectedReport.dsc}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
