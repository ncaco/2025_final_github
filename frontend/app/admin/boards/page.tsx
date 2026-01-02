/**
 * 게시판 관리 페이지
 */
'use client';

import { useState, useEffect } from 'react';
import { BoardTable } from '@/components/admin/board/BoardTable';
import { BoardCreateModal } from '@/components/admin/board/BoardCreateModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Board } from '@/types/board';
import { boardApi } from '@/lib/api/boards';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { toast } = useToast();

  // 게시판 목록 로드
  const loadBoards = async () => {
    try {
      setLoading(true);
      const data = await boardApi.getBoards();
      setBoards(data);
    } catch (error) {
      console.error('게시판 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '게시판 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 게시판 생성
  const handleCreateBoard = async (boardData: any) => {
    try {
      await boardApi.createBoard(boardData);
      toast({
        title: '성공',
        description: '게시판이 생성되었습니다.',
      });
      setCreateModalOpen(false);
      loadBoards(); // 목록 새로고침
    } catch (error) {
      console.error('게시판 생성 실패:', error);
      toast({
        title: '오류',
        description: '게시판 생성에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 게시판 수정
  const handleUpdateBoard = async (boardId: number, boardData: any) => {
    try {
      await boardApi.updateBoard(boardId, boardData);
      toast({
        title: '성공',
        description: '게시판이 수정되었습니다.',
      });
      loadBoards(); // 목록 새로고침
    } catch (error) {
      console.error('게시판 수정 실패:', error);
      toast({
        title: '오류',
        description: '게시판 수정에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 게시판 삭제
  const handleDeleteBoard = async (boardId: number) => {
    try {
      await boardApi.deleteBoard(boardId);
      toast({
        title: '성공',
        description: '게시판이 삭제되었습니다.',
      });
      loadBoards(); // 목록 새로고침
    } catch (error) {
      console.error('게시판 삭제 실패:', error);
      toast({
        title: '오류',
        description: '게시판 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">게시판 관리</h1>
          <p className="text-muted-foreground">
            게시판을 생성, 수정, 삭제하고 설정을 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          게시판 생성
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>게시판 목록</CardTitle>
          <CardDescription>
            총 {boards.length}개의 게시판이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BoardTable
            boards={boards}
            loading={loading}
            onUpdate={handleUpdateBoard}
            onDelete={handleDeleteBoard}
          />
        </CardContent>
      </Card>

      {/* 게시판 생성 모달 */}
      <BoardCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
}
