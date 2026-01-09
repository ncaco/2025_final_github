/**
 * 내 팔로우 페이지 (팔로우한 게시판)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, ArrowRight, Search, Users, MessageSquareIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { userContentApi } from '@/lib/api/reports';
import { Loading } from '@/components/common/Loading';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

interface FollowedBoard {
  id: number;
  nm: string;
  dsc?: string;
  typ: string;
  post_count: number;
  follower_count: number;
  followed_at?: string;
}

export default function MyFollowsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [followedBoards, setFollowedBoards] = useState<FollowedBoard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const loadFollowedBoards = useCallback(async () => {
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

      const response = await userContentApi.getUserFollowedBoards(undefined, params);
      
      if (page === 0) {
        setFollowedBoards(response);
      } else {
        setFollowedBoards((prev) => [...prev, ...response]);
      }

      setHasMore(response.length === limit);
    } catch (error) {
      console.error('팔로우한 게시판 로드 실패:', error);
      toast({
        title: '오류',
        description: '팔로우한 게시판을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, toast]);

  useEffect(() => {
    if (user) {
      loadFollowedBoards();
    }
  }, [user, loadFollowedBoards]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleBoardClick = (board: FollowedBoard) => {
    router.push(`/boards/${board.id}`);
  };

  const filteredBoards = searchQuery
    ? followedBoards.filter(
        (board) =>
          board.nm.toLowerCase().includes(searchQuery.toLowerCase()) ||
          board.dsc?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : followedBoards;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 팔로우</h1>
          <p className="text-muted-foreground">
            팔로우한 게시판을 확인하고 관리하세요.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          총 <span className="font-semibold text-foreground">{filteredBoards.length}</span>개의 게시판
        </div>
      </div>

      {/* 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="게시판명, 설명으로 검색..."
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
          ) : filteredBoards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '팔로우한 게시판이 없습니다'}
              </p>
              {!searchQuery && (
                <p className="text-sm">
                  관심 있는 게시판을 팔로우해보세요!
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBoards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => handleBoardClick(board)}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {board.nm}
                        </h3>
                      </div>

                      {board.dsc && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {board.dsc}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquareIcon className="h-4 w-4" />
                          <span>게시글 {board.post_count}개</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>팔로워 {board.follower_count}명</span>
                        </div>
                        {board.followed_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              팔로우: {format(new Date(board.followed_at), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                            </span>
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
    </div>
  );
}
