/**
 * 게시글 관리 페이지
 */
'use client';

import { useState, useEffect } from 'react';
import { PostTable } from '@/components/admin/post/PostTable';
import { PostFilters } from '@/components/admin/post/PostFilters';
import { BulkActions } from '@/components/admin/post/BulkActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Post, ContentFilters } from '@/types/board';
import { postApi } from '@/lib/api/posts';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [filters, setFilters] = useState<ContentFilters>({
    search_query: '',
    status: 'PUBLISHED',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const { toast } = useToast();

  // 게시글 목록 로드
  const loadPosts = async (page = 1, searchFilters = filters) => {
    try {
      setLoading(true);
      const params = {
        ...searchFilters,
        page,
        limit: pageSize,
      };

      // undefined 값 제거 및 필터링
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined && value !== '')
      );

      const response = await postApi.getPosts(filteredParams as any);
      setPosts(response.posts);
      setTotalCount(response.total_count);
      setCurrentPage(page);
    } catch (error) {
      console.error('게시글 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '게시글 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경
  const handleFiltersChange = (newFilters: Partial<ContentFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setSelectedPosts([]);
    loadPosts(1, updatedFilters);
  };

  // 검색
  const handleSearch = (query: string) => {
    handleFiltersChange({ search_query: query });
  };

  // 새로고침
  const handleRefresh = () => {
    loadPosts(currentPage, filters);
  };

  // 게시글 선택
  const handleSelectPost = (postId: number, selected: boolean) => {
    if (selected) {
      setSelectedPosts(prev => [...prev, postId]);
    } else {
      setSelectedPosts(prev => prev.filter(id => id !== postId));
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedPosts(posts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };

  // 게시글 수정
  const handleUpdatePost = async (postId: number, data: any) => {
    try {
      await postApi.updatePost(postId, data);
      toast({
        title: '성공',
        description: '게시글이 수정되었습니다.',
      });
      loadPosts(currentPage, filters);
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
      setSelectedPosts(prev => prev.filter(id => id !== postId));
      loadPosts(currentPage, filters);
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      toast({
        title: '오류',
        description: '게시글 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 일괄 작업
  const handleBulkAction = async (action: string, targetBoardId?: number) => {
    if (selectedPosts.length === 0) {
      toast({
        title: '오류',
        description: '선택된 게시글이 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 선택된 게시글들에 대해 일괄 작업 수행
      for (const postId of selectedPosts) {
        switch (action) {
          case 'DELETE':
            await postApi.deletePost(postId);
            break;
          case 'HIDE':
            await postApi.updatePost(postId, { stts: 'HIDDEN' });
            break;
          case 'SHOW':
            await postApi.updatePost(postId, { stts: 'PUBLISHED' });
            break;
        }
      }

      toast({
        title: '성공',
        description: `${selectedPosts.length}개의 게시글에 대해 ${action} 작업을 완료했습니다.`,
      });

      setSelectedPosts([]);
      loadPosts(currentPage, filters);
    } catch (error) {
      console.error('일괄 작업 실패:', error);
      toast({
        title: '오류',
        description: '일괄 작업에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    loadPosts(page, filters);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">게시글 관리</h1>
          <p className="text-muted-foreground">
            게시글을 조회, 수정, 삭제하고 콘텐츠를 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
          <CardDescription>
            게시글을 검색하고 필터링하여 원하는 콘텐츠를 찾을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="제목, 내용, 작성자로 검색..."
                value={filters.search_query || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search_query: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(filters.search_query || '')}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleSearch(filters.search_query || '')}>
              검색
            </Button>
          </div>

          <div className="mt-4">
            <PostFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* 일괄 작업 */}
      {selectedPosts.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <BulkActions
              selectedCount={selectedPosts.length}
              onBulkAction={handleBulkAction}
            />
          </CardContent>
        </Card>
      )}

      {/* 게시글 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>게시글 목록</CardTitle>
          <CardDescription>
            총 {totalCount.toLocaleString()}개의 게시글이 있습니다.
            {selectedPosts.length > 0 && ` (${selectedPosts.length}개 선택됨)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostTable
            posts={posts}
            loading={loading}
            selectedPosts={selectedPosts}
            onSelectPost={handleSelectPost}
            onSelectAll={handleSelectAll}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / pageSize)}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
