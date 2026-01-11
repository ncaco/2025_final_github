/**
 * 댓글 테이블 컴포넌트
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
import { MoreHorizontal, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Comment } from '@/lib/api/comments';
import { Loading } from '@/components/common/Loading';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import Link from 'next/link';

interface CommentTableProps {
  comments: Comment[];
  loading: boolean;
  onHide: (commentId: number) => Promise<void>;
  onShow: (commentId: number) => Promise<void>;
  onDelete: (commentId: number) => Promise<void>;
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
}

export function CommentTable({ 
  comments, 
  loading, 
  onHide, 
  onShow, 
  onDelete, 
  currentPage = 1, 
  itemsPerPage = 10, 
  totalCount = 0 
}: CommentTableProps) {
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

  const getStatusBadge = (status: Comment['stts']) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="default" className="bg-green-100 text-green-800">표시됨</Badge>;
      case 'HIDDEN':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">숨김</Badge>;
      case 'DELETED':
        return <Badge variant="destructive">삭제됨</Badge>;
      case 'SECRET':
        return <Badge variant="secondary">비밀</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = async (comment: Comment) => {
    setCommentToDelete(comment);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (commentToDelete) {
      await onDelete(commentToDelete.id);
      setDeleteConfirmOpen(false);
      setCommentToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        댓글이 없습니다.
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
              <col className="w-[100px]" />
              <col className="w-[150px]" />
              <col className="w-[200px]" />
              <col className="w-[120px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-20" />
            </colgroup>
            <thead className="bg-background">
              <tr>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">번호</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">상태</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">작성자</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">댓글 내용</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">게시글</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">좋아요</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">작성일시</th>
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
              <col className="w-[100px]" />
              <col className="w-[150px]" />
              <col className="w-[200px]" />
              <col className="w-[120px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-20" />
            </colgroup>
            <tbody>
              {comments.map((comment, index) => {
                // 역순 번호 계산
                const rowNumber = totalCount > 0
                  ? totalCount - (currentPage - 1) * itemsPerPage - index
                  : (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={comment.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-1 border text-center align-middle">{rowNumber}</td>
                    <td className="p-1 border text-center align-middle">
                      {getStatusBadge(comment.stts)}
                    </td>
                    <td className="p-1 border align-middle">
                      <div className="text-sm">{comment.author_nickname || comment.user_id}</div>
                    </td>
                    <td className="p-1 border align-middle">
                      <div className="text-sm line-clamp-2" title={comment.cn}>
                        {comment.cn}
                      </div>
                    </td>
                    <td className="p-1 border align-middle">
                      <div className="text-sm">
                        {comment.board_id && comment.post_id ? (
                          <Link 
                            href={`/boards/${comment.board_id}/posts/${comment.post_id}`} 
                            className="text-blue-600 hover:underline"
                          >
                            {comment.post_title || `게시글 #${comment.post_id}`}
                          </Link>
                        ) : (
                          <span>게시글 #{comment.post_id}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      <div className="text-sm">{comment.lk_cnt}</div>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      <div className="text-xs">
                        {new Date(comment.crt_dt).toLocaleDateString('ko-KR')}
                      </div>
                    </td>
                    <td className="p-1 border text-center align-middle w-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {comment.stts === 'HIDDEN' ? (
                            <DropdownMenuItem onClick={() => onShow(comment.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              표시
                            </DropdownMenuItem>
                          ) : comment.stts === 'PUBLISHED' ? (
                            <DropdownMenuItem onClick={() => onHide(comment.id)}>
                              <EyeOff className="mr-2 h-4 w-4" />
                              숨김
                            </DropdownMenuItem>
                          ) : null}
                          {comment.stts !== 'DELETED' && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(comment)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          )}
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

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setCommentToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="댓글 삭제"
        description={`댓글 #${commentToDelete?.id}를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />
    </>
  );
}
