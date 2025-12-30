/**
 * 리프레시 토큰 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getRefreshTokens, deleteRefreshToken, revokeRefreshToken } from '@/lib/api/refreshTokens';
import type { RefreshToken } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_refresh_tokens_items_per_page';

export default function RefreshTokensPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [refreshTokens, setRefreshTokens] = useState<RefreshToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('user_id');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [tokenToDelete, setTokenToDelete] = useState<RefreshToken | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<RefreshToken | null>(null);
  const { toast } = useToast();

  // 디바이스 정보 포맷팅
  const formatDeviceInfo = (dvcInfo: string | null | undefined): string => {
    if (!dvcInfo || dvcInfo === 'unknown') return '알 수 없음';

    // 디바이스 정보를 파싱하여 간단하게 표시
    const parts = dvcInfo.split(' | ');
    if (parts.length >= 2) {
      const [browser, os] = parts;
      const deviceType = parts.find(p => p === 'Mobile' || p === 'Desktop') || '';
      return `${browser} • ${os} ${deviceType ? `(${deviceType})` : ''}`.trim();
    }

    return dvcInfo.length > 30 ? `${dvcInfo.substring(0, 30)}...` : dvcInfo;
  };

  // 검색 옵션
  const searchOptions = [
    { value: 'user_id', label: '사용자 ID' },
    { value: 'refresh_token_id', label: '토큰 ID' },
    { value: 'ip_addr', label: 'IP 주소' },
  ];

  // 상태 옵션
  const statusOptions = [
    { value: 'all', label: '모든 상태' },
    { value: 'active', label: '활성' },
    { value: 'revoked', label: '취소됨' },
    { value: 'expired', label: '만료됨' },
  ];

  // 리프레시 토큰 데이터 로드
  const loadRefreshTokensData = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        skip: 0,
        limit: 1000,
      };

      if (selectedStatus !== 'all') {
        if (selectedStatus === 'active') {
          params.rvk_yn = false;
          params.use_yn = true;
        } else if (selectedStatus === 'revoked') {
          params.rvk_yn = true;
        }
      }

      const data = await getRefreshTokens(params);
      setRefreshTokens(data);
    } catch (error) {
      console.error('❌ 리프레시 토큰 데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '리프레시 토큰 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, toast]);

  useEffect(() => {
    loadRefreshTokensData();
  }, [loadRefreshTokensData]);

  // 검색 필터링
  const filteredTokens = refreshTokens.filter((token) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'user_id':
        return token.user_id?.toLowerCase().includes(keyword);
      case 'refresh_token_id':
        return token.refresh_token_id?.toLowerCase().includes(keyword);
      case 'ip_addr':
        return token.ip_addr?.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  // 토큰 취소 확인
  const handleRevokeClick = (token: RefreshToken) => {
    setTokenToRevoke(token);
  };

  // 토큰 취소 실행
  const handleRevokeConfirm = async () => {
    if (!tokenToRevoke) return;

    try {
      await revokeRefreshToken(tokenToRevoke.refresh_token_id);
      toast({
        title: '토큰 취소 완료',
        description: '리프레시 토큰이 취소되었습니다.',
        variant: 'success',
      });
      setTokenToRevoke(null);
      loadRefreshTokensData();
    } catch (error) {
      console.error('토큰 취소 실패:', error);
      toast({
        title: '토큰 취소 실패',
        description: error instanceof Error ? error.message : '토큰 취소에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 토큰 삭제 확인
  const handleDeleteClick = (token: RefreshToken) => {
    setTokenToDelete(token);
  };

  // 토큰 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!tokenToDelete) return;

    try {
      await deleteRefreshToken(tokenToDelete.refresh_token_id);
      toast({
        title: '토큰 삭제 완료',
        description: '리프레시 토큰이 삭제되었습니다.',
        variant: 'success',
      });
      setTokenToDelete(null);
      loadRefreshTokensData();
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
      toast({
        title: '토큰 삭제 실패',
        description: error instanceof Error ? error.message : '토큰 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  // 토큰 상태 계산
  const getTokenStatus = (token: RefreshToken) => {
    const now = new Date();
    const exprDate = new Date(token.expr_dt);

    if (token.rvk_yn) return '취소됨';
    if (now > exprDate) return '만료됨';
    return '활성';
  };

  const getTokenStatusVariant = (token: RefreshToken) => {
    const status = getTokenStatus(token);
    switch (status) {
      case '활성': return 'default';
      case '취소됨': return 'destructive';
      case '만료됨': return 'secondary';
      default: return 'outline';
    }
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
          토큰 관리를 확인하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">토큰 관리</h1>
          <div className="flex items-center gap-2">
            <Button onClick={loadRefreshTokensData} variant="outline" size="icon" title="새로고침">
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

        {/* 필터 및 검색 */}
        <div className="rounded-md border bg-card">
          <div className="p-3">
            <div className="flex gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-white">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSearchColumn} onValueChange={setSelectedSearchColumn}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-white">
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

      {/* 리프레시 토큰 목록 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTokens
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((token) => (
                  <div
                    key={token.refresh_token_id}
                    className="rounded-md border bg-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium font-mono text-sm">{token.refresh_token_id}</h3>
                          <p className="text-sm text-muted-foreground">사용자: {token.user_id}</p>
                          <p className="text-xs text-muted-foreground">
                            IP: {token.ip_addr || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            디바이스: {formatDeviceInfo(token.dvc_info)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs text-muted-foreground">
                          <div>생성: {new Date(token.crt_dt).toLocaleDateString('ko-KR')}</div>
                          <div>만료: {new Date(token.expr_dt).toLocaleDateString('ko-KR')}</div>
                          {token.last_use_dt && (
                            <div>최종사용: {new Date(token.last_use_dt).toLocaleDateString('ko-KR')}</div>
                          )}
                          {token.rvk_yn && token.rvk_dt && (
                            <div className="text-red-600">취소: {new Date(token.rvk_dt).toLocaleDateString('ko-KR')}</div>
                          )}
                        </div>
                        <Badge variant={getTokenStatusVariant(token)} className="text-xs">
                          {getTokenStatus(token)}
                        </Badge>
                        {!token.rvk_yn && new Date() <= new Date(token.expr_dt) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeClick(token)}
                            className="h-8 px-3 text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                            title="토큰 취소"
                          >
                            취소
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(token)}
                          className="h-8 w-8 text-destructive hover:text-destructive border-destructive"
                          title="삭제"
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="py-4">
          {!loading && filteredTokens.length > 0 && (() => {
            const totalPages = Math.ceil(filteredTokens.length / itemsPerPage);

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

                <div className="flex items-center justify-center gap-2">
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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </Button>

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

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </Button>

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

      {/* 토큰 취소 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!tokenToRevoke}
        onOpenChange={(open) => !open && setTokenToRevoke(null)}
        title="토큰 취소"
        description={`${tokenToRevoke ? `토큰 ${tokenToRevoke.refresh_token_id.slice(-8)}...을 취소하시겠습니까? 취소된 토큰은 더 이상 사용할 수 없습니다.` : ''}`}
        confirmText="취소"
        cancelText="닫기"
        variant="default"
        onConfirm={handleRevokeConfirm}
      />

      {/* 토큰 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!tokenToDelete}
        onOpenChange={(open) => !open && setTokenToDelete(null)}
        title="토큰 삭제"
        description={`${tokenToDelete ? `토큰 ${tokenToDelete.refresh_token_id.slice(-8)}...을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.` : ''}`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
