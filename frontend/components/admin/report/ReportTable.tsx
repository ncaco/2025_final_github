/**
 * 신고 테이블 컴포넌트
 */
'use client';

import { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { Report } from '@/lib/api/reports';
import { Loading } from '@/components/common/Loading';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Link from 'next/link';

interface ReportTableProps {
  reports: Report[];
  loading: boolean;
  onResolve: (reportId: number) => Promise<void>;
  onDismiss: (reportId: number) => Promise<void>;
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
}

export function ReportTable({ 
  reports, 
  loading, 
  onResolve, 
  onDismiss, 
  currentPage = 1, 
  itemsPerPage = 10, 
  totalCount = 0 
}: ReportTableProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

  const getStatusBadge = (status: Report['stts']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">대기 중</Badge>;
      case 'REVIEWED':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">검토 중</Badge>;
      case 'RESOLVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">처리 완료</Badge>;
      case 'DISMISSED':
        return <Badge variant="destructive">거부됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTargetTypeLabel = (type: Report['target_type']) => {
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

  const getReasonLabel = (reason: Report['rsn']) => {
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

  const getTargetLink = (report: Report) => {
    if (report.target_type === 'POST') {
      return `/boards/posts/${report.target_id}`;
    } else if (report.target_type === 'COMMENT') {
      return `#`;
    } else if (report.target_type === 'USER') {
      return `/profile?user=${report.target_id}`;
    }
    return '#';
  };

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const handleResolve = async (report: Report) => {
    await onResolve(report.id);
    setIsDetailModalOpen(false);
  };

  const handleDismiss = async (report: Report) => {
    await onDismiss(report.id);
    setIsDetailModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        신고 내역이 없습니다.
      </div>
    );
  }

  return (
    <>
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
              <col className="w-[100px]" />
              <col className="w-[120px]" />
              <col className="w-[150px]" />
              <col className="w-[150px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
            </colgroup>
            <thead className="bg-background">
              <tr>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">번호</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">상태</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">대상 유형</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">신고 사유</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">신고자</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">대상</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">신고일시</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">작업</th>
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
              <col className="w-[100px]" />
              <col className="w-[120px]" />
              <col className="w-[150px]" />
              <col className="w-[150px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
            </colgroup>
            <tbody>
              {reports.map((report, index) => {
                // 역순 번호 계산
                const rowNumber = totalCount > 0
                  ? totalCount - (currentPage - 1) * itemsPerPage - index
                  : (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={report.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-1 border text-center align-middle">{rowNumber}</td>
                    <td className="p-1 border text-center align-middle">
                      {getStatusBadge(report.stts)}
                    </td>
                    <td className="p-1 border text-center align-middle">
                      <Badge variant="outline">{getTargetTypeLabel(report.target_type)}</Badge>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      <Badge variant="secondary">{getReasonLabel(report.rsn)}</Badge>
                    </td>
                    <td className="p-1 border align-middle">
                      <div className="text-sm">{report.reporter_id}</div>
                    </td>
                    <td className="p-1 border align-middle">
                      <div className="text-sm">
                        {report.target_type === 'POST' ? (
                          <div>
                            {report.board_nm ? (
                              <div className="font-medium">{report.board_nm}</div>
                            ) : (
                              <div className="text-muted-foreground">게시판 정보 없음</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {getTargetTypeLabel(report.target_type)} #{report.target_id}
                            </div>
                          </div>
                        ) : report.target_type === 'USER' ? (
                          <Link href={getTargetLink(report)} className="text-blue-600 hover:underline">
                            {getTargetTypeLabel(report.target_type)} #{report.target_id}
                          </Link>
                        ) : (
                          <span>{getTargetTypeLabel(report.target_type)} #{report.target_id}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      <div className="text-xs">
                        {new Date(report.crt_dt).toLocaleDateString('ko-KR')}
                      </div>
                    </td>
                    <td className="p-1 border text-center align-middle w-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetail(report)}>
                            <Eye className="mr-2 h-4 w-4" />
                            상세
                          </DropdownMenuItem>
                          {report.stts === 'PENDING' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleResolve(report)}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                처리
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDismiss(report)}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                거부
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                <div>
                  <p className="text-sm font-medium text-muted-foreground">신고자</p>
                  <p className="mt-1">{selectedReport.reporter_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">신고 사유</p>
                  <p className="mt-1">{getReasonLabel(selectedReport.rsn)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">대상 ID</p>
                  <p className="mt-1">
                    <Link href={getTargetLink(selectedReport)} className="text-blue-600 hover:underline">
                      {selectedReport.target_id}
                    </Link>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">신고일시</p>
                  <p className="mt-1">{new Date(selectedReport.crt_dt).toLocaleString('ko-KR')}</p>
                </div>
              </div>
              {selectedReport.dsc && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">상세 설명</p>
                  <p className="p-3 bg-muted rounded-md">{selectedReport.dsc}</p>
                </div>
              )}
              {selectedReport.processed_by && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">처리자</p>
                    <p className="mt-1">{selectedReport.processed_by}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">처리일시</p>
                    <p className="mt-1">
                      {selectedReport.prcs_dt ? new Date(selectedReport.prcs_dt).toLocaleString('ko-KR') : '-'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedReport && selectedReport.stts === 'PENDING' && (
              <>
                <Button
                  variant="default"
                  onClick={() => handleResolve(selectedReport)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  처리 완료
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDismiss(selectedReport)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  거부
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
