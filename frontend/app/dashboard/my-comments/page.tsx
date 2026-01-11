/**
 * 내 댓글 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { dashboardApi } from '@/lib/api/dashboard';
import Link from 'next/link';

export default function MyCommentsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getMyComments(1, 20);
      setComments(response.items);
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">내 댓글</h1>
        <p className="text-muted-foreground">
          작성한 댓글을 확인하고 관리하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>댓글 목록</CardTitle>
          <CardDescription>내가 작성한 모든 댓글</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>작성한 댓글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/boards/${comment.board_id}/posts/${comment.post_id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {comment.board_name} · {comment.post_title} · {new Date(comment.created_at).toLocaleString('ko-KR')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
