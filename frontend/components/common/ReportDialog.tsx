/**
 * 신고 다이얼로그 컴포넌트
 */
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { reportApi } from '@/lib/api/reports';
import type { ReportCreate } from '@/lib/api/reports';
import { useToast } from '@/hooks/useToast';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: number;
  targetTitle?: string; // 게시글 제목 또는 댓글 내용 미리보기
}

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetTitle,
}: ReportDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState<'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER'>('SPAM');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasonLabels = {
    SPAM: '스팸',
    ABUSE: '욕설/비방',
    INAPPROPRIATE: '부적절한 내용',
    COPYRIGHT: '저작권 침해',
    OTHER: '기타',
  };

  const targetTypeLabels = {
    POST: '게시글',
    COMMENT: '댓글',
    USER: '사용자',
  };

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: '오류',
        description: '신고 사유를 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const reportData: ReportCreate = {
        target_type: targetType,
        target_id: targetId,
        rsn: reason,
        dsc: description.trim() || undefined,
      };

      await reportApi.createReport(reportData);

      toast({
        title: '신고 완료',
        description: '신고가 접수되었습니다. 검토 후 처리하겠습니다.',
      });

      // 폼 초기화
      setReason('SPAM');
      setDescription('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('신고 실패:', error);
      const errorMessage = error?.data?.detail || error?.message || '신고 접수에 실패했습니다.';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setReason('SPAM');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {targetTypeLabels[targetType]} 신고
          </DialogTitle>
          <DialogDescription>
            부적절한 {targetTypeLabels[targetType]}을 신고해주세요. 검토 후 조치하겠습니다.
          </DialogDescription>
        </DialogHeader>
        
        {targetTitle && (
          <div className="mt-2 p-2 bg-muted rounded text-sm">
            <strong>대상:</strong> {targetTitle}
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">신고 사유 *</Label>
            <Select value={reason} onValueChange={(value: any) => setReason(value)}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="신고 사유를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPAM">{reasonLabels.SPAM}</SelectItem>
                <SelectItem value="ABUSE">{reasonLabels.ABUSE}</SelectItem>
                <SelectItem value="INAPPROPRIATE">{reasonLabels.INAPPROPRIATE}</SelectItem>
                <SelectItem value="COPYRIGHT">{reasonLabels.COPYRIGHT}</SelectItem>
                <SelectItem value="OTHER">{reasonLabels.OTHER}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">상세 설명 (선택사항)</Label>
            <Textarea
              id="description"
              placeholder="신고 사유에 대한 상세한 설명을 입력해주세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? '신고 중...' : '신고하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
