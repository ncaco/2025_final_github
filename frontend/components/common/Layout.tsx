/**
 * 기본 레이아웃 컴포넌트
 */

'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { ErrorBoundary } from './ErrorBoundary';
import { Loading } from './Loading';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { isLoading, isInitialized } = useAuth();
  
  // 인증 페이지는 인증 확인을 기다리지 않음
  const isAuthPage = pathname?.startsWith('/auth');
  
  // 초기 인증 확인이 완료될 때까지 로딩 표시 (인증 페이지 제외)
  if (!isAuthPage && (!isInitialized || isLoading)) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" />
        </div>
        <Toaster />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <Header />
        {/* 헤더가 fixed이므로 여백 추가 */}
        <div className="h-16" />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}

