/**
 * 게시판 테이블 컴포넌트
 */
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BoardUpdateModal } from './BoardUpdateModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Board, BoardType, PermissionLevel } from '@/types/board';
import { formatDateTime } from '@/lib/utils/format';

interface BoardTableProps {
  boards: Board[];
  loading: boolean;
  onUpdate: (boardId: number, data: any) => Promise<void>;
  onDelete: (boardId: number) => Promise<void>;
}

export function BoardTable({ boards, loading, onUpdate, onDelete }: BoardTableProps) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const handleEdit = (board: Board) => {
    setSelectedBoard(board);
    setUpdateModalOpen(true);
  };

  const handleDelete = (board: Board) => {
    setBoardToDelete(board);
    setDeleteConfirmOpen(true);
  };

  const handleToggleActive = async (board: Board) => {
    try {
      await onUpdate(board.id, { actv_yn: !board.actv_yn });
    } catch (error) {
      console.error('게시판 상태 변경 실패:', error);
    }
  };

  const getBoardTypeLabel = (type: BoardType) => {
    const labels = {
      GENERAL: '일반',
      NOTICE: '공지',
      QNA: 'Q&A',
      IMAGE: '이미지',
      VIDEO: '동영상',
    };
    return labels[type] || type;
  };

  const getBoardTypeColor = (type: BoardType) => {
    const colors = {
      GENERAL: 'default',
      NOTICE: 'destructive',
      QNA: 'secondary',
      IMAGE: 'outline',
      VIDEO: 'outline',
    } as const;
    return colors[type] || 'default';
  };

  const getPermissionLabel = (permission: PermissionLevel) => {
    const labels = {
      ALL: '전체',
      USER: '사용자',
      ADMIN: '관리자',
    };
    return labels[permission] || permission;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>게시판명</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>권한</TableHead>
              <TableHead>게시글 수</TableHead>
              <TableHead>생성일</TableHead>
              <TableHead className="w-[70px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  게시판이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              boards.map((board) => (
                <TableRow key={board.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{board.nm}</div>
                      {board.dsc && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {board.dsc}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBoardTypeColor(board.typ)}>
                      {getBoardTypeLabel(board.typ)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={board.actv_yn ? 'default' : 'secondary'}>
                      {board.actv_yn ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>읽기: {getPermissionLabel(board.read_permission)}</div>
                      <div>쓰기: {getPermissionLabel(board.write_permission)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{board.post_count.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(board.crt_dt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(board)}>
                          <Edit className="mr-2 h-4 w-4" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(board)}>
                          {board.actv_yn ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              비활성화
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              활성화
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(board)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 게시판 수정 모달 */}
      {selectedBoard && (
        <BoardUpdateModal
          board={selectedBoard}
          open={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedBoard(null);
          }}
          onSubmit={(data) => onUpdate(selectedBoard.id, data)}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setBoardToDelete(null);
        }}
        onConfirm={() => {
          if (boardToDelete) {
            onDelete(boardToDelete.id);
            setDeleteConfirmOpen(false);
            setBoardToDelete(null);
          }
        }}
        title="게시판 삭제"
        description={`"${boardToDelete?.nm}" 게시판을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />
    </>
  );
}
