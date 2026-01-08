/**
 * 내 북마크 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function MyBookmarksPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      // TODO: API 호출로 실제 데이터 로드
      setBookmarks([]);
    } catch (error) {
      console.error('북마크 로드 실패:', error);
      toast({
        title: '오류',
        description: '북마크를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">내 북마크</h1>
        <p className="text-muted-foreground">
          저장한 게시글을 확인하고 관리하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>북마크 목록</CardTitle>
          <CardDescription>내가 저장한 모든 게시글</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>저장한 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-medium">{bookmark.post_title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    저장일: {new Date(bookmark.created_at).toLocaleString('ko-KR')}
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
