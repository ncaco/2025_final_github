/**
 * 내 팔로우 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function MyFollowsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [follows, setFollows] = useState<any[]>([]);

  useEffect(() => {
    loadFollows();
  }, []);

  const loadFollows = async () => {
    try {
      setLoading(true);
      // TODO: API 호출로 실제 데이터 로드
      setFollows([]);
    } catch (error) {
      console.error('팔로우 로드 실패:', error);
      toast({
        title: '오류',
        description: '팔로우 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">내 팔로우</h1>
        <p className="text-muted-foreground">
          팔로우한 게시판을 확인하고 관리하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>팔로우 목록</CardTitle>
          <CardDescription>내가 팔로우한 모든 게시판</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : follows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>팔로우한 게시판이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {follows.map((follow) => (
                <div
                  key={follow.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium">{follow.board_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    팔로우일: {new Date(follow.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
