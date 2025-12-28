/**
 * 역할별 권한 관리 모달 컴포넌트
 */

'use client';

import { useState } from 'react';
import type { Role, Permission, RolePermission } from '@/types/user';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface RolePermissionsModalProps {
  role: Role & { permissions: Permission[]; rolePermissions: RolePermission[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allPermissions: Permission[];
  onAddPermission: (roleId: string, permissionId: string) => Promise<void>;
  onRemovePermission: (rolePermission: RolePermission) => void;
  onDataUpdated: () => void;
}

export function RolePermissionsModal({
  role,
  open,
  onOpenChange,
  allPermissions,
  onAddPermission,
  onRemovePermission,
  onDataUpdated,
}: RolePermissionsModalProps) {
  const [isAddingPermission, setIsAddingPermission] = useState(false);

  // 할당되지 않은 권한들
  const availablePermissions = allPermissions.filter(
    p => !role.permissions.some(rp => rp.permission_id === p.permission_id)
  );

  const handleAddPermission = async (permissionId: string) => {
    if (!permissionId) return;

    setIsAddingPermission(true);
    try {
      await onAddPermission(role.role_id, permissionId);
      onDataUpdated();
    } catch (error) {
      console.error('권한 추가 실패:', error);
    } finally {
      setIsAddingPermission(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">역할 권한 관리</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {role.role_nm} 역할에 할당된 권한들을 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 역할 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">역할 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할명</Label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border">
                  {role.role_nm}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할 ID</Label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border font-mono text-sm">
                  {role.role_id}
                </div>
              </div>
            </div>
          </div>

          {/* 권한 추가 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">권한 추가</h3>

            <div className="p-4 rounded-md border bg-muted/20">
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
          </div>

          {/* 할당된 권한 목록 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              할당된 권한 ({role.permissions.length}개)
            </h3>

            {role.permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                할당된 권한이 없습니다.
              </div>
            ) : (
              <div className="grid gap-3">
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
                        onClick={() => rolePermission && onRemovePermission(rolePermission)}
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

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={handleClose} size="sm">
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
