/**
 * 내 게시글 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, MessageSquare, Calendar, ArrowRight, Search, Heart } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { userContentApi } from '@/lib/api/reports';
import { Loading } from '@/components/common/Loading';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

interface MyPost {
  id: number;
  board_id: number;
  category_id?: number;
  user_id: string;
  ttl: string;
  cn: string;
  smmry?: string;
  stts: 'PUBLISHED' | 'DRAFT' | 'DELETED' | 'HIDDEN' | 'SECRET';
  ntce_yn: boolean;
  scr_yn: boolean;
  vw_cnt: number;
  lk_cnt: number;
  cmt_cnt: number;
  att_cnt: number;
  pbl_dt: string;
  crt_dt: string;
  upd_dt?: string;
  category_nm?: string;
  board_nm?: string;
}

export default function MyPostsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const loadPosts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params: {
        status?: string;
        skip?: number;
        limit?: number;
      } = {
        skip: page * limit,
        limit: limit,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await userContentApi.getUserPosts(undefined, params);
      
      if (page === 0) {
        setPosts(response);
      } else {
        setPosts((prev) => [...prev, ...response]);
      }

      setHasMore(response.length === limit);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      toast({
        title: '오류',
        description: '게시글을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter, page, limit, toast]);

  useEffect(() => {
    if (user) {
      loadPosts();
    }
  }, [user, loadPosts]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
    setPosts([]);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePostClick = (post: MyPost) => {
    router.push(`/boards/${post.board_id}/posts/${post.id}`);
  };

  const filteredPosts = searchQuery
    ? posts.filter(
        (post) =>
          post.ttl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.cn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.board_nm?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PUBLISHED: { label: '게시됨', variant: 'default' },
      DRAFT: { label: '임시저장', variant: 'secondary' },
      DELETED: { label: '삭제됨', variant: 'destructive' },
      HIDDEN: { label: '숨김', variant: 'outline' },
      SECRET: { label: '비밀글', variant: 'outline' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 게시글</h1>
          <p className="text-muted-foreground">
            작성한 게시글을 확인하고 관리하세요.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{filteredPosts.length}</span>개의 게시글
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="제목, 내용, 게시판명으로 검색..."
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
            <SelectItem value="PUBLISHED">게시됨</SelectItem>
            <SelectItem value="DRAFT">임시저장</SelectItem>
            <SelectItem value="HIDDEN">숨김</SelectItem>
            <SelectItem value="DELETED">삭제됨</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading && page === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '작성한 게시글이 없습니다'}
              </p>
              {!searchQuery && (
                <p className="text-sm">
                  첫 게시글을 작성해보세요!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {post.ntce_yn && (
                            <Badge variant="secondary" className="mr-2">
                              공지
                            </Badge>
                          )}
                          {post.scr_yn && (
                            <Badge variant="outline" className="mr-2">
                              <FileText className="h-3 w-3 mr-1" />
                              비밀글
                            </Badge>
                          )}
                          {post.ttl}
                        </h3>
                      </div>

                      {post.smmry && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.smmry}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{post.board_nm || '게시판'}</span>
                        </div>
                        {post.category_nm && (
                          <Badge variant="outline" className="text-xs">
                            {post.category_nm}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.vw_cnt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.lk_cnt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.cmt_cnt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(post.crt_dt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                          </span>
                        </div>
                        {getStatusBadge(post.stts)}
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
    </div>
  );
}
