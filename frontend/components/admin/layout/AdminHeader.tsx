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
import { cn } from '@/lib/utils/cn';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onToggleHeader: () => void;
  isHeaderOpen: boolean;
}

export function AdminHeader({ onToggleSidebar, isSidebarOpen, onToggleHeader, isHeaderOpen }: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 헤더가 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isHeaderOpen) {
      // 헤더가 열려있을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 헤더가 닫혀있을 때 body 스크롤 복원
      document.body.style.overflow = '';
    }

    // cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isHeaderOpen]);

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

  return (
    <>
      <header className={cn(
        "fixed left-0 right-0 z-50 w-full border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out",
        isHeaderOpen ? "top-0" : "-top-16"
      )}>
        <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 transition-all hover:opacity-90 hover:scale-[1.02]"
            >
              <div className="relative">
                <Image
                  src="/logo.svg"
                  alt="2026 Challenge Logo"
                  width={36}
                  height={36}
                  className="h-9 w-9 drop-shadow-sm"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-foreground tracking-tight">
                    2026 Challenge
                  </span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-primary/10">
                    Admin
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-muted/60 to-muted/40 border border-border/50 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-foreground/90">
                {user?.nickname || user?.username}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="border-border/50 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors"
            >
              로그아웃
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/50 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors"
              onClick={handleGoToMain}
              title="메인으로 이동"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
      
      {/* 역 사다리꼴 모양 헤더 토글 버튼 */}
      <div className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out",
        isHeaderOpen ? "top-16" : "top-0"
      )}>
        {/* 상단 구분선 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        
        {/* 테두리용 외부 div */}
        <div
          className="relative border border-border/40 bg-background/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_2px_6px_rgba(59,130,246,0.15)]"
          style={{
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            width: '56px',
            height: '24px',
            marginTop: '2px'
          }}
        >
          {/* 내부 버튼 */}
          <button
            onClick={onToggleHeader}
            className={cn(
              "absolute inset-[1px] bg-background transition-all duration-300",
              "hover:bg-primary/5",
              "active:scale-[0.98] cursor-pointer",
              "flex items-center justify-center",
              "group"
            )}
            style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
            }}
            title={isHeaderOpen ? '헤더 접기' : '헤더 펼치기'}
          >
            <div className="relative z-10 transition-all duration-300 group-hover:scale-110">
              {isHeaderOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/50 group-hover:text-primary transition-colors"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/50 group-hover:text-primary transition-colors"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>
      
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

