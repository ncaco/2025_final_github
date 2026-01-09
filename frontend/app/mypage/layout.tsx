/**
 * 사용자 마이페이지 레이아웃
 * /mypage 경로 하위의 모든 페이지에 적용됩니다.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MyPageSidebar } from '@/components/mypage/MyPageSidebar';
import { MyPageProfileSidebar } from '@/components/mypage/MyPageProfileSidebar';
import { Loading } from '@/components/common/Loading';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils/cn';

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 모바일에서만 사용, 기본값은 닫힘

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
    setIsSidebarOpen((prev: boolean) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* 모바일 메뉴 토글 버튼 (헤더 아래, 스크롤 시 함께 움직임) */}
      <div className="lg:hidden bg-white border-b border-border shadow-sm">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <span>메뉴</span>
          <svg
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              isSidebarOpen ? "rotate-180" : ""
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 모바일 사이드바 (콜랩스 버튼 아래) */}
      <div className="lg:hidden">
        <MyPageSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      </div>

      {/* 사이드바와 메인 콘텐츠 */}
      <div className="flex flex-1 min-h-0">
        {/* 왼쪽 사이드바 - 데스크탑에서만 표시, 오른쪽과 동일한 구조 */}
        <div className="hidden lg:block">
          <MyPageSidebar isOpen={true} />
        </div>
        
        {/* 메인 콘텐츠 */}
        <main 
          className={cn(
            "w-full lg:flex-1 min-h-0 overflow-auto",
            "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          )}
          onClick={() => {
            // 모바일에서 다른 영역 클릭 시 콜랩스 닫기
            if (isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
        >
          {children}
        </main>

        {/* 오른쪽 프로필 사이드바 */}
        <MyPageProfileSidebar />
      </div>
      <Toaster />
    </div>
  );
}
