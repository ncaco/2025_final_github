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
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/boards">
                <ArrowLeft className="mr-2 h-4 w-4" />
                목록으로
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const config = getBoardConfig(board);
                  const IconComponent = config?.icon || MessageSquare;
                  return (
                    <>
                      <IconComponent className={`h-8 w-8 ${config?.theme.accent}`} />
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight">{board.nm}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config?.description}
                        </p>
                      </div>
                    </>
                  );
                })()}
                <Badge variant={getBoardTypeColor(board.typ)}>
                  {getBoardTypeLabel(board.typ)}
                </Badge>
                {board.actv_yn && (
                  <Badge variant="default">활성</Badge>
                )}
              </div>
              {board.dsc && (
                <p className="text-muted-foreground">{board.dsc}</p>
              )}

              {/* 게시판 기능 표시 */}
              {(() => {
                const config = getBoardConfig(board);
                if (config?.features) {
                  return (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {config.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <Button asChild>
              <Link href={`/boards/${boardId}/create`}>
                <Plus className="mr-2 h-4 w-4" />
                글쓰기
              </Link>
            </Button>
          </div>
        </div>

        {/* 통계 */}
          <div className="grid gap-4 md:grid-cols-4">
          {(() => {
            const config = getBoardConfig(board);

            return (
              <>
                <Card className={`${config?.theme.bg} ${config?.theme.border}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">총 게시글</CardTitle>
                    <MessageSquare className={`h-4 w-4 ${config?.theme.icon}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{board.post_count?.toLocaleString() || 0}</div>
                  </CardContent>
                </Card>
                <Card className={`${config?.theme.bg} ${config?.theme.border}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">오늘 게시글</CardTitle>
                    <Calendar className={`h-4 w-4 ${config?.theme.icon}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
                <Card className={`${config?.theme.bg} ${config?.theme.border}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
                    <Eye className={`h-4 w-4 ${config?.theme.icon}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
                <Card className={`${config?.theme.bg} ${config?.theme.border}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">팔로워</CardTitle>
                    <User className={`h-4 w-4 ${config?.theme.icon}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>

        {/* 필터 및 검색 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="제목 또는 내용으로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="views">조회순</SelectItem>
              <SelectItem value="likes">추천순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 게시글 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/boards/${boardId}/posts/${post.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1"
                        >
                          {post.ttl}
                        </Link>
                        {post.ntce_yn && (
                          <Badge variant="destructive" className="text-xs">공지</Badge>
                        )}
                        {post.scr_yn && (
                          <Badge variant="secondary" className="text-xs">비밀</Badge>
                        )}
                      </div>
                      {post.smmry && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {post.smmry}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>익명</span>
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
                </CardContent>
              </Card>
            ))}
            {filteredPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">게시글이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  {searchKeyword
                    ? '검색 조건에 맞는 게시글이 없습니다.'
                    : '아직 작성된 게시글이 없습니다.'}
                </p>
                <Button asChild>
                  <Link href={`/boards/${boardId}/create`}>
                    첫 게시글 작성하기
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
