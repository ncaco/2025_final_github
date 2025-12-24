/**
 * 로그인 폼 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/api/auth';
import { tokenStorage } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { getCurrentUser } from '@/lib/api/users';
import { Loading } from '@/components/common/Loading';

export function LoginForm() {
  const router = useRouter();
  const { login: setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const tokenData = await login({
        username: formData.username,
        password: formData.password,
      });

      // 토큰 저장
      tokenStorage.setTokens(tokenData.access_token, tokenData.refresh_token);

      // 사용자 정보 가져오기
      const user = await getCurrentUser();
      setUser(user);

      // 홈으로 리다이렉트
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>계정에 로그인하여 계속하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="username">사용자명 또는 이메일</Label>
            <Input
              id="username"
              type="text"
              placeholder="사용자명 또는 이메일을 입력하세요"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loading size="sm" /> : '로그인'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

