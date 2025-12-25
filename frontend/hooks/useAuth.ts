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
    isInitialized,
    setUser,
    setLoading,
    login,
    logout,
    checkAuth,
    initialize,
  } = useAuthStore();

  useEffect(() => {
    // 초기 인증 확인 (한 번만 실행)
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    setUser,
    setLoading,
    login,
    logout,
    checkAuth,
  };
}

