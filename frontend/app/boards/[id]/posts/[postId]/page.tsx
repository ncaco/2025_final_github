'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { boardApi, postApi, Board, Post } from '@/lib/api/boards';
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
  Paperclip
} from 'lucide-react';
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
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // 상태 관리
  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  // 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) return;

    loadData();
  }, [isAuthenticated, boardId, postId]);

  const loadData = async () => {
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
      const postResponse = await postApi.getPost(Number(postId));
      setPost(postResponse);

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

    } catch (error: any) {
      console.error('게시글 삭제 실패:', error);
      toast({
        title: '오류',
        description: error?.message || '게시글 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEditPost = () => {
    router.push(`/boards/${boardId}/posts/${postId}/edit`);
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

          {/* 댓글 영역 (추후 구현) */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                댓글 {post.cmt_cnt > 0 && `(${post.cmt_cnt})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>댓글이 없습니다.</p>
                <p className="text-sm mt-1">첫 번째 댓글을 작성해보세요.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
