'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { boardApi } from '@/lib/api/boards';
import { postApi } from '@/lib/api/posts';
import { Board, BoardType, PermissionLevel } from '@/types/board';
import { Post } from '@/types/post';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';
import { Search, Plus, MessageSquare, Eye, ThumbsUp, User, Calendar, ArrowLeft } from 'lucide-react';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<string>('latest');

  const boardId = params.id as string;

  useEffect(() => {
    if (boardId) {
      loadBoard();
      loadPosts();
    }
  }, [boardId]);

  const loadBoard = async () => {
    try {
      setBoardLoading(true);
      const response = await boardApi.getBoard(parseInt(boardId));
      setBoard(response);
    } catch (error) {
      console.error('게시판 로딩 실패:', error);
      toast({
        title: '오류',
        description: '게시판 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      router.push('/boards');
    } finally {
      setBoardLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPosts({
        board_id: parseInt(boardId),
        page: 1,
        limit: 20,
      });
      setPosts(response.posts);
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
      toast({
        title: '오류',
        description: '게시글을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchKeyword) return true;
    return (
      post.ttl?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      post.cn?.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }).sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.crt_dt).getTime() - new Date(a.crt_dt).getTime();
      case 'views':
        return (b.vw_cnt || 0) - (a.vw_cnt || 0);
      case 'likes':
        return (b.lk_cnt || 0) - (a.lk_cnt || 0);
      default:
        return 0;
    }
  });

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

  // 게시판 타입별 설정
  const getBoardConfig = (board: Board | null) => {
    if (!board) return null;

    const configs = {
      GENERAL: {
        icon: MessageSquare,
        theme: {
          bg: 'bg-blue-50/50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          accent: 'text-blue-700'
        },
        description: '자유롭게 이야기를 나누는 공간입니다.',
        features: ['텍스트 게시글', '댓글', '좋아요', '북마크']
      },
      NOTICE: {
        icon: MessageSquare,
        theme: {
          bg: 'bg-red-50/50',
          border: 'border-red-200',
          icon: 'text-red-600',
          accent: 'text-red-700'
        },
        description: '중요한 공지사항을 확인하세요.',
        features: ['공지사항', '중요 공지', '일반 공지']
      },
      QNA: {
        icon: MessageSquare,
        theme: {
          bg: 'bg-green-50/50',
          border: 'border-green-200',
          icon: 'text-green-600',
          accent: 'text-green-700'
        },
        description: '질문과 답변을 주고받는 공간입니다.',
        features: ['질문하기', '답변하기', '채택하기']
      },
      IMAGE: {
        icon: MessageSquare,
        theme: {
          bg: 'bg-purple-50/50',
          border: 'border-purple-200',
          icon: 'text-purple-600',
          accent: 'text-purple-700'
        },
        description: '이미지를 공유하고 감상하는 공간입니다.',
        features: ['이미지 업로드', '갤러리 뷰', '댓글']
      },
      VIDEO: {
        icon: MessageSquare,
        theme: {
          bg: 'bg-orange-50/50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          accent: 'text-orange-700'
        },
        description: '동영상을 공유하고 감상하는 공간입니다.',
        features: ['동영상 업로드', '플레이어', '댓글']
      }
    };

    return configs[board.typ] || configs.GENERAL;
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
          <p className="text-muted-foreground">게시판을 이용하려면 먼저 로그인해주세요.</p>
          <Button asChild>
            <Link href="/auth/login">로그인하기</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (boardLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">게시판을 찾을 수 없습니다</h1>
          <p className="text-muted-foreground">존재하지 않는 게시판이거나 접근 권한이 없습니다.</p>
          <Button asChild>
            <Link href="/boards">게시판 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto py-8 px-4">
        {/* 헤더 섹션 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 mb-6 sm:mb-8 border border-white/20 shadow-lg">
          {/* 뒤로가기 버튼 */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-slate-100/50"
            >
              <Link href="/boards">
                <ArrowLeft className="mr-2 h-4 w-4" />
                게시판 목록으로
              </Link>
            </Button>
          </div>

          {/* 게시판 정보 */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                {(() => {
                  const config = getBoardConfig(board);
                  const getBoardEmoji = (type: BoardType) => {
                    const emojis = {
                      GENERAL: '💬',
                      NOTICE: '📢',
                      QNA: '❓',
                      IMAGE: '🖼️',
                      VIDEO: '🎥',
                    };
                    return emojis[type] || '📄';
                  };

                  return (
                    <>
                      <div className="text-4xl bg-gradient-to-br from-blue-500 to-blue-600 bg-clip-text text-transparent">
                        {getBoardEmoji(board.typ)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800">
                            {board.nm}
                          </h1>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={getBoardTypeColor(board.typ)}
                              className="text-sm px-3 py-1"
                            >
                              {getBoardTypeLabel(board.typ)}
                            </Badge>
                            {board.actv_yn && (
                              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                활성
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-600 text-lg mb-3">
                          {config?.description}
                        </p>
                        {board.dsc && (
                          <p className="text-slate-700 leading-relaxed">
                            {board.dsc}
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* 게시판 기능 표시 */}
              {(() => {
                const config = getBoardConfig(board);
                if (config?.features) {
                  return (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {config.features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-sm px-3 py-1 bg-white/50 border-slate-200"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* 글쓰기 버튼 */}
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={`/boards/${boardId}/create`}>
                <Plus className="mr-2 h-5 w-5" />
                글쓰기
              </Link>
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          {(() => {
            const config = getBoardConfig(board);
            const stats = [
              {
                title: '총 게시글',
                value: board.post_count?.toLocaleString() || 0,
                icon: MessageSquare,
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                title: '오늘 게시글',
                value: '0',
                icon: Calendar,
                gradient: 'from-green-500 to-green-600'
              },
              {
                title: '총 조회수',
                value: '0',
                icon: Eye,
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                title: '팔로워',
                value: '0',
                icon: User,
                gradient: 'from-orange-500 to-orange-600'
              }
            ];

            return stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* 검색 및 필터 바 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="제목이나 내용으로 검색해보세요..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-12 h-12 text-base border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 h-12 bg-white/50 backdrop-blur-sm border-slate-200 rounded-xl">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="views">조회순</SelectItem>
                <SelectItem value="likes">추천순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            {filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      {/* 게시글 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Link
                                href={`/boards/${boardId}/posts/${post.id}`}
                                className="text-xl font-bold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1 group-hover:underline"
                              >
                                {post.ttl}
                              </Link>
                              <div className="flex items-center gap-1">
                                {post.ntce_yn && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                    📢 공지
                                  </Badge>
                                )}
                                {post.scr_yn && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    🔒 비밀
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {post.smmry && (
                              <p className="text-slate-600 text-base mb-4 line-clamp-2 leading-relaxed">
                                {post.smmry}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">익명</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.crt_dt).toLocaleDateString('ko-KR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.vw_cnt || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.lk_cnt || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.cmt_cnt || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg max-w-md mx-auto">
                  <div className="text-6xl mb-6">📝</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">게시글이 없습니다</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {searchKeyword
                      ? '검색 조건에 맞는 게시글이 없습니다.'
                      : '아직 작성된 게시글이 없습니다.'}
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/boards/${boardId}/create`}>
                      첫 게시글 작성하기
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 플로팅 액션 버튼 */}
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            asChild
            size="lg"
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Link href={`/boards/${boardId}/create`}>
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
