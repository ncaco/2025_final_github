/**
 * 사용자별 역할 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserRoles, deleteUserRole, createUserRole } from '@/lib/api/userRoles';
import { getUsers } from '@/lib/api/users';
import { getRoles } from '@/lib/api/roles';
import type { UserRole, User, Role } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { UserRolesModal } from '@/components/admin/user-role/UserRolesModal';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_user_roles_items_per_page';

export default function UserRolesPage() {
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [usersWithRoles, setUsersWithRoles] = useState<(User & { roles: Role[]; userRoles: UserRole[] })[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('username');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<(User & { roles: Role[]; userRoles: UserRole[] }) | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userRoleToRemove, setUserRoleToRemove] = useState<UserRole | null>(null);
  const { toast } = useToast();

  // 검색 옵션
  const searchOptions = [
    { value: 'username', label: '사용자명' },
    { value: 'user_id', label: '사용자 ID' },
    { value: 'eml', label: '이메일' },
  ];

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

      // 사용자를 기준으로 역할 매핑 결합
      const usersWithRolesData = usersData.map(user => {
        const userRolesForUser = userRolesData.filter(ur => ur.user_id === user.user_id);
        const roles = userRolesForUser
          .map(ur => rolesData.find(r => r.role_id === ur.role_id))
          .filter(r => r !== undefined) as Role[];

        return {
          ...user,
          roles,
          userRoles: userRolesForUser
        };
      });

      setUsersWithRoles(usersWithRolesData);
      setAllRoles(rolesData);

      // selectedUser가 현재 열려있는 모달의 사용자라면 최신 데이터로 업데이트
      if (selectedUser) {
        const updatedSelectedUser = usersWithRolesData.find(u => u.user_id === selectedUser.user_id);
        if (updatedSelectedUser) {
          // 새 객체를 생성하여 setSelectedUser 호출 (불변성 유지)
          // 특히 roles와 userRoles 배열이 정확히 업데이트되도록 명시적으로 할당
          setSelectedUser({
            ...updatedSelectedUser,
            roles: [...updatedSelectedUser.roles],
            userRoles: [...updatedSelectedUser.userRoles],
          });
          console.log('🔄 selectedUser 업데이트됨 (명시적 갱신):', updatedSelectedUser.user_id, updatedSelectedUser.roles.map(r => r.role_nm));
        }
      }
      // console.log('✅ 사용자별 역할 데이터 로드 완료:', usersWithRolesData.map(u => ({ user_id: u.user_id, username: u.username, roles_count: u.roles.length }))); // roles 배열 길이만 출력하여 축약 방지
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
  }, [toast]);

  useEffect(() => {
    loadUserRolesData();
  }, [loadUserRolesData]);

  // 검색 필터링 (사용자 기준)
  const filteredUsers = usersWithRoles.filter((user) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'username':
        return user.username?.toLowerCase().includes(keyword);
      case 'user_id':
        return user.user_id.toLowerCase().includes(keyword);
      case 'eml':
        return user.eml?.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  // 사용자 선택하여 모달 열기
  const handleUserClick = (user: User & { roles: Role[]; userRoles: UserRole[] }) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  // 역할 추가
  const handleAddRole = async (userId: string, roleId: string) => {
    try {
      await createUserRole({ user_id: userId, role_id: roleId });
      toast({
        title: '역할 추가 완료',
        description: '사용자에게 역할이 추가되었습니다.',
        variant: 'success',
      });
      loadUserRolesData();
    } catch (error) {
      console.error('역할 추가 실패:', error);
      toast({
        title: '역할 추가 실패',
        description: error instanceof Error ? error.message : '역할 추가에 실패했습니다.',
        variant: 'destructive',
      });
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
          사용자별 역할 관리를 확인하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">사용자-역할 관리</h1>
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
                  {searchOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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

      {/* 사용자별 역할 관리 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((user) => (
                  <div
                    key={user.user_id}
                    className="rounded-md border bg-card p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{user.username}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{user.user_id}</p>
                          <p className="text-xs text-muted-foreground">{user.eml}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {user.roles.length}개 역할
                        </Badge>
                        <Badge variant={user.actv_yn ? 'default' : 'secondary'} className="text-xs">
                          {user.actv_yn ? '활성' : '비활성'}
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
          {!loading && filteredUsers.length > 0 && (() => {
            const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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

      {/* 사용자별 역할 관리 모달 */}
      {selectedUser && (
        <UserRolesModal
          user={selectedUser}
          open={isUserModalOpen}
          onOpenChange={setIsUserModalOpen}
          allRoles={allRoles}
          onAddRole={handleAddRole}
          onRemoveRole={handleRemoveRoleClick}
          onDataUpdated={loadUserRolesData}
        />
      )}

      {/* 역할 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!userRoleToRemove}
        onOpenChange={(open) => !open && setUserRoleToRemove(null)}
        title="역할 제거"
        description={`${userRoleToRemove ? `${selectedUser?.username || userRoleToRemove.user_id} 사용자로부터 역할을 제거하시겠습니까?` : ''}`}
        confirmText="제거"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleRemoveRoleConfirm}
      />
    </div>
  );
}
