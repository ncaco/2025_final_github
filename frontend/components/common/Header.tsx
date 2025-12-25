/**
 * 헤더 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { logoutApi } from '@/lib/api/auth';
import { useToast } from '@/hooks/useToast';
import { isAdmin } from '@/utils/roles';

export function Header() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAdminUser, setIsAdminUser] = useState(false);

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
      </header>
    </>
  );
}

