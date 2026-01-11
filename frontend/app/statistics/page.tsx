/**
 * 통계 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, MessageSquare, Users, Eye, Heart, BarChart3 } from 'lucide-react';
import { statisticsApi } from '@/lib/api/reports';
import { useToast } from '@/hooks/useToast';
import type { BoardStatistics, PopularPost, UserActivityStats } from '@/lib/api/reports';
import Link from 'next/link';

export default function StatisticsPage() {
  const { toast } = useToast();
  const [boardStats, setBoardStats] = useState<BoardStatistics[]>([]);
  const [popularPosts, setPopularPosts] = useState<PopularPost[]>([]);
  const [userActivityStats, setUserActivityStats] = useState<UserActivityStats[]>([]);
  const [loading, setLoading] = useState(true);

  // 통계 데이터 로드
  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [boards, popular, users] = await Promise.all([
        statisticsApi.getBoardStatistics(),
        statisticsApi.getPopularPosts(10),
        statisticsApi.getUserActivityStats(),
      ]);
      setBoardStats(boards);
      setPopularPosts(popular);
      setUserActivityStats(users);
    } catch (error) {
      console.error('통계 로드 실패:', error);
      toast({
        title: '오류',
        description: '통계 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            통계
          </h1>
          <p className="text-muted-foreground mt-1">
            플랫폼의 통계 정보를 확인하세요
          </p>
        </div>

        {/* 게시판별 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              게시판별 통계
            </CardTitle>
            <CardDescription>각 게시판의 활동 통계</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                로딩 중...
              </div>
            ) : boardStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>통계 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">게시판</th>
                      <th className="text-right p-3 font-medium">전체 게시글</th>
                      <th className="text-right p-3 font-medium">공개 게시글</th>
                      <th className="text-right p-3 font-medium">지난 주</th>
                      <th className="text-right p-3 font-medium">오늘</th>
                      <th className="text-right p-3 font-medium">최근 게시글</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardStats.map((stat) => (
                      <tr key={stat.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{stat.nm}</td>
                        <td className="p-3 text-right">{stat.total_posts.toLocaleString()}</td>
                        <td className="p-3 text-right">{stat.published_posts.toLocaleString()}</td>
                        <td className="p-3 text-right">{stat.posts_last_week.toLocaleString()}</td>
                        <td className="p-3 text-right">{stat.posts_today.toLocaleString()}</td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {stat.last_post_date
                            ? new Date(stat.last_post_date).toLocaleDateString('ko-KR')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 인기 게시글 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              인기 게시글
            </CardTitle>
            <CardDescription>인기 점수가 높은 게시글 TOP 10</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                로딩 중...
              </div>
            ) : popularPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>인기 게시글이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/boards`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">{post.board_nm}</span>
                          {post.author_nickname && (
                            <span className="text-xs text-muted-foreground">
                              · {post.author_nickname}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium line-clamp-2">{post.ttl}</h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.vw_cnt.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.lk_cnt.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.cmt_cnt.toLocaleString()}
                          </span>
                          <span className="ml-auto">
                            인기점수: {post.popularity_score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 사용자 활동 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              사용자 활동 통계
            </CardTitle>
            <CardDescription>가장 활발한 사용자 TOP 10</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                로딩 중...
              </div>
            ) : userActivityStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>활동 통계 데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">사용자</th>
                      <th className="text-right p-3 font-medium">게시글</th>
                      <th className="text-right p-3 font-medium">댓글</th>
                      <th className="text-right p-3 font-medium">게시글 좋아요</th>
                      <th className="text-right p-3 font-medium">댓글 좋아요</th>
                      <th className="text-right p-3 font-medium">북마크</th>
                      <th className="text-right p-3 font-medium">최근 활동</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userActivityStats.map((user, index) => (
                      <tr key={user.user_id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="font-medium">
                              {user.nickname || user.user_id}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">{user.total_posts.toLocaleString()}</td>
                        <td className="p-3 text-right">{user.total_comments.toLocaleString()}</td>
                        <td className="p-3 text-right">{user.total_post_likes.toLocaleString()}</td>
                        <td className="p-3 text-right">{user.total_comment_likes.toLocaleString()}</td>
                        <td className="p-3 text-right">{user.total_bookmarks.toLocaleString()}</td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {user.last_activity_date
                            ? new Date(user.last_activity_date).toLocaleDateString('ko-KR')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
