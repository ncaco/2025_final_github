/**
 * 관리자 헤더 컴포넌트
 */

'use client';

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
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
  );
}

