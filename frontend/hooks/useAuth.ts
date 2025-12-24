/**
 * 인증 관련 커스텀 훅
 */

import { useAuthStore } from '@/stores/auth';
import { useEffect } from 'react';

/**
 * 인증 상태 및 액션 훅
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    login,
    logout,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    // 컴포넌트 마운트 시 인증 상태 확인
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    login,
    logout,
    checkAuth,
  };
}

