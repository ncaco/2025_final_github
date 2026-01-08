/**
 * 사용자 대시보드 메인 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Bookmark, UserPlus, TrendingUp, Clock } from 'lucide-react';
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

export default function DashboardPage() {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">
          {user?.nickname || user?.username}님의 활동 현황을 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">내 게시글</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.total_posts.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 {stats?.posts_today || 0}개 작성
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">내 댓글</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.total_comments.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 {stats?.comments_today || 0}개 작성
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">내 북마크</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.total_bookmarks.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              저장한 게시글
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">내 팔로우</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.total_follows.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              팔로우 중인 게시판
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>자주 사용하는 기능으로 빠르게 이동하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/my-posts">
                <FileText className="mr-2 h-4 w-4" />
                내 게시글
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/my-comments">
                <MessageSquare className="mr-2 h-4 w-4" />
                내 댓글
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/my-bookmarks">
                <Bookmark className="mr-2 h-4 w-4" />
                내 북마크
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/my-follows">
                <UserPlus className="mr-2 h-4 w-4" />
                내 팔로우
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>최근에 작성한 게시글과 댓글을 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              최근 활동이 없습니다.
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
