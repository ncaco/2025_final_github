/**
 * 사용자별 역할 관리 모달 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import type { User, Role, UserRole } from '@/types/user';
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

interface UserRolesModalProps {
  user: User & { roles: Role[]; userRoles: UserRole[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allRoles: Role[];
  onAddRole: (userId: string, roleId: string) => Promise<void>;
  onRemoveRole: (userRole: UserRole) => void;
  onDataUpdated: () => void;
}

export function UserRolesModal({
  user,
  open,
  onOpenChange,
  allRoles,
  onAddRole,
  onRemoveRole,
  onDataUpdated,
}: UserRolesModalProps) {
  const [isAddingRole, setIsAddingRole] = useState(false);

  useEffect(() => {
    console.log('🔄 UserRolesModal user prop 업데이트됨 (모달 레벨):', user?.user_id, user?.roles.map(r => r.role_nm));
  }, [user]);

  // 할당되지 않은 역할들
  const availableRoles = allRoles.filter(
    r => !user.roles.some(ur => ur.role_id === r.role_id)
  );

  const handleAddRole = async (roleId: string) => {
    if (!roleId) return;

    setIsAddingRole(true);
    try {
      console.log('⏳ 역할 추가 API 호출 중...');
      await onAddRole(user.user_id, roleId);
      console.log('✅ 역할 추가 성공, onDataUpdated 호출');
      onDataUpdated();
    } catch (error) {
      console.error('역할 추가 실패:', error);
    } finally {
      setIsAddingRole(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">사용자 역할 관리</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {user.username} 사용자에게 할당된 역할들을 관리합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 사용자 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">사용자 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">사용자명</Label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border">
                  {user.username}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">사용자 ID</Label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border font-mono text-sm">
                  {user.user_id}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">이메일</Label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border">
                  {user.eml}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">활성 상태</Label>
                <div className="py-2">
                  <Badge variant={user.actv_yn ? 'default' : 'secondary'} className="text-xs">
                    {user.actv_yn ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 역할 추가 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">역할 추가</h3>

            <div className="p-4 rounded-md border bg-muted/20">
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
                    {availableRoles.map(role => (
                      <SelectItem key={role.role_id} value={role.role_id}>
                        {role.role_nm} ({role.role_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isAddingRole && (
                  <div className="text-sm text-muted-foreground">추가 중...</div>
                )}
              </div>
            </div>
          </div>

          {/* 할당된 역할 목록 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              할당된 역할 ({user.roles.length}개)
            </h3>

            {user.roles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                할당된 역할이 없습니다.
              </div>
            ) : (
              <div className="grid gap-3">
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
                        onClick={() => userRole && onRemoveRole(userRole)}
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

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={handleClose} size="sm">
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
