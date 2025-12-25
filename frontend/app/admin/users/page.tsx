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
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const ITEMS_PER_PAGE = 20;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  // 사용자 목록 로드
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const allUsers = await getUsers({ skip, limit: ITEMS_PER_PAGE });
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
  }, [currentPage, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 검색 필터링
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(term) ||
      user.eml.toLowerCase().includes(term) ||
      user.nm?.toLowerCase().includes(term) ||
      user.nickname?.toLowerCase().includes(term) ||
      user.user_id.toLowerCase().includes(term)
    );
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

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">사용자 관리</h1>
            <p className="text-muted-foreground mt-2">
              시스템에 등록된 사용자 목록을 조회하고 관리할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex items-center gap-4">
          <Input
            placeholder="사용자명, 이메일, 이름, 닉네임으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={loadUsers} variant="outline">
            새로고침
          </Button>
        </div>

        {/* 사용자 테이블 */}
        <UserTable
          users={filteredUsers}
          loading={loading}
          onViewUser={handleViewUser}
          onDeleteUser={handleDeleteClick}
        />

        {/* 페이지네이션 */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              페이지 {currentPage} / {Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={filteredUsers.length < ITEMS_PER_PAGE}
              >
                다음
              </Button>
            </div>
          </div>
        )}

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
    </div>
  );
}

