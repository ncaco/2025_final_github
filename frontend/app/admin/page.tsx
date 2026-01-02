/**
 * 관리자 대시보드 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { statisticsApi } from '@/lib/api/reports';

interface DashboardStats {
  total_posts: number;
  total_users: number;
  total_comments: number;
  pending_reports: number;
  posts_today: number;
  users_today: number;
  comments_today: number;
}

interface RecentActivity {
  id: number;
  type: 'POST' | 'COMMENT' | 'REPORT' | 'USER';
  title: string;
  author?: string;
  created_at: string;
  status?: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 대시보드 데이터 로드
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 통계 데이터 로드 (실제 API가 준비되면 사용)
      // const statsData = await statisticsApi.getSystemStats();
      // setStats(statsData);

      // 임시 데이터 (실제 구현 시 API 호출로 교체)
      setStats({
        total_posts: 1247,
        total_users: 89,
        total_comments: 3456,
        pending_reports: 12,
        posts_today: 23,
        users_today: 3,
        comments_today: 67,
      });

      // 최근 활동 데이터 (임시)
      setRecentActivities([
        {
          id: 1,
          type: 'POST',
          title: '새로운 게시글이 작성되었습니다',
          author: '사용자A',
          created_at: new Date().toISOString(),
          status: 'PUBLISHED'
        },
        {
          id: 2,
          type: 'REPORT',
          title: '신고가 접수되었습니다',
          author: '관리자',
          created_at: new Date(Date.now() - 300000).toISOString(),
          status: 'PENDING'
        },
        {
          id: 3,
          type: 'COMMENT',
          title: '댓글이 작성되었습니다',
          author: '사용자B',
          created_at: new Date(Date.now() - 600000).toISOString(),
        },
        {
          id: 4,
          type: 'USER',
          title: '새로운 사용자가 가입했습니다',
          author: '시스템',
          created_at: new Date(Date.now() - 900000).toISOString(),
        },
      ]);

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      POST: FileText,
      COMMENT: MessageSquare,
      REPORT: AlertTriangle,
      USER: Users,
    };
    return icons[type] || FileText;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      POST: 'text-blue-600',
      COMMENT: 'text-green-600',
      REPORT: 'text-red-600',
      USER: 'text-purple-600',
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="text-muted-foreground">
          시스템 현황과 최근 활동을 모니터링하고 관리할 수 있습니다.
        </p>
      </div>

      {/* 시스템 현황 */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 게시글</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.total_posts.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 {stats?.posts_today || 0}개 작성됨
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.total_users.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 {stats?.users_today || 0}명 가입
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 댓글</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">
              {loading ? '...' : stats?.total_comments.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 {stats?.comments_today || 0}개 작성됨
            </p>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">대기 신고</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : stats?.pending_reports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              처리 대기 중
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>
              시스템의 최근 활동 내역입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">
                          {activity.author}
                        </p>
                        {activity.status && (
                          <Badge variant="outline" className="text-xs">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>
              자주 사용하는 관리 기능을 바로 실행할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/posts">
                  <FileText className="mr-2 h-4 w-4" />
                  게시글 관리
                </Link>
              </Button>

              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/reports">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  신고 처리 ({stats?.pending_reports || 0})
                </Link>
              </Button>

              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  사용자 관리
                </Link>
              </Button>

              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/boards">
                  <Settings className="mr-2 h-4 w-4" />
                  게시판 설정
                </Link>
              </Button>

              <Button variant="outline" className="justify-start" asChild>
                <Link href="/admin/statistics/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  통계 보기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주요 관리 메뉴 */}
      <Card>
        <CardHeader>
          <CardTitle>관리 메뉴</CardTitle>
          <CardDescription>
            각 기능별 상세 관리를 위한 메뉴입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">게시판 관리</h4>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/boards">게시판 목록</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/categories">카테고리 관리</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/tags">태그 관리</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">콘텐츠 관리</h4>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/posts">게시글 관리</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/comments">댓글 관리</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/search-logs">검색 로그</Link>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">사용자/시스템</h4>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/users">사용자 관리</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/roles">역할 관리</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/admin/audit-logs">감사 로그</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

