/**
 * 일괄 작업 컴포넌트
 */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Trash2, Eye, EyeOff, Move } from 'lucide-react';
import { boardApi } from '@/lib/api/boards';

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string, targetBoardId?: number) => Promise<void>;
}

export function BulkActions({ selectedCount, onBulkAction }: BulkActionsProps) {
  const [action, setAction] = useState<string>('');
  const [targetBoardId, setTargetBoardId] = useState<string>('');
  const [boards, setBoards] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 게시판 목록 로드
  const loadBoards = async () => {
    try {
      const data = await boardApi.getBoards();
      setBoards(data);
    } catch (error) {
      console.error('게시판 목록 로드 실패:', error);
    }
  };

  const handleActionSelect = (selectedAction: string) => {
    setAction(selectedAction);
    if (selectedAction === 'MOVE') {
      loadBoards();
    }
  };

  const handleExecute = () => {
    if (!action) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onBulkAction(action, targetBoardId ? Number(targetBoardId) : undefined);
      setAction('');
      setTargetBoardId('');
      setConfirmOpen(false);
    } catch (error) {
      console.error('일괄 작업 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels = {
      DELETE: '삭제',
      HIDE: '숨기기',
      SHOW: '게시',
      MOVE: '이동',
    };
    return labels[action] || action;
  };

  const getActionDescription = (action: string) => {
    const descriptions = {
      DELETE: `${selectedCount}개의 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      HIDE: `${selectedCount}개의 게시글을 숨기시겠습니까?`,
      SHOW: `${selectedCount}개의 게시글을 게시하시겠습니까?`,
      MOVE: `${selectedCount}개의 게시글을 선택한 게시판으로 이동하시겠습니까?`,
    };
    return descriptions[action] || '';
  };

  const getActionIcon = (action: string) => {
    const icons = {
      DELETE: <Trash2 className="h-4 w-4" />,
      HIDE: <EyeOff className="h-4 w-4" />,
      SHOW: <Eye className="h-4 w-4" />,
      MOVE: <Move className="h-4 w-4" />,
    };
    return icons[action] || null;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <Badge variant="secondary" className="px-3 py-1">
        {selectedCount}개 선택됨
      </Badge>

      <div className="flex items-center gap-2">
        <Select value={action} onValueChange={handleActionSelect}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="작업 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DELETE">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-destructive" />
                삭제
              </div>
            </SelectItem>
            <SelectItem value="HIDE">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4" />
                숨기기
              </div>
            </SelectItem>
            <SelectItem value="SHOW">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                게시
              </div>
            </SelectItem>
            <SelectItem value="MOVE">
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4" />
                이동
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {action === 'MOVE' && (
          <Select value={targetBoardId} onValueChange={setTargetBoardId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="게시판 선택" />
            </SelectTrigger>
            <SelectContent>
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id.toString()}>
                  {board.nm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Button
        onClick={handleExecute}
        disabled={!action || (action === 'MOVE' && !targetBoardId)}
        size="sm"
      >
        {getActionIcon(action)}
        <span className="ml-2">실행</span>
      </Button>

      {/* 확인 다이얼로그 */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title={`${getActionLabel(action)} 확인`}
        description={getActionDescription(action)}
        confirmText="실행"
        cancelText="취소"
        variant={action === 'DELETE' ? 'destructive' : 'default'}
        loading={loading}
      />
    </div>
  );
}
