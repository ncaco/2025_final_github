/**
 * 활동 로그 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Filter } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { logsApi } from '@/lib/api/logs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ActivityLog } from '@/lib/api/logs';

export default function ActivityLogsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [page, filterType]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (filterType !== 'all') {
        params.act_typ = filterType;
      }
      const response = await logsApi.getActivityLogs(params);
      setLogs(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('활동 로그 로드 실패:', error);
      toast({
        title: '오류',
        description: '활동 로그를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeLabel = (type: ActivityLog['act_typ']) => {
    const labels: Record<ActivityLog['act_typ'], string> = {
      LOGIN: '로그인',
      LOGOUT: '로그아웃',
      POST_CREATE: '게시글 작성',
      POST_UPDATE: '게시글 수정',
      POST_DELETE: '게시글 삭제',
      COMMENT_CREATE: '댓글 작성',
      COMMENT_DELETE: '댓글 삭제',
      LIKE: '좋아요',
      BOOKMARK: '북마크',
      REPORT: '신고',
    };
    return labels[type] || type;
  };

  const getActivityTypeBadge = (type: ActivityLog['act_typ']) => {
    const colors: Record<ActivityLog['act_typ'], string> = {
      LOGIN: 'bg-green-500',
      LOGOUT: 'bg-gray-500',
      POST_CREATE: 'bg-blue-500',
      POST_UPDATE: 'bg-yellow-500',
      POST_DELETE: 'bg-red-500',
      COMMENT_CREATE: 'bg-purple-500',
      COMMENT_DELETE: 'bg-red-500',
      LIKE: 'bg-pink-500',
      BOOKMARK: 'bg-orange-500',
      REPORT: 'bg-red-600',
    };
    return colors[type] || 'bg-gray-500';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">활동 로그</h1>
          <p className="text-muted-foreground">
            내 활동 내역을 확인하세요.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>활동 내역</CardTitle>
              <CardDescription>총 {total}개의 활동 기록</CardDescription>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="활동 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="LOGIN">로그인</SelectItem>
                <SelectItem value="POST_CREATE">게시글 작성</SelectItem>
                <SelectItem value="POST_UPDATE">게시글 수정</SelectItem>
                <SelectItem value="COMMENT_CREATE">댓글 작성</SelectItem>
                <SelectItem value="LIKE">좋아요</SelectItem>
                <SelectItem value="BOOKMARK">북마크</SelectItem>
                <SelectItem value="REPORT">신고</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>활동 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActivityTypeBadge(log.act_typ)}>
                          {getActivityTypeLabel(log.act_typ)}
                        </Badge>
                        {log.target_typ && log.target_id && (
                          <span className="text-sm text-muted-foreground">
                            {log.target_typ} #{log.target_id}
                          </span>
                        )}
                      </div>
                      {log.act_dsc && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {log.act_dsc}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {new Date(log.crt_dt).toLocaleString('ko-KR')}
                        </span>
                        {log.ip_addr && (
                          <span>IP: {log.ip_addr}</span>
                        )}
                      </div>
                    </div>
                  </div>
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
