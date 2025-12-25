/**
 * 로그인 페이지
 */

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

function LoginFormWrapper() {
  return (
    <>
      <LoginForm />
      <div className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{' '}
        <Link href="/auth/register" className="text-primary hover:underline">
          회원가입
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Suspense fallback={<div>로딩 중...</div>}>
          <LoginFormWrapper />
        </Suspense>
      </div>
    </div>
  );
}

