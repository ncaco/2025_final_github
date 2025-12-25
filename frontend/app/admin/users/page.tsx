/**
 * 사용자 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser } from '@/lib/api/users';
import type { User } from '@/types/user';
import { UserTable } from '@/components/admin/user/UserTable';
import { UserDetailModal } from '@/components/admin/user/UserDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const SEARCH_EXPANDED_STORAGE_KEY = 'admin_users_search_expanded';
const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_users_items_per_page';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    username: '',
    eml: '',
    nm: '',
    nickname: '',
    user_id: '',
  });
  const [isSearchExpanded, setIsSearchExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SEARCH_EXPANDED_STORAGE_KEY);
      return saved === 'true';
    }
    return false;
  });
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  // 검색 박스 접기/펼치기 토글
  const toggleSearchExpanded = () => {
    const newValue = !isSearchExpanded;
    setIsSearchExpanded(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEARCH_EXPANDED_STORAGE_KEY, String(newValue));
    }
  };

  // 사용자 목록 로드 (전체 목록 가져오기)
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      // 전체 사용자 목록 가져오기 (필터링을 위해)
      const allUsers = await getUsers({ skip: 0, limit: 1000 });
      setUsers(allUsers);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '사용자 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 검색 필터링
  const filteredUsers = users.filter((user) => {
    const filters = searchFilters;
    
    // 모든 필터가 비어있으면 전체 표시
    if (!filters.username && !filters.eml && !filters.nm && !filters.nickname && !filters.user_id) {
      return true;
    }
    
    // 각 필터 조건 확인 (AND 조건)
    if (filters.username && !user.username.toLowerCase().includes(filters.username.toLowerCase())) {
      return false;
    }
    if (filters.eml && !user.eml.toLowerCase().includes(filters.eml.toLowerCase())) {
      return false;
    }
    if (filters.nm && !user.nm?.toLowerCase().includes(filters.nm.toLowerCase())) {
      return false;
    }
    if (filters.nickname && !user.nickname?.toLowerCase().includes(filters.nickname.toLowerCase())) {
      return false;
    }
    if (filters.user_id && !user.user_id.toLowerCase().includes(filters.user_id.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // 사용자 상세 보기
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // 사용자 삭제 확인
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  // 사용자 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.user_id);
      toast({
        title: '삭제 완료',
        description: '사용자가 삭제되었습니다.',
        variant: 'success',
      });
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '사용자 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSearchFilterChange = (field: keyof typeof searchFilters, value: string) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    // 필터 변경 시 첫 페이지로 리셋
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-6">
          {/* 헤더 및 검색 필터 영역 (고정) */}
          <div className="shrink-0 space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between py-2">
              <h1 className="text-xl font-bold tracking-tight">사용자 관리</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSearchExpanded}
              title={isSearchExpanded ? '접기' : '펼치기'}
            >
              {isSearchExpanded ? (
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
                  <path d="m18 15-6-6-6 6" />
                </svg>
              ) : (
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
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Button>
            <Button onClick={loadUsers} variant="outline" size="icon" title="새로고침">
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
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">이름</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="이름으로 검색..."
                  value={searchFilters.nm}
                  onChange={(e) => handleSearchFilterChange('nm', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">사용자명</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="사용자명으로 검색..."
                  value={searchFilters.username}
                  onChange={(e) => handleSearchFilterChange('username', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">이메일</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="이메일로 검색..."
                  value={searchFilters.eml}
                  onChange={(e) => handleSearchFilterChange('eml', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">닉네임</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="닉네임으로 검색..."
                  value={searchFilters.nickname}
                  onChange={(e) => handleSearchFilterChange('nickname', e.target.value)}
                />
              </div>
              {isSearchExpanded && (
                <div className="space-y-1">
                  <Label className="text-xs font-medium">사용자 ID</Label>
                  <Input
                    className="h-8 text-sm"
                    placeholder="사용자 ID로 검색..."
                    value={searchFilters.user_id}
                    onChange={(e) => handleSearchFilterChange('user_id', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 테이블 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 pt-4">
          <UserTable
            users={filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onViewUser={handleViewUser}
            onDeleteUser={handleDeleteClick}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredUsers.length}
          />
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
            <div className="flex items-center justify-between gap-4">
              {/* 왼쪽: 출력 개수 셀렉트 */}
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                  출력 개수:
                </Label>
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

      {/* 사용자 상세 모달 */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onUserUpdated={loadUsers}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="사용자 삭제"
        description={`${userToDelete?.username} (${userToDelete?.eml}) 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

