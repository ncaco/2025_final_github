/**
 * 문의 관리 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HelpCircle, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { inquiryApi } from '@/lib/api/inquiries';
import type { Inquiry } from '@/lib/api/inquiries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function InquiriesPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    loadInquiries();
  }, [statusFilter, categoryFilter, page]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      const data = await inquiryApi.getAllInquiries(params);
      setInquiries(data);
    } catch (error) {
      console.error('문의 로드 실패:', error);
      toast({
        title: '오류',
        description: '문의 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!selectedInquiry || !answerText.trim()) {
      toast({
        title: '오류',
        description: '답변 내용을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await inquiryApi.answerInquiry(selectedInquiry.id, { answer: answerText });
      toast({
        title: '성공',
        description: '답변이 등록되었습니다.',
        variant: 'success',
      });
      setAnswerText('');
      setIsDetailModalOpen(false);
      loadInquiries();
    } catch (error) {
      console.error('답변 등록 실패:', error);
      toast({
        title: '오류',
        description: '답변 등록에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Inquiry['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">대기 중</Badge>;
      case 'ANSWERED':
        return <Badge variant="default" className="bg-green-100 text-green-800">답변 완료</Badge>;
      case 'CLOSED':
        return <Badge variant="secondary">종료됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: Inquiry['category']) => {
    switch (category) {
      case 'GENERAL':
        return '일반';
      case 'TECHNICAL':
        return '기술 지원';
      case 'BUG':
        return '버그 신고';
      case 'FEATURE':
        return '기능 제안';
      case 'PARTNERSHIP':
        return '제휴 문의';
      case 'OTHER':
        return '기타';
      default:
        return category;
    }
  };

  const openDetailModal = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setAnswerText(inquiry.answer || '');
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">문의 관리</h1>
          <p className="text-muted-foreground">
            모든 사용자의 문의를 확인하고 답변하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="PENDING">대기 중</SelectItem>
              <SelectItem value="ANSWERED">답변 완료</SelectItem>
              <SelectItem value="CLOSED">종료됨</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="유형 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 유형</SelectItem>
              <SelectItem value="GENERAL">일반</SelectItem>
              <SelectItem value="TECHNICAL">기술 지원</SelectItem>
              <SelectItem value="BUG">버그 신고</SelectItem>
              <SelectItem value="FEATURE">기능 제안</SelectItem>
              <SelectItem value="PARTNERSHIP">제휴 문의</SelectItem>
              <SelectItem value="OTHER">기타</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문의 목록</CardTitle>
          <CardDescription>총 {inquiries.length}개의 문의</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>문의 내역이 없습니다.</p>
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
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(inquiry.status)}
                        <Badge variant="outline">{getCategoryLabel(inquiry.category)}</Badge>
                      </div>
                      <h3 className="font-medium mb-1">{inquiry.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {inquiry.content}
                      </p>
                      {inquiry.answer && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">답변:</p>
                          <p className="text-sm">{inquiry.answer}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span>문의 ID: {inquiry.id}</span>
                        <span>문의자: {inquiry.user_id || '알 수 없음'}</span>
                        <span>문의일: {new Date(inquiry.created_at).toLocaleString('ko-KR')}</span>
                        {inquiry.answered_by && (
                          <>
                            <span>답변자: {inquiry.answered_by}</span>
                            {inquiry.answered_at && (
                              <span>답변일: {new Date(inquiry.answered_at).toLocaleString('ko-KR')}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailModal(inquiry)}
                      className="ml-4"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {inquiry.status === 'PENDING' ? '답변하기' : '상세보기'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 문의 상세 및 답변 모달 */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문의 상세 정보</DialogTitle>
            <DialogDescription>
              문의 ID: {selectedInquiry?.id}의 상세 정보를 확인하고 답변하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">상태</p>
                  <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">유형</p>
                  <p className="mt-1">{getCategoryLabel(selectedInquiry.category)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">문의자</p>
                  <p className="mt-1">{selectedInquiry.user_id || '알 수 없음'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">문의일시</p>
                  <p className="mt-1">{new Date(selectedInquiry.created_at).toLocaleString('ko-KR')}</p>
                </div>
                {selectedInquiry.answered_by && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">답변자</p>
                      <p className="mt-1">{selectedInquiry.answered_by}</p>
                    </div>
                    {selectedInquiry.answered_at && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">답변일시</p>
                        <p className="mt-1">{new Date(selectedInquiry.answered_at).toLocaleString('ko-KR')}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">제목</p>
                <p className="p-3 bg-muted rounded-md">{selectedInquiry.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">문의 내용</p>
                <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">{selectedInquiry.content}</p>
              </div>
              {selectedInquiry.status === 'PENDING' && (
                <div>
                  <Label htmlFor="answer">답변 작성</Label>
                  <Textarea
                    id="answer"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="답변 내용을 입력하세요..."
                    className="mt-2 min-h-[150px]"
                  />
                </div>
              )}
              {selectedInquiry.answer && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">기존 답변</p>
                  <p className="p-3 bg-green-50 rounded-md whitespace-pre-wrap">{selectedInquiry.answer}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedInquiry && selectedInquiry.status === 'PENDING' && (
              <Button
                variant="default"
                onClick={handleAnswer}
                disabled={!answerText.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                답변 등록
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
