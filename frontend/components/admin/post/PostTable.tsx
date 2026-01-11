/**
 * 게시글 테이블 컴포넌트
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
import { PostUpdateModal } from './PostUpdateModal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  Heart,
  Paperclip
} from 'lucide-react';
import { Post } from '@/types/board';
import { Loading } from '@/components/common/Loading';

interface PostTableProps {
  posts: Post[];
  loading: boolean;
  selectedPosts?: number[];
  onSelectPost?: (postId: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onUpdate: (postId: number, data: any) => Promise<void>;
  onDelete: (postId: number) => Promise<void>;
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
}

export function PostTable({
  posts,
  loading,
  selectedPosts = [],
  onSelectPost,
  onSelectAll,
  onUpdate,
  onDelete,
  currentPage = 1,
  itemsPerPage = 10,
  totalCount = 0,
}: PostTableProps) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

  const handleEdit = (post: Post) => {
    setSelectedPost(post);
    setUpdateModalOpen(true);
  };

  const handleDelete = (post: Post) => {
    setPostToDelete(post);
    setDeleteConfirmOpen(true);
  };

  const handleToggleStatus = async (post: Post) => {
    try {
      const newStatus = post.stts === 'HIDDEN' ? 'PUBLISHED' : 'HIDDEN';
      await onUpdate(post.id, { stts: newStatus });
    } catch (error) {
      console.error('게시글 상태 변경 실패:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PUBLISHED: '게시됨',
      DRAFT: '임시저장',
      DELETED: '삭제됨',
      HIDDEN: '숨김',
      SECRET: '비밀글',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PUBLISHED: 'default',
      DRAFT: 'secondary',
      DELETED: 'destructive',
      HIDDEN: 'outline',
      SECRET: 'outline',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        게시글이 없습니다.
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
              <col className="w-[200px]" />
              <col className="w-[60px]" />
              <col className="w-[60px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-20" />
            </colgroup>
            <thead className="bg-background">
              <tr>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">제목</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">공지</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">비밀</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">작성자</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">상태</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">통계</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">게시판</th>
                <th className="h-12 p-1 text-center border font-medium text-muted-foreground">작성일자</th>
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
              <col className="w-[200px]" />
              <col className="w-[60px]" />
              <col className="w-[60px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-20" />
            </colgroup>
            <tbody>
              {posts.map((post, index) => {
                // 역순 번호 계산
                const rowNumber = totalCount > 0
                  ? totalCount - (currentPage - 1) * itemsPerPage - index
                  : (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr key={post.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-1 border align-middle">
                      <div>
                        <div className="font-semibold truncate">{post.ttl}</div>
                        {post.smmry && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {post.smmry}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      {post.ntce_yn ? (
                        <Badge variant="destructive" className="text-xs">공지</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-1 border text-center align-middle">
                      {post.scr_yn ? (
                        <Badge variant="outline" className="text-xs">비밀</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-1 border align-middle">
                      <div className="text-sm">{post.author_nickname || post.user_id}</div>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      <Badge variant={getStatusColor(post.stts)}>
                        {getStatusLabel(post.stts)}
                      </Badge>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      <div className="text-xs space-y-0.5">
                        <div>조회: {post.vw_cnt}</div>
                        <div>좋아요: {post.lk_cnt}</div>
                        <div>댓글: {post.cmt_cnt}</div>
                      </div>
                    </td>
                    <td className="p-1 border align-middle">
                      <div className="text-sm text-center">{post.board_nm || `게시판 #${post.board_id}`}</div>
                    </td>
                    <td className="p-1 border text-center align-middle">
                      {new Date(post.crt_dt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="p-1 border text-center align-middle w-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(post)}>
                            <Edit className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(post)}>
                            {post.stts === 'HIDDEN' ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                게시
                              </>
                            ) : (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                숨기기
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(post)}
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

      {/* 게시글 수정 모달 */}
      {selectedPost && (
        <PostUpdateModal
          post={selectedPost}
          open={updateModalOpen}
          onClose={() => {
            setUpdateModalOpen(false);
            setSelectedPost(null);
          }}
          onSubmit={(data) => onUpdate(selectedPost.id, data)}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setPostToDelete(null);
          }
        }}
        onConfirm={() => {
          if (postToDelete) {
            onDelete(postToDelete.id);
            setDeleteConfirmOpen(false);
            setPostToDelete(null);
          }
        }}
        title="게시글 삭제"
        description={`"${postToDelete?.ttl}" 게시글을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
      />
    </>
  );
}
