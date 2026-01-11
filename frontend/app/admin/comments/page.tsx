/**
 * 댓글 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentTable } from '@/components/admin/comment/CommentTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { commentApi } from '@/lib/api/comments';
import type { Comment } from '@/lib/api/comments';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_comments_items_per_page';

export default function CommentsPage() {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('content');
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

  // 댓글 목록 로드 (전체 목록 가져오기)
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      // 전체 댓글 목록 가져오기 (필터링을 위해) - limit 최대값 200
      const data = await commentApi.getAllComments({ skip: 0, limit: 200 });
      setComments(data);
    } catch (error) {
      console.error('댓글 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '댓글 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 댓글 숨김
  const handleHide = async (commentId: number) => {
    try {
      await commentApi.hideComment(commentId);
      toast({
        title: '성공',
        description: '댓글이 숨김 처리되었습니다.',
        variant: 'success',
      });
      loadComments(); // 목록 새로고침
    } catch (error) {
      console.error('댓글 숨김 실패:', error);
      toast({
        title: '오류',
        description: '댓글 숨김에 실패했습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // 댓글 표시
  const handleShow = async (commentId: number) => {
    try {
      await commentApi.showComment(commentId);
      toast({
        title: '성공',
        description: '댓글이 표시되었습니다.',
        variant: 'success',
      });
      loadComments(); // 목록 새로고침
    } catch (error) {
      console.error('댓글 표시 실패:', error);
      toast({
        title: '오류',
        description: '댓글 표시에 실패했습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId: number) => {
    try {
      await commentApi.deleteComment(commentId);
      toast({
        title: '성공',
        description: '댓글이 삭제되었습니다.',
        variant: 'success',
      });
      loadComments(); // 목록 새로고침
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      toast({
        title: '오류',
        description: '댓글 삭제에 실패했습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 검색 필터링
  const filteredComments = comments.filter((comment) => {
    // 상태 필터
    if (statusFilter !== 'all' && comment.stts !== statusFilter) {
      return false;
    }

    // 검색 필터
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'content':
        return comment.cn?.toLowerCase().includes(keyword);
      case 'author':
        return (comment.author_nickname || comment.user_id)?.toLowerCase().includes(keyword);
      case 'post_title':
        return comment.post_title?.toLowerCase().includes(keyword);
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
          <h1 className="text-xl font-bold tracking-tight">댓글 관리</h1>
          <div className="flex items-center gap-2">
            <Button onClick={loadComments} variant="outline" size="icon" title="새로고침">
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
                  <SelectItem value="PUBLISHED">표시됨</SelectItem>
                  <SelectItem value="HIDDEN">숨김</SelectItem>
                  <SelectItem value="DELETED">삭제됨</SelectItem>
                  <SelectItem value="SECRET">비밀</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSearchColumn} onValueChange={setSelectedSearchColumn}>
                <SelectTrigger className="w-[180px] h-8 text-sm bg-white">
                  <SelectValue placeholder="검색 컬럼 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">댓글 내용</SelectItem>
                  <SelectItem value="author">작성자</SelectItem>
                  <SelectItem value="post_title">게시글 제목</SelectItem>
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
          <CommentTable
            comments={filteredComments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onHide={handleHide}
            onShow={handleShow}
            onDelete={handleDelete}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredComments.length}
          />
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
          {!loading && filteredComments.length > 0 && (() => {
            const totalPages = Math.ceil(filteredComments.length / itemsPerPage);

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
