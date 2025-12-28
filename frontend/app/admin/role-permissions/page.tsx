/**
 * 역할별 권한 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRolePermissions, deleteRolePermission, createRolePermission } from '@/lib/api/rolePermissions';
import { getRoles } from '@/lib/api/roles';
import { getPermissions } from '@/lib/api/permissions';
import type { RolePermission, Role, Permission, RoleWithPermissions } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { RolePermissionsModal } from '@/components/admin/role-permission/RolePermissionsModal';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_role_permissions_items_per_page';

export default function RolePermissionsPage() {
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [rolesWithPermissions, setRolesWithPermissions] = useState<(Role & { permissions: Permission[]; rolePermissions: RolePermission[] })[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('role_nm');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState<(Role & { permissions: Permission[]; rolePermissions: RolePermission[] }) | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [permissionToRemove, setPermissionToRemove] = useState<RolePermission | null>(null);
  const { toast } = useToast();

  // 검색 옵션
  const searchOptions = [
    { value: 'role_nm', label: '역할명' },
    { value: 'role_id', label: '역할 ID' },
    { value: 'rsrc', label: '리소스' },
    { value: 'act', label: '액션' },
  ];


  // 역할별 권한 데이터 로드
  const loadRolePermissionsData = useCallback(async () => {
    try {
      setLoading(true);
      // console.log('📡 역할별 권한 데이터 로드 시작');

      // 모든 역할, 권한, 역할-권한 매핑을 동시에 가져옴
      const [rolesData, permissionsData, rolePermissionsData] = await Promise.all([
        getRoles(),
        getPermissions({ skip: 0, limit: 1000 }),
        getRolePermissions({ skip: 0, limit: 1000 })
      ]);

      // 역할을 기준으로 권한 매핑 결합
      const rolesWithPerms = rolesData.map(role => {
        const rolePerms = rolePermissionsData.filter(rp => rp.role_id === role.role_id);
        const permissions = rolePerms
          .map(rp => permissionsData.find(p => p.permission_id === rp.permission_id))
          .filter(p => p !== undefined) as Permission[];

        return {
          ...role,
          permissions,
          rolePermissions: rolePerms
        };
      });

      setRolesWithPermissions(rolesWithPerms);
      setAllPermissions(permissionsData);

      // selectedRole이 현재 열려있는 모달의 역할이라면 최신 데이터로 업데이트
      if (selectedRole) {
        const updatedSelectedRole = rolesWithPerms.find(r => r.role_id === selectedRole.role_id);
        if (updatedSelectedRole) {
          setSelectedRole({
            ...updatedSelectedRole,
            permissions: [...updatedSelectedRole.permissions],
            rolePermissions: [...updatedSelectedRole.rolePermissions],
          });
        }
      }
      // console.log('✅ 역할별 권한 데이터 로드 완료:', rolesWithPerms);
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
  }, [toast]);

  useEffect(() => {
    loadRolePermissionsData();
  }, [loadRolePermissionsData]);

  // 검색 필터링 (역할 기준)
  const filteredRoles = rolesWithPermissions.filter((role) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'role_nm':
        return role.role_nm?.toLowerCase().includes(keyword);
      case 'role_id':
        return role.role_id.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  // 역할 선택하여 모달 열기
  const handleRoleClick = (role: Role & { permissions: Permission[]; rolePermissions: RolePermission[] }) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
  };

  // 권한 추가
  const handleAddPermission = async (roleId: string, permissionId: string) => {
    try {
      await createRolePermission({ role_id: roleId, permission_id: permissionId });
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

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
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
          역할-권한 매핑을 확인하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
        <div className="shrink-0 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">역할-권한 관리</h1>
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
            </div>
          </div>

          {/* 검색 필터 */}
          <div className="rounded-md border bg-card">
            <div className="p-3">
              <div className="flex gap-3">
                <Select value={selectedSearchColumn} onValueChange={setSelectedSearchColumn}>
                  <SelectTrigger className="w-[180px] h-8 text-sm bg-white">
                    <SelectValue placeholder="검색 컬럼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="role_nm">역할명</SelectItem>
                    <SelectItem value="role_id">역할 ID</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="h-8 text-sm"
                  placeholder="검색어를 입력하세요..."
                  value={searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

      {/* 역할별 권한 관리 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {filteredRoles.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRoles
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((role) => (
                  <div
                    key={role.role_id}
                    className="rounded-md border bg-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRoleClick(role)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{role.role_nm}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{role.role_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {role.permissions.length}개 권한
                        </Badge>
                        <Badge variant="default" className="text-xs">
                          활성
                        </Badge>
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
                          className="text-muted-foreground"
                        >
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10,17 15,12 10,7" />
                          <line x1="15" x2="3" y1="12" y2="12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
        {!loading && filteredRoles.length > 0 && (() => {
          const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

          // 페이지 번호 계산 (최대 7개 표시)
          let startPage: number;
          let endPage: number;

          if (totalPages <= 7) {
            // 전체 페이지가 7개 이하면 모두 표시
            startPage = 1;
            endPage = totalPages;
          } else {
            // 현재 페이지 주변 7개 표시
            if (currentPage <= 4) {
              // 앞쪽에 있을 때: 1~7
              startPage = 1;
              endPage = 7;
            } else if (currentPage >= totalPages - 3) {
              // 뒤쪽에 있을 때: 마지막 7개
              startPage = totalPages - 6;
              endPage = totalPages;
            } else {
              // 중간에 있을 때: 현재 페이지 기준 앞뒤 3개씩
              startPage = currentPage - 3;
              endPage = currentPage + 3;
            }
          }

          const pageNumbers = [];
          for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
          }

          const handleItemsPerPageChange = (value: string) => {
            const newItemsPerPage = parseInt(value, 10);
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1); // 첫 페이지로 리셋
            if (typeof window !== 'undefined') {
              localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, String(newItemsPerPage));
            }
          };

          return (
            <div className="flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
              {/* 왼쪽: 출력 개수 셀렉트 */}
              <div className="flex items-center gap-2">
                <select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="10">10</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="500">500</option>
                  <option value="1000">1000</option>
                </select>
              </div>

              {/* 가운데: 페이지네이션 */}
              <div className="flex items-center justify-center gap-2">
              {/* 맨 처음 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="맨 처음"
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
                  <path d="m11 17-5-5 5-5" />
                  <path d="m18 17-5-5 5-5" />
                </svg>
              </Button>

              {/* 이전 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>

              {/* 페이지 번호 */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="min-w-10"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              {/* 다음 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>

              {/* 맨 끝 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="맨 끝"
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
                  <path d="m6 17 5-5-5-5" />
                  <path d="m13 17 5-5-5-5" />
                </svg>
              </Button>
              </div>
            </div>
          );
        })()}
        </div>
      </div>

      {/* 역할별 권한 관리 모달 */}
      {selectedRole && (
        <RolePermissionsModal
          role={selectedRole}
          open={isRoleModalOpen}
          onOpenChange={setIsRoleModalOpen}
          allPermissions={allPermissions}
          onAddPermission={handleAddPermission}
          onRemovePermission={handleRemovePermissionClick}
          onDataUpdated={loadRolePermissionsData}
        />
      )}

      {/* 권한 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!permissionToRemove}
        onOpenChange={(open) => !open && setPermissionToRemove(null)}
        title="권한 제거"
        description={`${permissionToRemove ? `${selectedRole?.role_nm || permissionToRemove.role_id} 역할에서 권한을 제거하시겠습니까?` : ''}`}
        confirmText="제거"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleRemovePermissionConfirm}
      />
    </div>
  );
}
