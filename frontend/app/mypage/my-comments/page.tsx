/**
 * 내 댓글 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Calendar, ArrowRight, Search, Heart, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { userContentApi } from '@/lib/api/reports';
import { Loading } from '@/components/common/Loading';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

interface MyComment {
  id: number;
  post_id: number;
  board_id: number;
  user_id: string;
  cn: string;
  parent_id?: number;
  scr_yn: boolean;
  stts: 'PUBLISHED' | 'DELETED' | 'HIDDEN' | 'SECRET';
  lk_cnt: number;
  depth: number;
  sort_order: number;
  crt_dt: string;
  upd_dt?: string;
  post_title?: string;
  board_nm?: string;
}

export default function MyCommentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const loadComments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params: {
        skip?: number;
        limit?: number;
      } = {
        skip: page * limit,
        limit: limit,
      };

      const response = await userContentApi.getUserComments(undefined, params);
      
      if (page === 0) {
        setComments(response);
      } else {
        setComments((prev) => [...prev, ...response]);
      }

      setHasMore(response.length === limit);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
      toast({
        title: '오류',
        description: '댓글을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, toast]);

  useEffect(() => {
    if (user) {
      loadComments();
    }
  }, [user, loadComments]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleCommentClick = (comment: MyComment) => {
    router.push(`/boards/${comment.board_id}/posts/${comment.post_id}`);
  };

  const filteredComments = searchQuery
    ? comments.filter(
        (comment) =>
          comment.cn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.post_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.board_nm?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : comments;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PUBLISHED: { label: '게시됨', variant: 'default' },
      DELETED: { label: '삭제됨', variant: 'destructive' },
      HIDDEN: { label: '숨김', variant: 'outline' },
      SECRET: { label: '비밀댓글', variant: 'outline' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 댓글</h1>
          <p className="text-muted-foreground">
            작성한 댓글을 확인하고 관리하세요.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{filteredComments.length}</span>개의 댓글
        </div>
      </div>

      {/* 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="댓글 내용, 게시글 제목, 게시판명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading && page === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '작성한 댓글이 없습니다'}
              </p>
              {!searchQuery && (
                <p className="text-sm">
                  첫 댓글을 작성해보세요!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  onClick={() => handleCommentClick(comment)}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* 댓글 내용 */}
                      <div className="mb-3">
                        <p className="text-sm text-foreground line-clamp-3">
                          {comment.scr_yn ? (
                            <span className="text-muted-foreground italic">비밀댓글입니다</span>
                          ) : (
                            comment.cn
                          )}
                        </p>
                      </div>

                      {/* 게시글 정보 */}
                      <div className="mb-3 p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {comment.post_title || '게시글 제목 없음'}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{comment.board_nm || '게시판'}</span>
                        </div>
                      </div>

                      {/* 메타 정보 */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {comment.depth > 0 && (
                          <Badge variant="outline" className="text-xs">
                            대댓글
                          </Badge>
                        )}
                        {comment.scr_yn && (
                          <Badge variant="outline" className="text-xs">
                            비밀댓글
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{comment.lk_cnt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(comment.crt_dt), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                          </span>
                        </div>
                        {getStatusBadge(comment.stts)}
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
