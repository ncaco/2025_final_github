/**
 * 검색 로그 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { logsApi } from '@/lib/api/logs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SearchLog } from '@/lib/api/logs';

export default function SearchLogsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<SearchLog[]>([]);
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
        params.search_typ = filterType;
      }
      const response = await logsApi.getSearchLogs(params);
      setLogs(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('검색 로그 로드 실패:', error);
      toast({
        title: '오류',
        description: '검색 로그를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">검색 로그</h1>
          <p className="text-muted-foreground">
            내 검색 내역을 확인하세요.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>검색 내역</CardTitle>
              <CardDescription>총 {total}개의 검색 기록</CardDescription>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="검색 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="TITLE">제목</SelectItem>
                <SelectItem value="CONTENT">내용</SelectItem>
                <SelectItem value="AUTHOR">작성자</SelectItem>
                <SelectItem value="TAG">태그</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>검색 내역이 없습니다.</p>
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
                        <span className="font-medium">{log.search_query}</span>
                        {log.search_typ && (
                          <Badge variant="outline">{log.search_typ}</Badge>
                        )}
                        <Badge variant="secondary">
                          결과 {log.result_cnt}개
                        </Badge>
                      </div>
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
