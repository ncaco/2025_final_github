/**
 * 관리자 대시보드 페이지
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
      <div className="p-6">
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
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/users">사용자 목록</Link>
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

