/**
 * 헤더 컴포넌트
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { logoutApi } from '@/lib/api/auth';
import { useToast } from '@/hooks/useToast';
import { isAdmin } from '@/utils/roles';
import { ChevronDown, MessageSquare, TrendingUp, Heart, Star, Plus } from 'lucide-react';
import { boardApi } from '@/lib/api/boards';
import { Board } from '@/types/board';

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAdminUser, setIsAdminUser] = useState(false);

  // 게시판 메뉴 상태
  const [boards, setBoards] = useState<Board[]>([]);
  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);
  const [boardMenuTimeout, setBoardMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const boardMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isAtTop = currentScrollY === 0;
      const isAtBottom = currentScrollY + windowHeight >= documentHeight - 10; // 10px 여유

      // 맨 위에 있으면 항상 표시
      if (isAtTop) {
        setIsVisible(true);
      } else if (isAtBottom) {
        // 맨 아래에 있으면 숨김 (푸터가 보이도록)
        setIsVisible(false);
      } else {
        // 스크롤 방향에 따라 표시/숨김
        if (currentScrollY < lastScrollY) {
          // 스크롤 업
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // 스크롤 다운 (100px 이상 스크롤했을 때만 숨김)
          setIsVisible(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (isAuthenticated && user) {
        try {
          const admin = await isAdmin();
          setIsAdminUser(admin);
        } catch (error) {
          console.error('관리자 확인 중 오류:', error);
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(false);
      }
    };

    checkAdmin();
  }, [isAuthenticated, user]);

  // 게시판 메뉴 데이터 로드
  useEffect(() => {
    const loadBoards = async () => {
      if (isAuthenticated) {
        try {
          const response = await boardApi.getBoards();
          // 인기 게시판 우선 정렬 (게시글 수 기준)
          const sortedBoards = (response || []).sort((a, b) =>
            (b.post_count || 0) - (a.post_count || 0)
          );
          // 최대 8개만 표시
          setBoards(sortedBoards.slice(0, 8));
        } catch (error) {
          console.error('게시판 목록 로드 실패:', error);
        }
      }
    };

    loadBoards();
  }, [isAuthenticated]);

  // 게시판 메뉴 호버 핸들러
  const handleBoardMenuEnter = () => {
    if (boardMenuTimeout) {
      clearTimeout(boardMenuTimeout);
      setBoardMenuTimeout(null);
    }
    setIsBoardMenuOpen(true);
  };

  const handleBoardMenuLeave = () => {
    const timeout = setTimeout(() => {
      setIsBoardMenuOpen(false);
    }, 300); // 300ms 딜레이
    setBoardMenuTimeout(timeout);
  };

  // 메뉴 아이템 클릭 시 메뉴 닫기
  const handleBoardMenuItemClick = () => {
    setIsBoardMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      toast({
        title: '로그아웃',
        description: '로그아웃되었습니다.',
        variant: 'success',
      });
      router.push('/auth/login');
    } catch (error) {
      // API 실패해도 클라이언트에서 로그아웃 처리
      logout();
      toast({
        title: '로그아웃',
        description: '로그아웃되었습니다.',
        variant: 'success',
      });
      router.push('/auth/login');
    }
  };

  // 상단 호버 시 표시
  const shouldShow = isVisible || isTopHovered;

  return (
    <>
      {/* 상단 호버 영역 */}
      <div
        className="fixed top-0 left-0 right-0 h-4 z-50 bg-transparent"
        onMouseEnter={() => setIsTopHovered(true)}
        onMouseLeave={() => setIsTopHovered(false)}
      />
      
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-transform duration-300 ease-in-out ${
          shouldShow ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={() => setIsTopHovered(true)}
        onMouseLeave={() => setIsTopHovered(false)}
      >
        <div className="container mx-auto px-2 sm:px-2.5 lg:px-3">
        <div className="flex h-16 items-center justify-between">
          {/* 왼쪽: 로고 */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo.svg"
                alt="2026 Challenge Logo"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">
                  2026 Challenge
                </span>
              </div>
            </Link>
          </div>

          {/* 가운데: 메뉴 */}
          <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
            >
              홈
            </Link>
            {isAuthenticated ? (
              <>
                <div
                  className="relative"
                  onMouseEnter={handleBoardMenuEnter}
                  onMouseLeave={handleBoardMenuLeave}
                  ref={boardMenuRef}
                >
                  <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md">
                    게시판
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isBoardMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  프로필
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  대시보드
                </Link>
                <Link
                  href="/services"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  서비스
                </Link>
                {isAdminUser && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-sm font-medium text-primary transition-colors hover:text-primary hover:bg-primary/10 rounded-md"
                  >
                    관리자
                  </Link>
                )}
                <Link
                  href="/settings"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  설정
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  소개
                </Link>
                <Link
                  href="/services"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  서비스
                </Link>
                <Link
                  href="/docs"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  문서
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground hover:bg-muted/50 rounded-md"
                >
                  문의
                </Link>
              </>
            )}
          </nav>

          {/* 오른쪽: 사용자 정보 및 버튼 */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
                  <span className="text-sm font-medium text-foreground">
                    {user?.nickname || user?.username}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/auth/login">로그인</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">회원가입</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 게시판 2차 메뉴 드롭다운 */}
      {isAuthenticated && isBoardMenuOpen && (
        <div
          className="absolute top-full left-0 right-0 bg-white/100 backdrop-blur-sm border-b shadow-lg transition-all duration-300 ease-out z-51"
          onMouseEnter={handleBoardMenuEnter}
          onMouseLeave={handleBoardMenuLeave}
        >
          <div className="container mx-auto px-2 sm:px-2.5 lg:px-3">
            <div className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 빠른 메뉴 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">빠른 메뉴</h3>
                  <div className="space-y-2">
                    <Link
                      href="/boards"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                      onClick={handleBoardMenuItemClick}
                    >
                      <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">전체 게시판</div>
                        <div className="text-xs text-muted-foreground">모든 게시판 보기</div>
                      </div>
                    </Link>
                    <Link
                      href="/boards?tab=popular"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                      onClick={handleBoardMenuItemClick}
                    >
                      <div className="p-2 rounded-lg bg-orange-100 group-hover:bg-orange-200 transition-colors">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">인기 게시판</div>
                        <div className="text-xs text-muted-foreground">가장 활발한 게시판</div>
                      </div>
                    </Link>
                    <Link
                      href="/boards?tab=followed"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                      onClick={handleBoardMenuItemClick}
                    >
                      <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">팔로우 게시판</div>
                        <div className="text-xs text-muted-foreground">관심 있는 게시판 모음</div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* 인기 게시판 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">인기 게시판</h3>
                  <div className="space-y-1">
                    {boards.slice(0, 6).map((board, index) => (
                      <Link
                        key={board.id}
                        href={`/boards/${board.id}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                        onClick={handleBoardMenuItemClick}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">
                            {board.nm}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{board.post_count || 0}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* 최근 활동 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">최근 활동</h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">새 게시글 알림</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        팔로우한 게시판에 새로운 글이 올라왔어요
                      </p>
                    </div>
                    <div className="text-center py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        onClick={handleBoardMenuItemClick}
                      >
                        <Link href="/boards/create">
                          <Plus className="mr-2 h-4 w-4" />
                          게시글 작성
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </header>
    </>
  );
}

