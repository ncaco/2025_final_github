'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { boardApi } from '@/lib/api/boards';
import { Board, BoardType } from '@/types/board';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';
import { Plus, MessageSquare, FileText, HelpCircle, ImageIcon, Video, Megaphone, TrendingUp, Heart, Eye, User } from 'lucide-react';

type BoardTab = 'all' | 'popular' | 'followed';

export default function BoardsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<BoardTab>('all');

  // 탭별 제목과 설명
  const tabContent = {
    all: {
      title: '전체 게시판',
      description: '다양한 주제로 소통하고 정보를 공유하는 공간입니다.<br/>관심 있는 주제의 게시판에서 자유롭게 의견을 나누세요.',
      icon: MessageSquare,
    },
    popular: {
      title: '인기 게시판',
      description: '가장 활발하게 활동하는 게시판들을 만나보세요.<br/>인기 게시글과 토론이 활발한 커뮤니티입니다.',
      icon: TrendingUp,
    },
    followed: {
      title: '팔로우 게시판',
      description: '관심 있어하는 게시판들을 모아보세요.<br/>팔로우한 게시판의 최신 소식을 놓치지 마세요.',
      icon: Heart,
    },
  };

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (value: string) => {
    const newTab = value as BoardTab;
    setActiveTab(newTab);

    // URL 업데이트
    const params = new URLSearchParams(searchParams.toString());
    if (newTab === 'all') {
      params.delete('tab');
    } else {
      params.set('tab', newTab);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/boards${newUrl}`, { scroll: false });
  };

  // URL 파라미터에서 초기 탭 설정
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['all', 'popular', 'followed'].includes(tabParam)) {
      setActiveTab(tabParam as BoardTab);
    } else {
      setActiveTab('all');
    }
  }, [searchParams]);

  useEffect(() => {
    loadBoards();
  }, [activeTab]);

  const loadBoards = async () => {
    try {
      setLoading(true);
      let response: Board[] = [];

      switch (activeTab) {
        case 'all':
          response = await boardApi.getBoards();
          break;
        case 'popular':
          // 인기 게시판: 게시글 수 기준으로 정렬 (실제로는 별도 API가 필요할 수 있음)
          response = await boardApi.getBoards();
          response = response.sort((a, b) => (b.post_count || 0) - (a.post_count || 0));
          break;
        case 'followed':
          // 팔로우 게시판: 실제로는 팔로우 정보가 필요하지만, 일단 전체 표시
          // TODO: 팔로우 API 구현 필요
          response = await boardApi.getBoards();
          break;
        default:
          response = await boardApi.getBoards();
      }

      setBoards(response);
    } catch (error) {
      console.error('게시판 로딩 실패:', error);
      toast({
        title: '오류',
        description: '게시판 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto py-8 px-4">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {(() => {
              const IconComponent = tabContent[activeTab].icon;
              return <IconComponent className="w-8 h-8 text-blue-600" />;
            })()}
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              {tabContent[activeTab].title}
            </h1>
          </div>
          <p
            className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: tabContent[activeTab].description }}
          />
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                전체
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                인기
              </TabsTrigger>
              <TabsTrigger value="followed" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                팔로우
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 게시판 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            {boards.length > 0 ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {boards.map((board) => {
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
                    <Link
                      key={board.id}
                      href={`/boards/${board.id}`}
                      className="block group bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* 아이콘 */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                              <IconComponent className="w-6 h-6" />
                            </div>
                          </div>

                          {/* 게시판 정보 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                {board.nm}
                              </h3>
                              <Badge
                                variant={getBoardTypeColor(board.typ)}
                                className="text-xs font-medium px-2 py-1"
                              >
                                {getBoardTypeLabel(board.typ)}
                              </Badge>
                            </div>

                            {board.dsc && (
                              <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                {board.dsc}
                              </p>
                            )}

                            {/* 통계 정보 */}
                            <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span className="font-medium">{board.post_count?.toLocaleString() || 0}개의 게시글</span>
                              </div>
                              {board.total_view_count !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span className="font-medium">조회수 {board.total_view_count.toLocaleString()}</span>
                                </div>
                              )}
                              {board.follower_count !== undefined && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span className="font-medium">팔로워 {board.follower_count.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 이동 화살표 아이콘 */}
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg max-w-md mx-auto">
                  <div className="text-6xl mb-6">📭</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">게시판이 없습니다</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    아직 생성된 게시판이 없습니다.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
