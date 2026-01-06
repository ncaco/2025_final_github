'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { boardApi, postApi, commentApi, Board, Post, Comment } from '@/lib/api/boards';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';
import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  User,
  Tag,
  Edit,
  Trash2,
  Paperclip,
  Reply,
  Send,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 날짜 포맷팅 유틸리티 함수
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function PostDetailPage() {
  const { id: boardId, postId } = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // 상태 관리
  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState('');

  // 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) return;

    // URL 쿼리 파라미터에서 접근 토큰 읽기
    const accessTokenFromUrl = searchParams.get('token');
    loadData(accessTokenFromUrl || undefined);
  }, [isAuthenticated, boardId, postId, searchParams]);

  const loadData = async (accessToken?: string) => {
    try {
      setLoading(true);

      // 게시판 정보 로드
      const boardResponse = await boardApi.getBoards();
      const currentBoard = boardResponse.find(b => b.id === Number(boardId));
      if (!currentBoard) {
        toast({
          title: '오류',
          description: '게시판을 찾을 수 없습니다.',
          variant: 'destructive',
        });
        router.push('/boards');
        return;
      }
      setBoard(currentBoard);

      // 게시글 상세 정보 로드
      try {
        const postResponse = await postApi.getPost(Number(postId), accessToken);
        setPost(postResponse);
        setShowPasswordDialog(false);
        setPassword('');
        setPasswordError('');

        // 댓글 목록 로드
        await loadComments();
      } catch (error: any) {
        // 비밀번호 필요 오류인 경우
        if (error?.status === 403 || error?.message?.includes('비밀번호') || error?.data?.detail?.includes('비밀번호')) {
          const errorMessage = error?.data?.detail || error?.message || '비밀글은 비밀번호가 필요합니다';
          setAccessDeniedMessage(errorMessage);
          setShowPasswordDialog(true);
          setLoading(false);
          setAccessDenied(true); // 비밀글 접근 권한 없음 상태로 설정
          return;
        }
        throw error;
      }

    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '게시글을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      router.push(`/boards/${boardId}`);
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 검증 및 게시글 로드
  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setVerifyingPassword(true);
      setPasswordError('');
      
      // 비밀번호 검증 및 접근 토큰 발급
      const response = await postApi.verifyPassword(Number(postId), password);
      
      // 검증 성공 시 접근 토큰으로 게시글 로드
      if (response.access_token) {
        await loadData(response.access_token);
      } else {
        // 토큰이 없는 경우 (본인 글 등)
        await loadData();
      }
    } catch (error: any) {
      console.error('비밀번호 검증 실패:', error);
      const errorMessage = error?.data?.detail || error?.message || '비밀번호가 올바르지 않습니다.';
      setPasswordError(errorMessage);
      setAccessDenied(true); // 접근 권한 없음 상태로 설정
    } finally {
      setVerifyingPassword(false);
    }
  };

  // 다이얼로그 닫기 핸들러
  const handleDialogClose = (open: boolean) => {
    if (!open && showPasswordDialog) {
      // 다이얼로그가 닫힐 때 히스토리 백 처리 (뒤로가기)
      router.back();
    } else {
      setShowPasswordDialog(open);
    }
  };

  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (!post) return;

    try {
      setLiking(true);
      const response = await postApi.toggleLike(post.id);

      setPost(prev => prev ? {
        ...prev,
        lk_cnt: response.like_count,
        is_liked: response.liked,
      } : null);

      toast({
        title: response.liked ? '좋아요' : '좋아요 취소',
        description: response.liked ? '게시글에 좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
      });

    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      toast({
        title: '오류',
        description: '좋아요 처리에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLiking(false);
    }
  };

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!post) return;

    const confirmed = confirm('정말로 이 게시글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await postApi.deletePost(post.id);

      toast({
        title: '삭제 완료',
        description: '게시글이 삭제되었습니다.',
      });

      // 게시판 목록으로 이동 (삭제된 게시물은 자동으로 필터링됨)
      router.push(`/boards/${boardId}`);
      router.refresh(); // 목록 페이지 강제 갱신

    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '게시글 삭제에 실패했습니다.';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEditPost = () => {
    router.push(`/boards/${boardId}/posts/${postId}/edit`);
  };

  // 댓글 목록 로드
  const loadComments = async () => {
    try {
      const commentsData = await commentApi.getComments(Number(postId));
      // 계층 구조로 변환
      const commentMap = new Map<number, Comment>();
      const rootComments: Comment[] = [];

      commentsData.forEach(comment => {
        commentMap.set(comment.id, { ...comment, children: [] });
      });

      commentsData.forEach(comment => {
        const commentWithChildren = commentMap.get(comment.id)!;
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(commentWithChildren);
          }
        } else {
          rootComments.push(commentWithChildren);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('댓글 로드 실패:', error);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      await commentApi.createComment({
        post_id: Number(postId),
        cn: newComment.trim(),
        parent_id: replyingTo || undefined,
      });

      setNewComment('');
      setReplyingTo(null);
      await loadComments();
      
      // 게시글 댓글 수 업데이트
      if (post) {
        setPost({ ...post, cmt_cnt: post.cmt_cnt + 1 });
      }

      toast({
        title: '댓글 작성 완료',
        description: '댓글이 작성되었습니다.',
      });
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '댓글 작성에 실패했습니다.';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setCommentLoading(false);
    }
  };

  // 대댓글 작성
  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return;

    try {
      setCommentLoading(true);
      await commentApi.createComment({
        post_id: Number(postId),
        cn: replyContent.trim(),
        parent_id: parentId,
      });

      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
      
      // 게시글 댓글 수 업데이트
      if (post) {
        setPost({ ...post, cmt_cnt: post.cmt_cnt + 1 });
      }

      toast({
        title: '답글 작성 완료',
        description: '답글이 작성되었습니다.',
      });
    } catch (error) {
      console.error('답글 작성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '답글 작성에 실패했습니다.';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setCommentLoading(false);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    const confirmed = confirm('정말로 이 댓글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await commentApi.deleteComment(commentId);
      await loadComments();
      
      // 게시글 댓글 수 업데이트
      if (post) {
        setPost({ ...post, cmt_cnt: Math.max(0, post.cmt_cnt - 1) });
      }

      toast({
        title: '삭제 완료',
        description: '댓글이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '댓글 삭제에 실패했습니다.';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // 댓글 좋아요
  const handleCommentLike = async (commentId: number) => {
    try {
      const response = await commentApi.toggleLike(commentId);
      await loadComments();
      
      toast({
        title: response.liked ? '좋아요' : '좋아요 취소',
        description: response.liked ? '댓글에 좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
      });
    } catch (error) {
      console.error('댓글 좋아요 실패:', error);
      toast({
        title: '오류',
        description: '좋아요 처리에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 하위 답글 개수 계산 (재귀적으로 모든 하위 답글 개수 계산)
  const getChildCommentCount = (comment: Comment): number => {
    if (!comment.children || comment.children.length === 0) {
      return 0;
    }
    let count = comment.children.length;
    comment.children.forEach(child => {
      count += getChildCommentCount(child);
    });
    return count;
  };

  // 하위 답글 접기/펼치기 토글
  const toggleCommentExpansion = (commentId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
          <p className="text-muted-foreground">게시글을 이용하려면 먼저 로그인해주세요.</p>
          <Button asChild>
            <Link href="/auth/login">로그인하기</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Loading size="lg" />
      </div>
    );
  }

  if (!board || !post) {
    // 비밀글 접근 권한 없음인 경우 (다이얼로그가 닫혀있을 때만 표시)
    if (accessDenied && !showPasswordDialog) {
      return (
        <div className="container mx-auto py-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-white/20 shadow-lg max-w-md">
              <div className="flex flex-col items-center text-center space-y-4">
                <Lock className="h-16 w-16 text-slate-400" />
                <h1 className="text-2xl font-bold text-slate-800">비밀글 접근권한이 없습니다.</h1>
                <p className="text-slate-600">이 게시글은 비밀글입니다. 비밀번호를 입력해야 볼 수 있습니다.</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAccessDenied(false);
                      setShowPasswordDialog(true);
                    }}
                  >
                    비밀번호 입력
                  </Button>
                  <Button asChild>
                    <Link href={`/boards/${boardId}`}>게시판으로 돌아가기</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // 일반적인 게시글을 찾을 수 없는 경우
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">게시글을 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href={`/boards/${boardId}`}>게시판으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isAuthor = user?.user_id === post.user_id;

  // 댓글 렌더링 컴포넌트
  const renderComment = (comment: Comment) => {
    const isCommentAuthor = user?.user_id === comment.user_id;
    const isReplying = replyingTo === comment.id;
    const depth = comment.depth || 0;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4 border-l-2 border-slate-200 pl-4' : ''}`}>
        <div className="bg-slate-50 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-sm">{comment.author_nickname || '익명'}</span>
              <span className="text-xs text-slate-500">{formatDate(comment.crt_dt)}</span>
              {comment.scr_yn && (
                <Badge variant="secondary" className="text-xs">비밀</Badge>
              )}
            </div>
            {isCommentAuthor && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-slate-800 mb-3 whitespace-pre-wrap">{comment.cn}</div>
          
          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommentLike(comment.id)}
              className={`h-7 px-2 ${comment.is_liked ? 'text-red-600' : 'text-slate-600'}`}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
              {comment.lk_cnt}
            </Button>
            
            {depth < 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(isReplying ? null : comment.id);
                  setReplyContent('');
                }}
                className="h-7 px-2 text-slate-600"
              >
                <Reply className="h-3 w-3 mr-1" />
                답글
              </Button>
            )}
          </div>

          {/* 답글 작성 폼 */}
          {isReplying && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex gap-2">
                <Textarea
                  placeholder="답글을 입력하세요..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={commentLoading || !replyContent.trim()}
                    className="h-8"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="h-8"
                  >
                    취소
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하위 답글 표시/숨김 버튼 */}
        {comment.children && comment.children.length > 0 && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCommentExpansion(comment.id)}
              className="h-7 px-2 text-slate-600 hover:text-slate-800"
            >
              {expandedComments.has(comment.id) ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  하위 답글 숨기기 ({getChildCommentCount(comment)}건)
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  하위 답글 보기 ({getChildCommentCount(comment)}건)
                </>
              )}
            </Button>
          </div>
        )}

        {/* 대댓글 렌더링 */}
        {comment.children && comment.children.length > 0 && expandedComments.has(comment.id) && (
          <div className="mt-2">
            {comment.children.map(child => renderComment(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 헤더 네비게이션 - 폼 왼쪽 라인에 맞춤 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0 h-8 w-8 hover:bg-slate-100/50"
            >
              <Link href={`/boards/${boardId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="text-sm text-slate-600">
              게시판 › {board.nm} › 게시글
            </div>
          </div>

          {/* 게시글 본문 */}
          {/* 게시글 헤더 */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 제목 */}
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 leading-tight">
                    {post.ttl}
                  </h1>

                  {/* 작성자 및 메타 정보 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{post.author_nickname || '익명'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.crt_dt)}</span>
                    </div>
                  </div>

                  {/* 카테고리 및 상태 */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {post.category_nm && (
                      <Badge variant="outline" className="text-xs">
                        {post.category_nm}
                      </Badge>
                    )}

                    {post.ntce_yn && (
                      <Badge variant="destructive" className="text-xs">
                        공지사항
                      </Badge>
                    )}

                    {post.scr_yn && (
                      <Badge variant="secondary" className="text-xs">
                        비밀글
                      </Badge>
                    )}
                  </div>

                  {/* 태그 */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Tag className="h-4 w-4 text-slate-400" />
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 액션 버튼들 */}
                {isAuthor && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditPost}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeletePost}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* 요약 */}
              {post.smmry && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
                  <p className="text-slate-700 italic">{post.smmry}</p>
                </div>
              )}

              {/* 본문 내용 */}
              <div className="prose prose-slate max-w-none">
                <div
                  className="text-slate-800 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: post.cn.replace(/\n/g, '<br />')
                  }}
                />
              </div>

              <Separator className="my-6" />

              {/* 통계 및 액션 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.vw_cnt.toLocaleString()}회 조회</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.lk_cnt.toLocaleString()}개 좋아요</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.cmt_cnt.toLocaleString()}개 댓글</span>
                  </div>

                  {post.att_cnt > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-4 w-4" />
                      <span>{post.att_cnt}개 첨부파일</span>
                    </div>
                  )}
                </div>

                {/* 좋아요 버튼 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLikeToggle}
                  disabled={liking}
                  className={`flex items-center gap-2 ${
                    post.is_liked 
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                      : 'hover:bg-red-50 hover:border-red-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-red-500 text-red-500' : ''} ${liking ? 'animate-pulse' : ''}`} />
                  <span>좋아요</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 댓글 영역 */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                댓글 {post.cmt_cnt > 0 && `(${post.cmt_cnt})`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 댓글 작성 폼 */}
              <div className="space-y-3">
                <Textarea
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={commentLoading || !newComment.trim()}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    댓글 작성
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 댓글 목록 */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => renderComment(comment))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>댓글이 없습니다.</p>
                  <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 비밀번호 입력 다이얼로그 */}
      <Dialog open={showPasswordDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              비밀글 비밀번호 입력
            </DialogTitle>
            <DialogDescription>
              {accessDeniedMessage || '이 게시글은 비밀글입니다. 비밀번호를 입력해주세요.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !verifyingPassword) {
                    handlePasswordSubmit();
                  }
                }}
                disabled={verifyingPassword}
                className={passwordError ? 'border-red-500' : ''}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                handleDialogClose(false);
              }}
              disabled={verifyingPassword}
            >
              취소
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={verifyingPassword || !password.trim()}
            >
              {verifyingPassword ? '확인 중...' : '확인'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
