'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { boardApi } from '@/lib/api/boards';
import { Board, BoardType, PermissionLevel } from '@/types/board';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';
import { Search, Plus, Users, MessageSquare, Eye } from 'lucide-react';

export default function BoardsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      setLoading(true);
      const response = await boardApi.getBoards();
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

  const filteredBoards = (boards || []).filter((board) => {
    // 검색어 필터링
    const matchesSearch = !searchKeyword ||
      board.nm?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      board.dsc?.toLowerCase().includes(searchKeyword.toLowerCase());

    // 유형 필터링
    const matchesType = selectedType === 'ALL' || board.typ === selectedType;

    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.nm || '').localeCompare(b.nm || '');
      case 'posts':
        return (b.post_count || 0) - (a.post_count || 0);
      case 'created':
        return new Date(b.crt_dt).getTime() - new Date(a.crt_dt).getTime();
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">
            커뮤니티 게시판
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            다양한 주제로 소통하고 정보를 공유하는 공간입니다.
            관심 있는 주제의 게시판에서 자유롭게 의견을 나누세요.
          </p>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="게시판 이름이나 설명으로 검색해보세요..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="pl-12 h-12 text-base border-slate-200 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-white/50 backdrop-blur-sm border-slate-200 rounded-xl">
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="GENERAL">일반</SelectItem>
                  <SelectItem value="NOTICE">공지</SelectItem>
                  <SelectItem value="QNA">Q&A</SelectItem>
                  <SelectItem value="IMAGE">이미지</SelectItem>
                  <SelectItem value="VIDEO">동영상</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 h-12 bg-white/50 backdrop-blur-sm border-slate-200 rounded-xl">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="posts">게시글순</SelectItem>
                  <SelectItem value="created">최신순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 게시판 그리드 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            {filteredBoards.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBoards.map((board) => {
                  const getBoardGradient = (type: BoardType) => {
                    const gradients = {
                      GENERAL: 'from-blue-500 to-blue-600',
                      NOTICE: 'from-red-500 to-red-600',
                      QNA: 'from-green-500 to-green-600',
                      IMAGE: 'from-purple-500 to-purple-600',
                      VIDEO: 'from-orange-500 to-orange-600',
                    };
                    return gradients[type] || 'from-slate-500 to-slate-600';
                  };

                  const getBoardIcon = (type: BoardType) => {
                    const icons = {
                      GENERAL: '💬',
                      NOTICE: '📢',
                      QNA: '❓',
                      IMAGE: '🖼️',
                      VIDEO: '🎥',
                    };
                    return icons[type] || '📄';
                  };

                  return (
                    <div
                      key={board.id}
                      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* 배경 그라데이션 오버레이 */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${getBoardGradient(board.typ)} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />

                      <div className="relative">
                        {/* 헤더 */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getBoardIcon(board.typ)}</div>
                            <div>
                              <Badge
                                variant={getBoardTypeColor(board.typ)}
                                className="text-xs font-medium px-2 py-1"
                              >
                                {getBoardTypeLabel(board.typ)}
                              </Badge>
                            </div>
                          </div>
                          {board.actv_yn && (
                            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              활성
                            </div>
                          )}
                        </div>

                        {/* 게시판 제목 */}
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">
                          <Link href={`/boards/${board.id}`} className="block">
                            {board.nm}
                          </Link>
                        </h3>

                        {/* 설명 */}
                        {board.dsc && (
                          <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {board.dsc}
                          </p>
                        )}

                        {/* 통계 */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              <span className="font-medium">{board.post_count?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>활성</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                          >
                            <Link href={`/boards/${board.id}`}>
                              들어가기 →
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-lg max-w-md mx-auto">
                  <div className="text-6xl mb-6">📭</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">게시판이 없습니다</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {searchKeyword || selectedType !== 'ALL'
                      ? '검색 조건에 맞는 게시판이 없습니다.'
                      : '아직 생성된 게시판이 없습니다.'}
                  </p>
                  {(searchKeyword || selectedType !== 'ALL') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchKeyword('');
                        setSelectedType('ALL');
                      }}
                      className="bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white/80"
                    >
                      필터 초기화
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* 플로팅 액션 버튼 */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            asChild
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Link href="/boards/create">
              <Plus className="h-6 w-6" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
