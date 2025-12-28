/**
 * 권한 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/lib/api/permissions';
import type { Permission, PermissionCreate, PermissionUpdate } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PermissionTable } from '@/components/admin/permission/PermissionTable';
import { PermissionDetailModal } from '@/components/admin/permission/PermissionDetailModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_permissions_items_per_page';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('permission_nm');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    permission_cd: '',
    permission_nm: '',
    dsc: '',
    rsrc: '',
    act: '',
  });

  // 리소스 타입 옵션
  const resourceOptions = [
    { value: 'USER', label: '사용자' },
    { value: 'ROLE', label: '역할' },
    { value: 'PERMISSION', label: '권한' },
    { value: 'FILE', label: '파일' },
    { value: 'ADMIN', label: '관리자' },
    { value: 'SYSTEM', label: '시스템' },
  ];

  // 액션 타입 옵션
  const actionOptions = [
    { value: 'CREATE', label: '생성' },
    { value: 'READ', label: '읽기' },
    { value: 'UPDATE', label: '수정' },
    { value: 'DELETE', label: '삭제' },
    { value: 'EXECUTE', label: '실행' },
    { value: 'MANAGE', label: '관리' },
  ];

  const { toast } = useToast();


  // 권한 목록 로드
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('권한 목록 로드 실패:', error);
      toast({
        title: '권한 목록 로드 실패',
        description: error instanceof Error ? error.message : '권한 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 컴포넌트 마운트 시 권한 목록 로드
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // itemsPerPage 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, itemsPerPage.toString());
  }, [itemsPerPage]);

  // 페이지 변경 시 currentPage 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedSearchColumn]);

  // 권한 상세 보기
  const handleViewPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDetailModalOpen(true);
  };

  // 권한 수정 완료 핸들러
  const handlePermissionUpdated = () => {
    loadPermissions();
  };

  // 권한 생성 모달 열기
  const handleCreatePermission = () => {
    setFormData({
      permission_cd: '',
      permission_nm: '',
      dsc: '',
      rsrc: '',
      act: '',
    });
    setIsCreateModalOpen(true);
  };

  // 권한 생성
  const handleCreateConfirm = async () => {
    try {
      const createData: PermissionCreate = {
        permission_cd: formData.permission_cd,
        permission_nm: formData.permission_nm,
        dsc: formData.dsc || undefined,
        rsrc: formData.rsrc,
        act: formData.act,
        actv_yn: true,
      };

      await createPermission(createData);
      toast({
        title: '권한 생성 완료',
        description: '권한이 성공적으로 생성되었습니다.',
        variant: 'success',
      });
      setIsCreateModalOpen(false);
      setFormData({
        permission_cd: '',
        permission_nm: '',
        dsc: '',
        rsrc: '',
        act: '',
      });
      loadPermissions();
    } catch (error) {
      console.error('권한 생성 실패:', error);
      toast({
        title: '권한 생성 실패',
        description: error instanceof Error ? error.message : '권한 생성에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 권한 삭제 확인
  const handleDeletePermission = (permission: Permission) => {
    setPermissionToDelete(permission);
  };

  // 권한 삭제 실행
  const handleDeleteConfirm = async () => {
    if (!permissionToDelete) return;

    try {
      await deletePermission(permissionToDelete.permission_id);
      toast({
        title: '권한 삭제 완료',
        description: '권한이 성공적으로 삭제되었습니다.',
        variant: 'success',
      });
      setPermissionToDelete(null);
      loadPermissions();
    } catch (error) {
      console.error('권한 삭제 실패:', error);
      toast({
        title: '권한 삭제 실패',
        description: error instanceof Error ? error.message : '권한 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 페이지네이션 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // 첫 페이지로 리셋
    if (typeof window !== 'undefined') {
      localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, String(newItemsPerPage));
    }
  };

  // 검색 필터링
  const filteredPermissions = permissions.filter((permission) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'permission_nm':
        return permission.permission_nm?.toLowerCase().includes(keyword);
      case 'permission_cd':
        return permission.permission_cd.toLowerCase().includes(keyword);
      case 'rsrc':
        return permission.rsrc.toLowerCase().includes(keyword);
      case 'act':
        return permission.act.toLowerCase().includes(keyword);
      default:
        return true;
    }
  });

  // 검색어 변경 핸들러
  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">권한 관리</h1>
          <div className="flex items-center gap-2">
            <Button onClick={loadPermissions} variant="outline" size="icon" title="새로고침">
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
            <Button onClick={handleCreatePermission}>
              권한 생성
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
                  <SelectItem value="permission_nm">권한 이름</SelectItem>
                  <SelectItem value="permission_cd">권한 코드</SelectItem>
                  <SelectItem value="rsrc">리소스</SelectItem>
                  <SelectItem value="act">액션</SelectItem>
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
          <PermissionTable
            permissions={filteredPermissions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
            loading={loading}
            onViewPermission={handleViewPermission}
            onDeletePermission={handleDeletePermission}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalCount={filteredPermissions.length}
          />
        </div>

        {/* 페이지네이션 (하단 고정) */}
        <div className="py-4">
          {!loading && filteredPermissions.length > 0 && (() => {
            const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

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

      {/* 권한 생성 모달 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>권한 생성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create_permission_cd">권한 코드</Label>
              <Input
                id="create_permission_cd"
                placeholder="USER_CREATE"
                value={formData.permission_cd}
                onChange={(e) => setFormData(prev => ({ ...prev, permission_cd: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create_permission_nm">권한 이름</Label>
              <Input
                id="create_permission_nm"
                placeholder="사용자 생성"
                value={formData.permission_nm}
                onChange={(e) => setFormData(prev => ({ ...prev, permission_nm: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create_rsrc">리소스 타입</Label>
              <Select value={formData.rsrc} onValueChange={(value) => setFormData(prev => ({ ...prev, rsrc: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="리소스를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {resourceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create_act">액션 타입</Label>
              <Select value={formData.act} onValueChange={(value) => setFormData(prev => ({ ...prev, act: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="액션을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create_dsc">설명</Label>
              <Textarea
                id="create_dsc"
                placeholder="권한에 대한 설명을 입력하세요"
                value={formData.dsc}
                onChange={(e) => setFormData(prev => ({ ...prev, dsc: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleCreateConfirm} disabled={!formData.permission_cd || !formData.permission_nm || !formData.rsrc || !formData.act}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 상세 모달 */}
      {selectedPermission && (
        <PermissionDetailModal
          permission={selectedPermission}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          onPermissionUpdated={handlePermissionUpdated}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!permissionToDelete}
        onOpenChange={(open) => !open && setPermissionToDelete(null)}
        title="권한 삭제"
        description={`${permissionToDelete?.permission_nm} (${permissionToDelete?.permission_cd}) 권한을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
