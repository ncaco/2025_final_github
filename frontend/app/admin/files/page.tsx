/**
 * 파일 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFiles, deleteFile } from '@/lib/api/files';
import type { File } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { FileTable } from '@/components/admin/file/FileTable';
import { FileDetailModal } from '@/components/admin/file/FileDetailModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_files_items_per_page';

export default function FilesPage() {
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('file_nm');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const { toast } = useToast();

  // 검색 옵션
  const searchOptions = [
    { value: 'file_nm', label: '파일명' },
    { value: 'file_id', label: '파일 ID' },
    { value: 'user_id', label: '사용자 ID' },
    { value: 'file_ext', label: '확장자' },
    { value: 'mime_typ', label: 'MIME 타입' },
  ];

  // 파일 목록 로드 (전체 목록 가져오기)
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);

      // 디버깅: 토큰 상태 확인
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        console.log('🔍 파일 API 호출 전 토큰 상태 확인:', {
          accessToken: accessToken ? `있음 (${accessToken.length}자)` : '없음',
          refreshToken: refreshToken ? `있음 (${refreshToken.length}자)` : '없음',
        });

        if (!accessToken) {
          throw new Error('액세스 토큰이 없습니다. 로그인이 필요합니다.');
        }
      }

      console.log('📡 파일 목록 API 호출 시작');
      // 전체 파일 목록 가져오기 (필터링을 위해)
      const allFiles = await getFiles({ skip: 0, limit: 1000 });
      console.log('✅ 파일 목록 API 응답:', allFiles);
      setFiles(allFiles);
    } catch (error) {
      console.error('❌ 파일 목록 로드 실패:', error);

      // 더 자세한 오류 정보
      if (error instanceof Error) {
        console.error('📝 오류 메시지:', error.message);
        console.error('🔧 오류 스택:', error.stack);
      }

      toast({
        title: '오류',
        description: '파일 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 검색 필터링
  const filteredFiles = files.filter((file) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'file_nm':
        return file.file_nm?.toLowerCase().includes(keyword);
      case 'file_id':
        return file.file_id.toLowerCase().includes(keyword);
      case 'user_id':
        return file.user_id.toLowerCase().includes(keyword);
      case 'file_ext':
        return file.file_ext?.toLowerCase().includes(keyword);
      case 'mime_typ':
        return file.mime_typ?.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  // 파일 상세 보기
  const handleViewFile = (file: File) => {
    setSelectedFile(file);
    setIsDetailModalOpen(true);
  };

  // 파일 삭제 확인
  const handleDeleteClick = (file: File) => {
    setFileToDelete(file);
  };

  // 파일 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      await deleteFile(fileToDelete.file_id);
      toast({
        title: '삭제 완료',
        description: '파일이 삭제되었습니다.',
        variant: 'success',
      });
      setFileToDelete(null);
      loadFiles();
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '파일 삭제에 실패했습니다.',
        variant: 'destructive',
      });
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
          파일을 확인하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
        <div className="shrink-0 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">파일 관리</h1>
            <div className="flex items-center gap-2">
              <Button onClick={loadFiles} variant="outline" size="icon" title="새로고침">
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
          <FileTable
            files={filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onViewFile={handleViewFile}
            onDeleteFile={handleDeleteClick}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredFiles.length}
          />
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
        {!loading && filteredFiles.length > 0 && (() => {
          const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

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

          const handleItemsPerPageChange = (value: string) => {
            const newItemsPerPage = parseInt(value, 10);
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1); // 첫 페이지로 리셋
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

      {/* 파일 상세 모달 */}
      {selectedFile && (
        <FileDetailModal
          file={selectedFile}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onFileUpdated={loadFiles}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
        title="파일 삭제"
        description={`${fileToDelete?.file_nm} 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
