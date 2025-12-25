/**
 * 로그인 폼 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/lib/api/auth';
import { tokenStorage } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';
import { getCurrentUser } from '@/lib/api/users';
import { Loading } from '@/components/common/Loading';
import { useToast } from '@/hooks/useToast';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: setUser } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // 회원가입 성공 메시지 표시
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast({
        title: '회원가입 성공',
        description: '회원가입이 완료되었습니다. 로그인해주세요.',
        variant: 'success',
      });
      // URL에서 쿼리 파라미터 제거
      router.replace('/auth/login');
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // 성공 메시지
      toast({
        title: '로그인 성공',
        description: '로그인되었습니다.',
        variant: 'success',
      });

      // 홈으로 리다이렉트
      router.push('/');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.';
      
      toast({
        title: '로그인 실패',
        description: errorMessage,
        variant: 'destructive',
      });
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

