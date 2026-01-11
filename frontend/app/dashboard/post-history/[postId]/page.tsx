/**
 * 게시글 히스토리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { logsApi } from '@/lib/api/logs';
import type { PostHistory } from '@/lib/api/logs';
import Link from 'next/link';

export default function PostHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const postId = parseInt(params.postId as string);
  const [loading, setLoading] = useState(true);
  const [histories, setHistories] = useState<PostHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    if (postId) {
      loadHistory();
    }
  }, [postId, page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await logsApi.getPostHistory(postId, { page, limit });
      setHistories(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('게시글 히스토리 로드 실패:', error);
      toast({
        title: '오류',
        description: '게시글 히스토리를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getChangeTypeLabel = (type: PostHistory['change_typ']) => {
    const labels: Record<PostHistory['change_typ'], string> = {
      CREATE: '생성',
      UPDATE: '수정',
      DELETE: '삭제',
    };
    return labels[type] || type;
  };

  const getChangeTypeBadge = (type: PostHistory['change_typ']) => {
    const colors: Record<PostHistory['change_typ'], string> = {
      CREATE: 'bg-green-500',
      UPDATE: 'bg-yellow-500',
      DELETE: 'bg-red-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/boards/posts/${postId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              게시글로 돌아가기
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">게시글 히스토리</h1>
            <p className="text-muted-foreground">
              게시글 #{postId}의 수정 내역을 확인하세요.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>수정 내역</CardTitle>
          <CardDescription>총 {total}개의 수정 기록</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : histories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>수정 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {histories.map((history) => (
                <div
                  key={history.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={getChangeTypeBadge(history.change_typ)}>
                        {getChangeTypeLabel(history.change_typ)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        수정자: {history.user_id}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(history.crt_dt).toLocaleString('ko-KR')}
                    </span>
                  </div>

                  {(history.prev_ttl || history.new_ttl) && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">제목 변경:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {history.prev_ttl && (
                          <div className="p-2 bg-red-50 rounded">
                            <div className="text-xs text-muted-foreground mb-1">이전:</div>
                            <div className="line-through">{history.prev_ttl}</div>
                          </div>
                        )}
                        {history.new_ttl && (
                          <div className="p-2 bg-green-50 rounded">
                            <div className="text-xs text-muted-foreground mb-1">변경:</div>
                            <div>{history.new_ttl}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(history.prev_cn || history.new_cn) && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">내용 변경:</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {history.prev_cn && (
                          <div className="p-2 bg-red-50 rounded max-h-40 overflow-y-auto">
                            <div className="text-xs text-muted-foreground mb-1">이전:</div>
                            <div className="line-through whitespace-pre-wrap">{history.prev_cn}</div>
                          </div>
                        )}
                        {history.new_cn && (
                          <div className="p-2 bg-green-50 rounded max-h-40 overflow-y-auto">
                            <div className="text-xs text-muted-foreground mb-1">변경:</div>
                            <div className="whitespace-pre-wrap">{history.new_cn}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {history.change_rsn && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">변경 사유:</span> {history.change_rsn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
