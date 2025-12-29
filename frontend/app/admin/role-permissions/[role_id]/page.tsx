/**
 * 역할별 권한 관리 상세 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRolePermissions, deleteRolePermission, createRolePermission } from '@/lib/api/rolePermissions';
import { getRoles } from '@/lib/api/roles';
import { getPermissions } from '@/lib/api/permissions';
import type { RolePermission, Role, Permission, RoleWithPermissions } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function RolePermissionsDetailPage() {
  const { role_id } = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [role, setRole] = useState<(Role & { permissions: Permission[]; rolePermissions: RolePermission[] }) | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [permissionToRemove, setPermissionToRemove] = useState<RolePermission | null>(null);
  const { toast } = useToast();

  // 역할별 권한 데이터 로드
  const loadRolePermissionsData = useCallback(async () => {
    try {
      setLoading(true);

      // 모든 역할, 권한, 역할-권한 매핑을 동시에 가져옴
      const [rolesData, permissionsData, rolePermissionsData] = await Promise.all([
        getRoles(),
        getPermissions({ skip: 0, limit: 1000 }),
        getRolePermissions({ skip: 0, limit: 1000 })
      ]);

      // 해당 역할 찾기
      const targetRole = rolesData.find(r => r.role_id === role_id);
      if (!targetRole) {
        toast({
          title: '오류',
          description: '존재하지 않는 역할입니다.',
          variant: 'destructive',
        });
        router.push('/admin/role-permissions');
        return;
      }

      // 역할에 속한 권한들 결합
      const rolePerms = rolePermissionsData.filter(rp => rp.role_id === role_id);
      const permissions = rolePerms
        .map(rp => permissionsData.find(p => p.permission_id === rp.permission_id))
        .filter(p => p !== undefined) as Permission[];

      setRole({
        ...targetRole,
        permissions,
        rolePermissions: rolePerms
      });
      setAllPermissions(permissionsData);
    } catch (error) {
      console.error('❌ 역할별 권한 데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '역할별 권한 데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [role_id, toast, router]);

  useEffect(() => {
    loadRolePermissionsData();
  }, [loadRolePermissionsData]);

  // 권한 추가
  const handleAddPermission = async (permissionId: string) => {
    if (!role || !permissionId) return;

    setIsAddingPermission(true);
    try {
      await createRolePermission({ role_id: role.role_id, permission_id: permissionId });
      toast({
        title: '권한 추가 완료',
        description: '역할에 권한이 추가되었습니다.',
        variant: 'success',
      });
      loadRolePermissionsData();
    } catch (error) {
      console.error('권한 추가 실패:', error);
      toast({
        title: '권한 추가 실패',
        description: error instanceof Error ? error.message : '권한 추가에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingPermission(false);
    }
  };

  // 권한 삭제 확인
  const handleRemovePermissionClick = (rolePermission: RolePermission) => {
    setPermissionToRemove(rolePermission);
  };

  // 권한 삭제 실행
  const handleRemovePermissionConfirm = async () => {
    if (!permissionToRemove) return;

    try {
      await deleteRolePermission(permissionToRemove.role_permission_id);
      toast({
        title: '권한 삭제 완료',
        description: '역할에서 권한이 제거되었습니다.',
        variant: 'success',
      });
      setPermissionToRemove(null);
      loadRolePermissionsData();
    } catch (error) {
      console.error('권한 삭제 실패:', error);
      toast({
        title: '권한 삭제 실패',
        description: error instanceof Error ? error.message : '권한 삭제에 실패했습니다.',
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
          역할-권한 관리를 확인하려면 먼저 로그인해주세요.
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

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          역할을 찾을 수 없습니다
        </h2>
        <p className="text-muted-foreground text-center">
          요청한 역할을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  // 할당되지 않은 권한들
  const availablePermissions = allPermissions.filter(
    p => !role.permissions.some(rp => rp.permission_id === p.permission_id)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">역할 권한 관리</h1>
            <p className="text-sm text-muted-foreground">{role.role_nm} 역할의 권한을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadRolePermissionsData} variant="outline" size="icon" title="새로고침">
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
              onClick={() => router.push('/admin/role-permissions')}
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

      {/* 역할별 권한 관리 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {/* 역할 정보 */}
          <div className="mb-6 p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">역할 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">역할명</label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border mt-1">
                  {role.role_nm}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">역할 ID</label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border font-mono text-sm mt-1">
                  {role.role_id}
                </div>
              </div>
            </div>
          </div>

          {/* 권한 추가 */}
          <div className="mb-6 p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">권한 추가</h3>
            <div className="flex items-center gap-3">
              <Select
                value=""
                onValueChange={handleAddPermission}
                disabled={isAddingPermission || availablePermissions.length === 0}
              >
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue placeholder={
                    availablePermissions.length === 0
                      ? "추가할 수 있는 권한이 없습니다"
                      : "추가할 권한 선택..."
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-32 overflow-y-auto">
                  {availablePermissions.map(permission => (
                    <SelectItem key={permission.permission_id} value={permission.permission_id}>
                      {permission.rsrc}:{permission.act} ({permission.permission_nm})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isAddingPermission && (
                <div className="text-sm text-muted-foreground">추가 중...</div>
              )}
            </div>
          </div>

          {/* 할당된 권한 목록 */}
          <div className="p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              할당된 권한 ({role.permissions.length}개)
            </h3>

            {role.permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                할당된 권한이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {role.permissions.map((permission) => {
                  const rolePermission = role.rolePermissions.find(rp => rp.permission_id === permission.permission_id);
                  return (
                    <div key={permission.permission_id} className="flex items-center justify-between p-4 rounded-md border bg-background">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium">{permission.rsrc}:{permission.act}</div>
                          <div className="text-sm text-muted-foreground">{permission.permission_nm}</div>
                        </div>
                        <Badge variant={permission.actv_yn ? 'default' : 'secondary'} className="text-xs">
                          {permission.actv_yn ? '활성' : '비활성'}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {rolePermission && new Date(rolePermission.crt_dt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rolePermission && handleRemovePermissionClick(rolePermission)}
                        className="h-8 w-8 text-destructive hover:text-destructive border-destructive"
                        title="권한 제거"
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

      {/* 권한 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!permissionToRemove}
        onOpenChange={(open) => !open && setPermissionToRemove(null)}
        title="권한 제거"
        description={`${permissionToRemove ? `${role?.role_nm} 역할에서 권한을 제거하시겠습니까?` : ''}`}
        confirmText="제거"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleRemovePermissionConfirm}
      />
    </div>
  );
}
