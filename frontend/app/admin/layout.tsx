/**
 * 관리자 레이아웃
 * /admin 경로 하위의 모든 페이지에 적용됩니다.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/admin/layout/AdminHeader';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { Loading } from '@/components/common/Loading';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin } from '@/utils/roles';
import { useToast } from '@/hooks/useToast';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminPermission = async () => {
      // 인증 로딩 중이면 대기
      if (authLoading || !isInitialized) {
        return;
      }

      // 인증되지 않았으면 로그인 페이지로 리다이렉트
      if (!isAuthenticated || !user) {
        setIsChecking(false);
        setIsAdminUser(false);
        router.push('/auth/login');
        return;
      }

      try {
        const admin = await isAdmin(user.user_id);
        setIsAdminUser(admin);
        
        if (!admin) {
          toast({
            title: '접근 권한 없음',
            description: '관리자만 접근할 수 있는 페이지입니다.',
            variant: 'destructive',
          });
          router.push('/');
        }
      } catch (error) {
        console.error('관리자 확인 중 오류:', error);
        setIsAdminUser(false);
        toast({
          title: '오류',
          description: '관리자 권한을 확인하는 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminPermission();
  }, [isAuthenticated, user?.user_id, authLoading, isInitialized, router, toast]);

  // 인증 로딩 중이거나 권한 확인 중이면 로딩 표시
  if (authLoading || !isInitialized || isChecking || isAdminUser === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // 관리자가 아니면 아무것도 표시하지 않음 (이미 리다이렉트됨)
  if (!isAdminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      {/* 헤더가 fixed이므로 여백 추가 */}
      <div className="h-16" />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

