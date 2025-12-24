/**
 * 회원가입 폼 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { register } from '@/lib/api/auth';
import { validateEmail, validatePassword, validateUsername } from '@/lib/utils/validation';
import { Loading } from '@/components/common/Loading';

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    eml: '',
    username: '',
    password: '',
    passwordConfirm: '',
    nm: '',
    nickname: '',
    telno: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 이메일 검증
    if (!formData.eml) {
      errors.eml = '이메일을 입력해주세요.';
    } else if (!validateEmail(formData.eml)) {
      errors.eml = '올바른 이메일 형식이 아닙니다.';
    }

    // 사용자명 검증
    if (!formData.username) {
      errors.username = '사용자명을 입력해주세요.';
    } else {
      const usernameValidation = validateUsername(formData.username);
      if (!usernameValidation.valid) {
        errors.username = usernameValidation.error || '사용자명이 올바르지 않습니다.';
      }
    }

    // 비밀번호 검증
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.errors.join(' ');
      }
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        eml: formData.eml,
        username: formData.username,
        password: formData.password,
        nm: formData.nm || undefined,
        nickname: formData.nickname || undefined,
        telno: formData.telno || undefined,
      });

      // 회원가입 성공 시 로그인 페이지로 리다이렉트
      router.push('/auth/login?registered=true');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '회원가입에 실패했습니다. 다시 시도해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>회원가입</CardTitle>
        <CardDescription>새 계정을 생성하여 시작하세요</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="eml">이메일 *</Label>
            <Input
              id="eml"
              type="email"
              placeholder="이메일을 입력하세요"
              value={formData.eml}
              onChange={(e) => setFormData({ ...formData, eml: e.target.value })}
              required
              disabled={isLoading}
            />
            {validationErrors.eml && (
              <p className="text-sm text-destructive">{validationErrors.eml}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">사용자명 *</Label>
            <Input
              id="username"
              type="text"
              placeholder="사용자명을 입력하세요 (최소 3자)"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={isLoading}
            />
            {validationErrors.username && (
              <p className="text-sm text-destructive">{validationErrors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호 *</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요 (최소 8자)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p className="text-sm text-destructive">{validationErrors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              required
              disabled={isLoading}
            />
            {validationErrors.passwordConfirm && (
              <p className="text-sm text-destructive">{validationErrors.passwordConfirm}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nm">이름</Label>
            <Input
              id="nm"
              type="text"
              placeholder="이름을 입력하세요 (선택사항)"
              value={formData.nm}
              onChange={(e) => setFormData({ ...formData, nm: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력하세요 (선택사항)"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telno">전화번호</Label>
            <Input
              id="telno"
              type="tel"
              placeholder="전화번호를 입력하세요 (선택사항)"
              value={formData.telno}
              onChange={(e) => setFormData({ ...formData, telno: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loading size="sm" /> : '회원가입'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

