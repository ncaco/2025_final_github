/**
 * 사용자별 역할 관리 상세 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserRoles, deleteUserRole, createUserRole } from '@/lib/api/userRoles';
import { getUsers } from '@/lib/api/users';
import { getRoles } from '@/lib/api/roles';
import type { UserRole, User, Role } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ApiClientError } from '@/lib/api/client';

export default function UserRolesDetailPage() {
  const { user_id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [user, setUser] = useState<(User & { roles: Role[]; userRoles: UserRole[] }) | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [userRoleToRemove, setUserRoleToRemove] = useState<UserRole | null>(null);
  const { toast } = useToast();

  // 디버깅: 사용 가능한 역할들 로깅
  useEffect(() => {
    if (user && allRoles.length > 0) {
      const availableRoles = allRoles.filter(
        r => !user.roles.some(ur => ur.role_id === r.role_id)
      );
      console.log('🔍 모든 역할들:', allRoles.map(r => ({ id: r.role_id, name: r.role_nm })));
      console.log('🔍 현재 사용자 역할들:', user.roles.map(r => ({ id: r.role_id, name: r.role_nm })));
      console.log('🔍 사용 가능한 역할들:', availableRoles.map(r => ({ id: r.role_id, name: r.role_nm })));
    }
  }, [allRoles, user]);

  // 사용자별 역할 데이터 로드
  const loadUserRolesData = useCallback(async () => {
    try {
      setLoading(true);

      // 모든 사용자, 역할, 사용자-역할 매핑을 동시에 가져옴
      const [usersData, rolesData, userRolesData] = await Promise.all([
        getUsers({ skip: 0, limit: 1000 }),
        getRoles(),
        getUserRoles({ skip: 0, limit: 1000 })
      ]);

      // 해당 사용자 찾기
      const targetUser = usersData.find(u => u.user_id === user_id);
      if (!targetUser) {
        toast({
          title: '오류',
          description: '존재하지 않는 사용자입니다.',
          variant: 'destructive',
        });
        router.push('/admin/user-roles');
        return;
      }

      // 사용자에 속한 역할들 결합
      const userRolesForUser = userRolesData.filter(ur => ur.user_id === user_id);
      const roles = userRolesForUser
        .map(ur => rolesData.find(r => r.role_id === ur.role_id))
        .filter(r => r !== undefined) as Role[];

      setUser({
        ...targetUser,
        roles,
        userRoles: userRolesForUser
      });
      setAllRoles(rolesData);
    } catch (error) {
      console.error('❌ 사용자별 역할 데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '사용자별 역할 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user_id, toast, router]);

  useEffect(() => {
    loadUserRolesData();
  }, [loadUserRolesData]);

  // 역할 추가
  const handleAddRole = async (roleId: string) => {
    if (!user || !roleId) return;

    console.log('🔄 역할 추가 시도:', { user_id: user.user_id, role_id: roleId });

    setIsAddingRole(true);
    try {
      const result = await createUserRole({ user_id: user.user_id, role_id: roleId });
      console.log('✅ 역할 추가 성공:', result);
      toast({
        title: '역할 추가 완료',
        description: '사용자에게 역할이 추가되었습니다.',
        variant: 'success',
      });
      loadUserRolesData();
    } catch (error) {
      console.error('❌ 역할 추가 실패:', error);
      console.error('에러 상세:', {
        message: error instanceof Error ? error.message : '알 수 없는 에러',
        stack: error instanceof Error ? error.stack : undefined,
        status: error instanceof ApiClientError ? error.status : undefined,
        data: error instanceof ApiClientError ? error.data : undefined
      });
      toast({
        title: '역할 추가 실패',
        description: error instanceof Error ? error.message : '역할 추가에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingRole(false);
    }
  };

  // 역할 삭제 확인
  const handleRemoveRoleClick = (userRole: UserRole) => {
    setUserRoleToRemove(userRole);
  };

  // 역할 삭제 실행
  const handleRemoveRoleConfirm = async () => {
    if (!userRoleToRemove) return;

    try {
      await deleteUserRole(userRoleToRemove.user_role_id);
      toast({
        title: '역할 삭제 완료',
        description: '사용자에게서 역할이 제거되었습니다.',
        variant: 'success',
      });
      setUserRoleToRemove(null);
      loadUserRolesData();
    } catch (error) {
      console.error('역할 삭제 실패:', error);
      toast({
        title: '역할 삭제 실패',
        description: error instanceof Error ? error.message : '역할 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 인증 상태 확인
  if (!isInitialized || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          로그인이 필요합니다
        </h2>
        <p className="text-muted-foreground text-center">
          사용자별 역할 관리를 확인하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          사용자를 찾을 수 없습니다
        </h2>
        <p className="text-muted-foreground text-center">
          요청한 사용자를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  // 할당되지 않은 역할들
  const availableRoles = user ? allRoles.filter(
    r => !user.roles.some(ur => ur.role_id === r.role_id)
  ) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">사용자 역할 관리</h1>
            <p className="text-sm text-muted-foreground">{user.username} 사용자의 역할을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadUserRolesData} variant="outline" size="icon" title="새로고침">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
            </Button>
            <Button
              onClick={() => router.push('/admin/user-roles')}
              variant="outline"
              size="icon"
              title="목록으로 돌아가기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* 사용자별 역할 관리 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {/* 사용자 정보 */}
          <div className="mb-6 p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">사용자 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">사용자명</label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border mt-1">
                  {user.username}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">사용자 ID</label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border font-mono text-sm mt-1">
                  {user.user_id}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">이메일</label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border mt-1">
                  {user.eml}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">활성 상태</label>
                <div className="mt-1">
                  <Badge variant={user.actv_yn ? 'default' : 'secondary'} className="text-xs">
                    {user.actv_yn ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 역할 추가 */}
          <div className="mb-6 p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">역할 추가</h3>
            <div className="flex items-center gap-3">
              <Select
                value=""
                onValueChange={handleAddRole}
                disabled={isAddingRole || availableRoles.length === 0}
              >
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue placeholder={
                    availableRoles.length === 0
                      ? "추가할 수 있는 역할이 없습니다"
                      : "추가할 역할 선택..."
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-32 overflow-y-auto">
                  {allRoles.map(role => {
                    const isAssigned = user.roles.some(ur => ur.role_id === role.role_id);
                    return (
                      <SelectItem
                        key={role.role_id}
                        value={role.role_id}
                        disabled={isAssigned}
                        className={isAssigned ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {role.role_nm} ({role.role_id})
                        {isAssigned && " (이미 할당됨)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {isAddingRole && (
                <div className="text-sm text-muted-foreground">추가 중...</div>
              )}
            </div>
          </div>

          {/* 할당된 역할 목록 */}
          <div className="p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              할당된 역할 ({user.roles.length}개)
            </h3>

            {user.roles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                할당된 역할이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {user.roles.map((role) => {
                  const userRole = user.userRoles.find(ur => ur.role_id === role.role_id);
                  return (
                    <div key={role.role_id} className="flex items-center justify-between p-4 rounded-md border bg-background">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{role.role_nm}</div>
                          <div className="text-sm text-muted-foreground font-mono">{role.role_id}</div>
                        </div>
                        <Badge variant="default" className="text-xs">
                          활성
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {userRole && new Date(userRole.crt_dt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => userRole && handleRemoveRoleClick(userRole)}
                        className="h-8 w-8 text-destructive hover:text-destructive border-destructive"
                        title="역할 제거"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 역할 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!userRoleToRemove}
        onOpenChange={(open) => !open && setUserRoleToRemove(null)}
        title="역할 제거"
        description={`${userRoleToRemove ? `${user?.username} 사용자로부터 역할을 제거하시겠습니까?` : ''}`}
        confirmText="제거"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleRemoveRoleConfirm}
      />
    </div>
  );
}
