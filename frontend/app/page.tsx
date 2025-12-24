'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">2026 Challenge</h1>
          <p className="text-xl text-muted-foreground">
            매월 하나의 MVP 서비스를 개발하는 챌린지 프로젝트
          </p>
        </div>

        {isAuthenticated ? (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>환영합니다, {user?.nickname || user?.username}님!</CardTitle>
              <CardDescription>
                로그인에 성공했습니다. 이제 서비스를 이용하실 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    프로필 보기
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" disabled>
                  서비스 목록 (준비 중)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>시작하기</CardTitle>
              <CardDescription>
                계정을 생성하거나 로그인하여 서비스를 이용하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button asChild className="w-full">
                  <Link href="/auth/register">회원가입</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">로그인</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3 w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">인증 시스템</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                JWT 기반 인증 및 사용자 관리 시스템
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">역할 및 권한</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                유연한 역할 기반 접근 제어 시스템
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">RESTful API</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                표준 REST API 설계 원칙 준수
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
