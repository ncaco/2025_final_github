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
import { get, post, del } from '@/lib/api/client';
import { Board, BoardType, PermissionLevel } from '@/types/board';
import { Post } from '@/types/post';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';
import { Search, Plus, MessageSquare, Eye, Heart, User, Calendar, ArrowLeft, Megaphone, Lock, FileText, HelpCircle, ImageIcon, Video, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const boardId = params.id as string;

  useEffect(() => {
    if (boardId) {
      loadBoard();
      loadPosts();
    }
  }, [boardId]);

  // 게시판 로딩 완료 후 팔로우 상태 확인
  useEffect(() => {
    if (board && isAuthenticated) {
      checkFollowStatus();
    }
  }, [board, isAuthenticated, user]);

  // 페이지 포커스 시 목록 갱신 (삭제 후 돌아왔을 때 자동 갱신)
  useEffect(() => {
    const handleFocus = () => {
      if (boardId && !loading) {
        loadPosts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [boardId, loading]);

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

  const checkFollowStatus = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await get<{ is_following: boolean }>(`/api/v1/board-extra/follow/status/board/${boardId}`);
      setIsFollowing(response.is_following);
    } catch (error) {
      console.error('팔로우 상태 확인 실패:', error);
    }
  };


  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: '로그인 필요',
        description: '팔로우 기능을 이용하려면 로그인이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setFollowLoading(true);
      if (isFollowing) {
        await del<void>(`/api/v1/board-extra/follow/${boardId}?follow_type=BOARD`);
        setIsFollowing(false);
        toast({
          title: '팔로우 취소',
          description: '게시판 팔로우를 취소했습니다.',
        });
      } else {
        await post<{ id: number; follower_id: string; following_id: string; typ: string; crt_dt: string }>(
          '/api/v1/board-extra/follow',
          { following_id: boardId.toString(), typ: 'BOARD' }
        );
        setIsFollowing(true);
        toast({
          title: '팔로우 완료',
          description: '게시판을 팔로우했습니다.',
        });
      }
    } catch (error) {
      console.error('팔로우 토글 실패:', error);
      toast({
        title: '오류',
        description: '팔로우 처리 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPosts({
        board_id: parseInt(boardId),
        status: 'PUBLISHED', // 삭제된 게시물 제외를 위해 명시적으로 PUBLISHED만 조회
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
    // 삭제된 게시물 제외
    if (post.stts === 'DELETED') return false;
    
    // 검색 필터
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

  // 비밀번호 검증 및 게시글 상세 페이지로 이동
  const handlePasswordSubmit = async () => {
    if (!selectedPostId || !password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setVerifyingPassword(true);
      setPasswordError('');
      
      // 비밀번호 검증 및 접근 토큰 발급
      const response = await postApi.verifyPassword(selectedPostId, password);
      
      // 검증 성공 시 게시글 상세 페이지로 이동 (접근 토큰을 쿼리 파라미터로 전달)
      if (response.access_token) {
        router.push(`/boards/${boardId}/posts/${selectedPostId}?token=${encodeURIComponent(response.access_token)}`);
      } else {
        // 토큰이 없는 경우 (본인 글 등)
        router.push(`/boards/${boardId}/posts/${selectedPostId}`);
      }
      
      // 다이얼로그 닫기
      setShowPasswordDialog(false);
      setPassword('');
      setPasswordError('');
      setSelectedPostId(null);
    } catch (error: any) {
      console.error('비밀번호 검증 실패:', error);
      const errorMessage = error?.data?.detail || error?.message || '비밀번호가 올바르지 않습니다.';
      setPasswordError(errorMessage);
    } finally {
      setVerifyingPassword(false);
    }
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
      <div className="container mx-auto py-4 sm:py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* 콤팩트 헤더 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-4">
            {/* 뒤로가기 버튼 - 박스 안쪽으로 이동 */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-slate-100/50 rounded-lg shrink-0"
            >
              <Link href="/boards" className="flex items-center justify-center w-8 h-8">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            {/* 왼쪽: 게시판 정보 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {(() => {
                const getBoardIcon = (type: BoardType) => {
                  const icons = {
                    GENERAL: MessageSquare,
                    NOTICE: Megaphone,
                    QNA: HelpCircle,
                    IMAGE: ImageIcon,
                    VIDEO: Video,
                  };
                  return icons[type] || FileText;
                };

                const IconComponent = getBoardIcon(board.typ);

                return (
                  <>
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                          {board.nm}
                        </h1>
                        <Badge
                          variant={getBoardTypeColor(board.typ)}
                          className="text-xs px-2 py-0.5 shrink-0"
                        >
                          {getBoardTypeLabel(board.typ)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{board.post_count?.toLocaleString() || 0}</span>
                          <span>게시글</span>
                        </div>
                        {board.total_view_count !== undefined && (
                          <div className="hidden sm:flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>총 조회수: {board.total_view_count.toLocaleString()}</span>
                          </div>
                        )}
                        {board.follower_count !== undefined && (
                          <div className="hidden md:flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>팔로워: {board.follower_count.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* 팔로우 버튼 */}
            <Button
              onClick={handleFollowToggle}
              disabled={followLoading}
              size="sm"
              variant={isFollowing ? "default" : "outline"}
              className={`shrink-0 mr-2 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                isFollowing
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-red-500'
                  : 'bg-white/50 border-slate-200 hover:bg-red-50 hover:border-red-300 text-slate-700 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">
                {followLoading ? '처리중...' : (isFollowing ? '팔로잉' : '팔로우')}
              </span>
            </Button>

            {/* 글쓰기 버튼 - 좌측으로 이동 */}
            <Button
              asChild
              size="sm"
              className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/boards/${boardId}/create`} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">글쓰기</span>
              </Link>
            </Button>
          </div>
          </div>

          {/* 검색 및 필터 바 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-sm">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="게시글 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9 h-9 text-sm border-slate-200 bg-white/50 rounded-lg focus:ring-1 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-9 bg-white/50 border-slate-200 rounded-lg text-sm">
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
              <div className="space-y-3">
                {filteredPosts.map((post) => {
                  const isSecretPost = post.scr_yn && post.user_id !== user?.user_id;
                  
                  if (isSecretPost) {
                    return (
                      <div
                        key={post.id}
                        className="block group bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg opacity-75 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedPostId(post.id);
                          setShowPasswordDialog(true);
                          setPassword('');
                          setPasswordError('');
                        }}
                      >
                    <div className="flex items-start gap-4">
                      {/* 게시글 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1 group-hover:underline">
                                {post.scr_yn && post.user_id !== user?.user_id ? '비밀글입니다' : post.ttl}
                              </h3>
                              <div className="flex items-center gap-1">
                                {post.ntce_yn && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0.5 flex items-center gap-1">
                                    <Megaphone className="h-3 w-3" />
                                    공지
                                  </Badge>
                                )}
                                {post.scr_yn && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    비밀
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {post.smmry && !(post.scr_yn && post.user_id !== user?.user_id) && (
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
                            <Heart className="h-4 w-4" />
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
                    );
                  }

                  return (
                    <Link
                      key={post.id}
                      href={`/boards/${boardId}/posts/${post.id}`}
                      className="block group bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* 게시글 정보 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1 group-hover:underline">
                                  {post.ttl}
                                </h3>
                                <div className="flex items-center gap-1">
                                  {post.ntce_yn && (
                                    <Badge variant="destructive" className="text-xs px-2 py-0.5 flex items-center gap-1">
                                      <Megaphone className="h-3 w-3" />
                                      공지
                                    </Badge>
                                  )}
                                  {post.scr_yn && (
                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 flex items-center gap-1">
                                      <Lock className="h-3 w-3" />
                                      비밀
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
                              <Heart className="h-4 w-4" />
                              <span>{post.lk_cnt || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.cmt_cnt || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg max-w-md mx-auto">
                  <div className="flex justify-center mb-6">
                    <FileText className="h-16 w-16 text-slate-400" />
                  </div>
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
        </div>
      </div>

      {/* 비밀번호 입력 다이얼로그 */}
      <Dialog 
        open={showPasswordDialog} 
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            setPassword('');
            setPasswordError('');
            setSelectedPostId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              비밀글 비밀번호 입력
            </DialogTitle>
            <DialogDescription>
              이 게시글은 비밀글입니다. 비밀번호를 입력해주세요.
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
                  if (e.key === 'Enter' && !verifyingPassword && password.trim()) {
                    handlePasswordSubmit();
                  }
                }}
                disabled={verifyingPassword}
                className={passwordError ? 'border-red-500' : ''}
                autoFocus
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
                setShowPasswordDialog(false);
                setPassword('');
                setPasswordError('');
                setSelectedPostId(null);
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
