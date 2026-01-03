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
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">게시판</h1>
            <p className="text-muted-foreground">
              다양한 주제로 소통하고 정보를 공유하세요.
            </p>
          </div>
          <Button asChild>
            <Link href="/boards/create">
              <Plus className="mr-2 h-4 w-4" />
              게시글 작성
            </Link>
          </Button>
        </div>

        {/* 필터 및 검색 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="게시판명 또는 설명으로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">이름순</SelectItem>
              <SelectItem value="posts">게시글 수</SelectItem>
              <SelectItem value="created">최신순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 게시판 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBoards.map((board) => (
              <Card key={board.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        <Link
                          href={`/boards/${board.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {board.nm}
                        </Link>
                      </CardTitle>
                      {board.dsc && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {board.dsc}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={getBoardTypeColor(board.typ)} className="ml-2 shrink-0">
                      {getBoardTypeLabel(board.typ)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{board.post_count?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>활성</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/boards/${board.id}`}>
                        들어가기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredBoards.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">게시판이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  {searchKeyword || selectedType !== 'ALL'
                    ? '검색 조건에 맞는 게시판이 없습니다.'
                    : '아직 생성된 게시판이 없습니다.'}
                </p>
                {(searchKeyword || selectedType !== 'ALL') && (
                  <Button variant="outline" onClick={() => {
                    setSearchKeyword('');
                    setSelectedType('ALL');
                  }}>
                    필터 초기화
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
