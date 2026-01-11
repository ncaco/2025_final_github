/**
 * 내 게시글 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { dashboardApi } from '@/lib/api/dashboard';
import Link from 'next/link';

export default function MyPostsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getMyPosts(1, 20);
      setPosts(response.items);
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">내 게시글</h1>
        <p className="text-muted-foreground">
          작성한 게시글을 확인하고 관리하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>게시글 목록</CardTitle>
          <CardDescription>내가 작성한 모든 게시글</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>작성한 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/boards/${post.board_id}/posts/${post.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {post.board_name} · {new Date(post.created_at).toLocaleString('ko-KR')} · 조회 {post.view_count} · 좋아요 {post.like_count} · 댓글 {post.comment_count}
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
