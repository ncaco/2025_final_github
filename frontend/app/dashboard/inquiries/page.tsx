/**
 * 문의 내역 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { dashboardApi } from '@/lib/api/dashboard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Inquiry } from '@/lib/api/dashboard';

export default function InquiriesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    loadInquiries();
  }, []);

  const router = useRouter();

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getInquiries(1, 20);
      setInquiries(response.items);
    } catch (error) {
      console.error('문의 로드 실패:', error);
      toast({
        title: '오류',
        description: '문의 내역을 불러오는데 실패했습니다.',
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
      case 'ANSWERED':
        return <Badge variant="default" className="bg-green-500">답변 완료</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">종료됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">문의 내역</h1>
          <p className="text-muted-foreground">
            문의한 내역을 확인하고 답변을 확인하세요.
          </p>
        </div>
        <Button asChild>
          <Link href="/contact">
            <Plus className="mr-2 h-4 w-4" />
            새 문의하기
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          <CardDescription>내가 문의한 모든 내역</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>문의한 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{inquiry.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {inquiry.content}
                      </p>
                      {inquiry.answer && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">답변:</p>
                          <p className="text-sm">{inquiry.answer}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        문의일: {new Date(inquiry.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(inquiry.status)}
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
