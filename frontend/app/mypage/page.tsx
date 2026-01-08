/**
 * 사용자 마이페이지 메인 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare, Bookmark, UserPlus, Clock, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';

interface DashboardStats {
  total_posts: number;
  total_comments: number;
  total_bookmarks: number;
  total_follows: number;
  posts_today: number;
  comments_today: number;
}

interface RecentActivity {
  id: number;
  type: 'POST' | 'COMMENT' | 'BOOKMARK' | 'FOLLOW';
  title: string;
  created_at: string;
}

export default function MyPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 임시 데이터 (실제 구현 시 API 호출로 교체)
      setStats({
        total_posts: 0,
        total_comments: 0,
        total_bookmarks: 0,
        total_follows: 0,
        posts_today: 0,
        comments_today: 0,
      });

      setRecentActivities([]);

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '대시보드 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

          {/* 통계 카드 */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">내 게시글</CardTitle>
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats?.total_posts.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  오늘 {stats?.posts_today || 0}개 작성
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">내 댓글</CardTitle>
                <div className="p-2 rounded-lg bg-green-100">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats?.total_comments.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  오늘 {stats?.comments_today || 0}개 작성
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">내 북마크</CardTitle>
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Bookmark className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats?.total_bookmarks.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  저장한 게시글
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">내 팔로우</CardTitle>
                <div className="p-2 rounded-lg bg-purple-100">
                  <UserPlus className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats?.total_follows.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  팔로우 중인 게시판
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                빠른 액션
              </CardTitle>
              <CardDescription>자주 사용하는 기능으로 빠르게 이동하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
                  <Link href="/mypage/my-posts">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">내 게시글</div>
                        <div className="text-xs text-muted-foreground">작성한 게시글 보기</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
                  <Link href="/mypage/my-comments">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">내 댓글</div>
                        <div className="text-xs text-muted-foreground">작성한 댓글 보기</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
                  <Link href="/mypage/my-bookmarks">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <Bookmark className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">내 북마크</div>
                        <div className="text-xs text-muted-foreground">저장한 게시글 보기</div>
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
                  <Link href="/mypage/my-follows">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <UserPlus className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">내 팔로우</div>
                        <div className="text-xs text-muted-foreground">팔로우한 게시판 보기</div>
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 최근 활동 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                최근 활동
              </CardTitle>
              <CardDescription>최근에 작성한 게시글과 댓글을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>최근 활동이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          {activity.type === 'POST' && <FileText className="h-4 w-4" />}
                          {activity.type === 'COMMENT' && <MessageSquare className="h-4 w-4" />}
                          {activity.type === 'BOOKMARK' && <Bookmark className="h-4 w-4" />}
                          {activity.type === 'FOLLOW' && <UserPlus className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.created_at).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
