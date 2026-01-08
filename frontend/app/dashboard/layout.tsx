/**
 * 사용자 대시보드 레이아웃
 * /dashboard 경로 하위의 모든 페이지에 적용됩니다.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardMobileMenu } from '@/components/dashboard/DashboardMobileMenu';
import { Loading } from '@/components/common/Loading';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils/cn';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard_sidebar_open');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    // 인증 로딩 중이면 대기
    if (authLoading || !isInitialized) {
      return;
    }

    // 인증되지 않았으면 로그인 페이지로 리다이렉트
    if (!isAuthenticated || !user) {
      toast({
        title: '로그인 필요',
        description: '로그인이 필요한 페이지입니다.',
        variant: 'warning',
      });
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, user, authLoading, isInitialized, router, toast]);

  // 인증 로딩 중이면 로딩 표시
  if (authLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // 인증되지 않았으면 아무것도 표시하지 않음 (이미 리다이렉트됨)
  if (!isAuthenticated || !user) {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev: boolean) => {
      const newState = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboard_sidebar_open', JSON.stringify(newState));
      }
      return newState;
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* 헤더가 fixed이므로 여백 추가 */}  
      <div className="flex flex-1 min-h-0 relative">
        <DashboardSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} onToggle={toggleSidebar} />
        <main className={cn(
          "w-full lg:flex-1 min-h-0 overflow-auto",
          "p-4 sm:p-6 lg:p-8"
        )}>
          {children}
        </main>
      </div>
      <div className="lg:hidden shrink-0">
        <DashboardMobileMenu 
          onMenuToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
      <Toaster />
    </div>
  );
}
