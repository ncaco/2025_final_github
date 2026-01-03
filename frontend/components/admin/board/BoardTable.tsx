/**
 * 게시판 테이블 컴포넌트
 */
'use client';

import { useState, useRef } from 'react';
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
import { Loading } from '@/components/common/Loading';

interface BoardTableProps {
  boards: Board[];
  loading: boolean;
  onUpdate: (boardId: number, data: any) => Promise<void>;
  onDelete: (boardId: number) => Promise<void>;
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
}

export function BoardTable({ boards, loading, onUpdate, onDelete, currentPage = 1, itemsPerPage = 10, totalCount = 0 }: BoardTableProps) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

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
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        게시판이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border flex flex-col h-full">
        {/* 테이블 헤더 (고정) */}
        <div
          className="shrink-0 overflow-x-auto"
          ref={headerScrollRef}
          onScroll={(e) => {
            if (isScrollingRef.current === 'body') return;
            const target = e.currentTarget;
            if (bodyScrollRef.current) {
              isScrollingRef.current = 'header';
              bodyScrollRef.current.scrollLeft = target.scrollLeft;
              requestAnimationFrame(() => {
                isScrollingRef.current = null;
              });
            }
          }}
        >
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col className="w-16" />
              <col className="w-[80px]" />
              <col className="w-[180px]" />
              <col className="w-[140px]" />
              <col className="w-[80px]" />
              <col className="w-[80px]" />
              <col className="w-[100px]" />
              <col className="w-20" />
            </colgroup>
            <thead className="bg-background">
              <tr>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">번호</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">유형</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">게시판명</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">권한</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">게시글 수</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">상태</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">생성일자</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">작업</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* 테이블 바디 (스크롤 가능) */}
        <div
          className="flex-1 min-h-0 overflow-auto"
          ref={bodyScrollRef}
          onScroll={(e) => {
            if (isScrollingRef.current === 'header') return;
            const target = e.currentTarget;
            if (headerScrollRef.current) {
              isScrollingRef.current = 'body';
              headerScrollRef.current.scrollLeft = target.scrollLeft;
              requestAnimationFrame(() => {
                isScrollingRef.current = null;
              });
            }
          }}
        >
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col className="w-16" />
              <col className="w-[80px]" />
              <col className="w-[180px]" />
              <col className="w-[140px]" />
              <col className="w-[80px]" />
              <col className="w-[80px]" />
              <col className="w-[100px]" />
              <col className="w-20" />
            </colgroup>
            <tbody>
            {boards.map((board, index) => {
              // 역순 번호 계산: 전체 개수 - (현재 페이지 - 1) * itemsPerPage - index
              const rowNumber = totalCount > 0
                ? totalCount - (currentPage - 1) * itemsPerPage - index
                : (currentPage - 1) * itemsPerPage + index + 1;
              return (
                <tr key={board.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-1 border text-center align-middle">{rowNumber}</td>
                  <td className="p-1 border text-center align-middle">
                    <Badge variant={getBoardTypeColor(board.typ)}>
                      {getBoardTypeLabel(board.typ)}
                    </Badge>
                  </td>
                  <td className="p-1 border align-middle">
                    <div className="font-semibold">{board.nm}</div>
                  </td>
                  <td className="p-1 border align-middle">
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground min-w-[24px]">읽기:</span>
                        <span className="font-medium text-blue-700">{getPermissionLabel(board.read_permission)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground min-w-[24px]">쓰기:</span>
                        <span className="font-medium text-green-700">{getPermissionLabel(board.write_permission)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-1 border text-center align-middle">{board.post_count.toLocaleString()}</td>
                  <td className="p-1 border text-center align-middle">
                    <Badge variant={board.actv_yn ? 'default' : 'secondary'}>
                      {board.actv_yn ? '활성' : '비활성'}
                    </Badge>
                  </td>
                  <td className="p-1 border text-center align-middle">
                    {new Date(board.crt_dt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="p-1 border text-center align-middle w-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-7 w-7 p-0">
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
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
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
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setBoardToDelete(null);
          }
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
