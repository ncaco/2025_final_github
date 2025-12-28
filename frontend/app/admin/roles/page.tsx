/**
 * 역할 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '@/lib/api/roles';
import type { RoleWithPermissions, RoleCreate, RoleUpdate } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RoleTable } from '@/components/admin/role/RoleTable';
import { RoleDetailModal } from '@/components/admin/role/RoleDetailModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_roles_items_per_page';

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
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
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleWithPermissions | null>(null);
  const [formData, setFormData] = useState({
    role_cd: '',
    role_nm: '',
    role_dc: '',
  });

  // 역할 코드 옵션
  const roleCodeOptions = [
    { value: 'ADMIN', label: '관리자' },
    { value: 'USER', label: '일반사용자' },
    { value: 'MANAGER', label: '매니저' },
    { value: 'GUEST', label: '게스트' },
    { value: 'SUPER_ADMIN', label: '최고관리자' },
    { value: 'MODERATOR', label: '중재자' },
    { value: 'EDITOR', label: '편집자' },
    { value: 'VIEWER', label: '뷰어' },
  ];
  const { toast } = useToast();

  // 역할 목록 로드 (전체 목록 가져오기)
  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const allRoles = await getRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error('역할 목록 로드 실패:', error);
      toast({
        title: '오류',
        description: '역할 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // 검색 필터링
  const filteredRoles = roles.filter((role) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'role_nm':
        return role.role_nm?.toLowerCase().includes(keyword);
      case 'role_id':
        return role.role_id.toLowerCase().includes(keyword);
      case 'role_cd':
        return role.role_cd?.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  // 역할 상세 보기
  const handleViewRole = (role: RoleWithPermissions) => {
    setSelectedRole(role);
    setIsDetailModalOpen(true);
  };

  // 역할 생성 모달 열기
  const handleCreateRole = () => {
    setFormData({
      role_cd: '',
      role_nm: '',
      role_dc: '',
    });
    setIsCreateModalOpen(true);
  };

  // 역할 생성
  const handleCreateConfirm = async () => {
    try {
      const createData: RoleCreate = {
        role_cd: formData.role_cd,
        role_nm: formData.role_nm,
        role_dc: formData.role_dc || undefined,
        actv_yn: true,
      };

      await createRole(createData);
      toast({
        title: '역할 생성 완료',
        description: '역할이 성공적으로 생성되었습니다.',
        variant: 'success',
      });
      setIsCreateModalOpen(false);
      setFormData({
        role_cd: '',
        role_nm: '',
        role_dc: '',
      });
      loadRoles();
    } catch (error) {
      console.error('역할 생성 실패:', error);
      toast({
        title: '역할 생성 실패',
        description: error instanceof Error ? error.message : '역할 생성에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 역할 수정
  const handleUpdateRole = async (roleId: string, roleData: RoleUpdate) => {
    try {
      await updateRole(roleId, roleData);
      toast({
        title: '역할 수정 완료',
        description: '역할이 성공적으로 수정되었습니다.',
        variant: 'success',
      });
      setIsDetailModalOpen(false);
      loadRoles();
    } catch (error) {
      console.error('역할 수정 실패:', error);
      toast({
        title: '역할 수정 실패',
        description: error instanceof Error ? error.message : '역할 수정에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 역할 삭제 확인
  const handleDeleteClick = (role: RoleWithPermissions) => {
    setRoleToDelete(role);
  };

  // 역할 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole(roleToDelete.role_id);
      toast({
        title: '역할 삭제 완료',
        description: '역할이 삭제되었습니다.',
        variant: 'success',
      });
      setRoleToDelete(null);
      loadRoles();
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

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 첫 페이지로 리셋
    if (typeof window !== 'undefined') {
      localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, String(newItemsPerPage));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
        <div className="shrink-0 space-y-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">역할 관리</h1>
            <div className="flex items-center gap-2">
              <Button onClick={loadRoles} variant="outline" size="icon" title="새로고침">
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
              <Button onClick={handleCreateRole}>
                역할 생성
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
                    <SelectItem value="role_nm">역할 이름</SelectItem>
                    <SelectItem value="role_id">역할 ID</SelectItem>
                    <SelectItem value="role_cd">역할 코드</SelectItem>
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

      {/* 테이블 영역 (스크롤 가능) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 pt-4">
          <RoleTable
            roles={filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onViewRole={handleViewRole}
            onDeleteRole={handleDeleteClick}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredRoles.length}
          />
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

      {/* 역할 상세 모달 */}
      {selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onRoleUpdated={loadRoles}
        />
      )}

      {/* 역할 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>역할 생성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create_role_cd">역할 코드</Label>
              <Select
                value={formData.role_cd}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role_cd: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="역할 코드를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {roleCodeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} ({option.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create_role_nm">역할 이름 *</Label>
              <Input
                id="create_role_nm"
                placeholder="관리자"
                value={formData.role_nm}
                onChange={(e) => setFormData(prev => ({ ...prev, role_nm: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create_role_dc">역할 설명</Label>
              <Textarea
                id="create_role_dc"
                placeholder="역할에 대한 설명을 입력하세요."
                value={formData.role_dc}
                onChange={(e) => setFormData(prev => ({ ...prev, role_dc: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateConfirm} disabled={!formData.role_cd || !formData.role_nm}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
        title="역할 삭제"
        description={`${roleToDelete?.role_nm} 역할을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
