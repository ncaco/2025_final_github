/**
 * 인증 스토어 (Zustand)
 * 사용자 인증 상태 및 액션을 관리합니다.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import { tokenStorage } from '@/lib/api/client';
import { getCurrentUser } from '@/lib/api/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // 초기 인증 확인 완료 여부
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  initialize: () => Promise<void>; // 초기 인증 확인
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // 초기 로딩 상태를 true로 설정
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      login: (user) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        tokenStorage.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const accessToken = tokenStorage.getAccessToken();
        if (!accessToken) {
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
          return false;
        }

        // 토큰이 있으면 서버에서 사용자 정보 확인
        try {
          const user = await getCurrentUser();
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          // 토큰이 유효하지 않으면 로그아웃 처리
          console.error('인증 확인 실패:', error);
          tokenStorage.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }
      },

      initialize: async () => {
        // 이미 초기화되었으면 스킵
        if (get().isInitialized) {
          return;
        }

        set({ isLoading: true });
        
        try {
          await get().checkAuth();
        } catch (error) {
          console.error('초기 인증 확인 실패:', error);
        } finally {
          set({ 
            isLoading: false,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // isLoading과 isInitialized는 저장하지 않음 (매번 확인 필요)
      }),
    }
  )
);

