/**
 * 내 신고 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flag } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function MyReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // TODO: API 호출로 실제 데이터 로드
      setReports([]);
    } catch (error) {
      console.error('신고 로드 실패:', error);
      toast({
        title: '오류',
        description: '신고 내역을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">대기 중</Badge>;
      case 'PROCESSING':
        return <Badge variant="default">처리 중</Badge>;
      case 'RESOLVED':
        return <Badge variant="default" className="bg-green-500">처리 완료</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">거부됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">내 신고</h1>
        <p className="text-muted-foreground">
          신고한 내역을 확인하고 처리 상태를 확인하세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>신고 목록</CardTitle>
          <CardDescription>내가 신고한 모든 내역</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>신고한 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.reason}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        신고일: {new Date(report.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(report.status)}
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
