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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function AdminHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isTopHovered, setIsTopHovered] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const handleGoToMain = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmGoToMain = () => {
    router.push('/');
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50">
              <span className="text-sm font-medium text-foreground">
                {user?.nickname || user?.username}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleGoToMain}
              title="메인으로 이동"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      </header>
      
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="메인 페이지로 이동"
        description="메인 페이지로 이동하시겠습니까? 관리자 페이지를 벗어나게 됩니다."
        confirmText="이동"
        cancelText="취소"
        onConfirm={handleConfirmGoToMain}
      />
    </>
  );
}

