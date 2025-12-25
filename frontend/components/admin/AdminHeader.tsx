/**
 * 관리자 헤더 컴포넌트
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

export function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

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
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
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
                <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              메인으로
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
              <span className="text-sm font-medium text-foreground">
                {user?.nickname || user?.username}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </div>
      </header>
    </>
  );
}

