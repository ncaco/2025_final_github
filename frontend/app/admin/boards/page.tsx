/**
 * 게시판 관리 페이지
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { BoardTable } from '@/components/admin/board/BoardTable';
import { BoardCreateModal } from '@/components/admin/board/BoardCreateModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Board } from '@/types/board';
import { boardApi } from '@/lib/api/boards';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_boards_items_per_page';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('nm');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // 게시판 목록 로드 (전체 목록 가져오기)
  const loadBoards = useCallback(async () => {
    try {
      setLoading(true);
      // 전체 게시판 목록 가져오기 (필터링을 위해)
      const data = await boardApi.getBoards();
      setBoards(data);
    } catch (error) {
      console.error('게시판 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '게시판 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 게시판 생성
  const handleCreateBoard = async (boardData: any) => {
    try {
      await boardApi.createBoard(boardData);
      toast({
        title: '성공',
        description: '게시판이 생성되었습니다.',
      });
      setCreateModalOpen(false);
      loadBoards(); // 목록 새로고침
    } catch (error) {
      console.error('게시판 생성 실패:', error);
      toast({
        title: '오류',
        description: '게시판 생성에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 게시판 수정
  const handleUpdateBoard = async (boardId: number, boardData: any) => {
    try {
      await boardApi.updateBoard(boardId, boardData);
      toast({
        title: '성공',
        description: '게시판이 수정되었습니다.',
      });
      loadBoards(); // 목록 새로고침
    } catch (error) {
      console.error('게시판 수정 실패:', error);
      toast({
        title: '오류',
        description: '게시판 수정에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 게시판 삭제
  const handleDeleteBoard = async (boardId: number) => {
    try {
      await boardApi.deleteBoard(boardId);
      toast({
        title: '성공',
        description: '게시판이 삭제되었습니다.',
      });
      loadBoards(); // 목록 새로고침
    } catch (error) {
      console.error('게시판 삭제 실패:', error);
      toast({
        title: '오류',
        description: '게시판 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  // 검색 필터링
  const filteredBoards = boards.filter((board) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'nm':
        return board.nm?.toLowerCase().includes(keyword);
      case 'dsc':
        return board.dsc?.toLowerCase().includes(keyword);
      case 'typ':
        return board.typ?.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
        <div className="shrink-0 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">게시판 관리</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                게시판 생성
              </Button>
              <Button onClick={loadBoards} variant="outline" size="icon" title="새로고침">
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
                    <SelectItem value="nm">게시판명</SelectItem>
                    <SelectItem value="dsc">설명</SelectItem>
                    <SelectItem value="typ">유형</SelectItem>
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
          <BoardTable
            boards={filteredBoards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onUpdate={handleUpdateBoard}
            onDelete={handleDeleteBoard}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredBoards.length}
          />
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
        {!loading && filteredBoards.length > 0 && (() => {
          const totalPages = Math.ceil(filteredBoards.length / itemsPerPage);

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

      {/* 게시판 생성 모달 */}
      <BoardCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
}
