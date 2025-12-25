/**
 * 관리자 페이지
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isAdmin } from '@/utils/roles';
import { useToast } from '@/hooks/useToast';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkAdminPermission = useCallback(async () => {
    // 인증 로딩 중이면 대기
    if (authLoading) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.user_id, authLoading]);

  useEffect(() => {
    checkAdminPermission();
  }, [checkAdminPermission]);

  // 인증 로딩 중이거나 권한 확인 중이면 로딩 표시
  if (authLoading || isChecking || isAdminUser === null) {
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
      <div className="container mx-auto py-10">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">관리자 페이지</h1>
            <p className="text-muted-foreground mt-2">
              시스템 관리 및 설정을 관리할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
                <CardDescription>사용자 목록 조회 및 관리</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  사용자 목록 (준비 중)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>역할 관리</CardTitle>
                <CardDescription>역할 생성 및 권한 설정</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  역할 관리 (준비 중)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>권한 관리</CardTitle>
                <CardDescription>권한 생성 및 관리</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  권한 관리 (준비 중)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>감사 로그</CardTitle>
                <CardDescription>시스템 활동 로그 조회</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  로그 조회 (준비 중)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>파일 관리</CardTitle>
                <CardDescription>업로드된 파일 관리</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  파일 관리 (준비 중)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>시스템 설정</CardTitle>
                <CardDescription>시스템 전역 설정 관리</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  설정 (준비 중)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}

