/**
 * 게시글 관리 페이지
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostTable } from '@/components/admin/post/PostTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { Post } from '@/types/board';
import { postApi } from '@/lib/api/posts';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_posts_items_per_page';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('ttl');
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

  // 게시글 목록 로드 (전체 목록 가져오기)
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      // 전체 게시글 목록 가져오기 (필터링을 위해) - 여러 페이지로 나눠서 가져오기
      let allPosts: Post[] = [];
      let currentPageNum = 1;
      let totalCount = 0;
      const pageSize = 10; // 한 번에 가져올 개수 (백엔드 제한 고려 - 안전하게 10으로 설정)
      
      // 첫 번째 요청으로 전체 개수 확인
      const firstResponse = await postApi.getAllPosts({
        page: 1,
        limit: pageSize,
      });
      totalCount = firstResponse.total_count;
      allPosts = [...firstResponse.posts];
      
      // 나머지 페이지 가져오기
      const totalPages = Math.ceil(totalCount / pageSize);
      while (currentPageNum < totalPages) {
        currentPageNum++;
        try {
          const response = await postApi.getAllPosts({
            page: currentPageNum,
            limit: pageSize,
          });
          allPosts = [...allPosts, ...response.posts];
        } catch (pageError: any) {
          console.error(`페이지 ${currentPageNum} 로드 실패:`, pageError);
          // 개별 페이지 실패 시 계속 진행
          break;
        }
      }
      
      setPosts(allPosts);
    } catch (error: any) {
      console.error('게시글 목록 로드 실패:', error);
      
      // error.data를 JSON으로 변환하여 전체 내용 확인
      const errorDataStr = error?.data ? JSON.stringify(error.data, null, 2) : '없음';
      console.error('오류 상세:', {
        status: error?.status,
        statusText: error?.statusText,
        data: errorDataStr,
        message: error?.message,
      });
      console.error('전체 error.data:', error?.data);
      
      // 오류 메시지 추출 (배열 형태의 validation 오류 처리)
      let errorMessage = '게시글 목록을 불러오는데 실패했습니다.';
      
      // error.data가 빈 객체가 아닌 경우에만 처리
      if (error?.data && Object.keys(error.data).length > 0) {
        if (error.data.detail) {
          if (Array.isArray(error.data.detail)) {
            // FastAPI validation 오류 배열인 경우
            const firstError = error.data.detail[0];
            if (firstError?.msg) {
              errorMessage = `${firstError.msg} (위치: ${firstError.loc?.join('.') || '알 수 없음'})`;
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            } else {
              errorMessage = `Validation 오류: ${JSON.stringify(firstError)}`;
            }
          } else if (typeof error.data.detail === 'string') {
            errorMessage = error.data.detail;
          } else if (error.data.detail) {
            errorMessage = `오류: ${JSON.stringify(error.data.detail)}`;
          }
        } else if (error.data.message) {
          errorMessage = typeof error.data.message === 'string' ? error.data.message : JSON.stringify(error.data.message);
        } else {
          errorMessage = `서버 오류: ${JSON.stringify(error.data)}`;
        }
      } else if (error?.status === 422) {
        errorMessage = '요청 파라미터가 올바르지 않습니다. 백엔드 서버를 재시작해주세요. (limit 파라미터 제한 확인 필요)';
      } else if (error?.message) {
        errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
      } else if (error?.statusText) {
        errorMessage = error.statusText;
      }
      
      toast({
        title: `오류 (${error?.status || '알 수 없음'})`,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 게시글 수정
  const handleUpdatePost = async (postId: number, data: any) => {
    try {
      await postApi.updatePost(postId, data);
      toast({
        title: '성공',
        description: '게시글이 수정되었습니다.',
      });
      loadPosts(); // 목록 새로고침
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      toast({
        title: '오류',
        description: '게시글 수정에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    try {
      await postApi.deletePost(postId);
      toast({
        title: '성공',
        description: '게시글이 삭제되었습니다.',
      });
      loadPosts(); // 목록 새로고침
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      toast({
        title: '오류',
        description: '게시글 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 검색 필터링
  const filteredPosts = posts.filter((post) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'ttl':
        return post.ttl?.toLowerCase().includes(keyword);
      case 'cn':
        return post.cn?.toLowerCase().includes(keyword);
      case 'author_nickname':
        return post.author_nickname?.toLowerCase().includes(keyword);
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
            <h1 className="text-xl font-bold tracking-tight">게시글 관리</h1>
            <div className="flex items-center gap-2">
              <Button onClick={loadPosts} variant="outline" size="icon" title="새로고침">
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
                    <SelectItem value="ttl">제목</SelectItem>
                    <SelectItem value="cn">내용</SelectItem>
                    <SelectItem value="author_nickname">작성자</SelectItem>
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
          <PostTable
            posts={filteredPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredPosts.length}
          />
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
        {!loading && filteredPosts.length > 0 && (() => {
          const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

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
    </div>
  );
}
