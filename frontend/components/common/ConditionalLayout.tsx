/**
 * 조건부 레이아웃 컴포넌트
 * 경로에 따라 일반 레이아웃 또는 관리자 레이아웃을 렌더링합니다.
 */

'use client';

import { usePathname } from 'next/navigation';
import { Layout } from './Layout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // 관리자 페이지는 관리자 레이아웃이 자체적으로 처리
  if (isAdminPage) {
    return <>{children}</>;
  }

  // 일반 페이지는 일반 레이아웃 사용
  return <Layout>{children}</Layout>;
}

