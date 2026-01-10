/**
 * 게시글 테이블 컴포넌트
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { formatDateTime } from '@/lib/utils/format';

interface PostTableProps {
  posts: Post[];
  loading: boolean;
  selectedPosts: number[];
  onSelectPost: (postId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdate: (postId: number, data: any) => Promise<void>;
  onDelete: (postId: number) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PostTable({
  posts,
  loading,
  selectedPosts,
  onSelectPost,
  onSelectAll,
  onUpdate,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: PostTableProps) {
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const allSelected = posts.length > 0 && selectedPosts.length === posts.length;
  const someSelected = selectedPosts.length > 0 && selectedPosts.length < posts.length;

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
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected || someSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead>제목</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>통계</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="w-[70px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  게시글이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={(checked) =>
                        onSelectPost(post.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-md">
                    <div>
                      <div className="font-semibold truncate">{post.ttl}</div>
                      {post.smmry && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {post.smmry}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {post.ntce_yn && (
                          <Badge variant="destructive" className="text-xs">공지</Badge>
                        )}
                        {post.scr_yn && (
                          <Badge variant="outline" className="text-xs">비밀</Badge>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1">
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {post.author_nickname || '알 수 없음'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(post.stts)}>
                      {getStatusLabel(post.stts)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.vw_cnt}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.lk_cnt}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.cmt_cnt}
                      </div>
                      {post.att_cnt > 0 && (
                        <div className="flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {post.att_cnt}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(post.crt_dt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            페이지 {currentPage} / {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              이전
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      )}

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
