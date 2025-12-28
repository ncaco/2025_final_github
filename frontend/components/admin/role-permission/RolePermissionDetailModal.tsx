/**
 * 역할-권한 매핑 상세 정보 모달 컴포넌트
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RolePermission } from '@/types/user';
import { getRolePermissionDetail } from '@/lib/api/rolePermissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';

interface RolePermissionDetailModalProps {
  rolePermission: RolePermission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRolePermissionUpdated: () => void;
}

export function RolePermissionDetailModal({
  rolePermission: initialRolePermission,
  open,
  onOpenChange,
  onRolePermissionUpdated,
}: RolePermissionDetailModalProps) {
  const [rolePermission, setRolePermission] = useState<RolePermission | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 역할-권한 매핑 상세 정보 로드
  const loadRolePermissionDetail = useCallback(async () => {
    try {
      setLoading(true);
      const rpDetail = await getRolePermissionDetail(initialRolePermission.role_permission_id);
      setRolePermission(rpDetail);
    } catch (error) {
      console.error('역할-권한 매핑 상세 정보 로드 실패:', error);
      toast({
        title: '오류',
        description: '역할-권한 매핑 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [initialRolePermission.role_permission_id, toast]);

  // 모달 열릴 때 역할-권한 매핑 정보 로드
  useEffect(() => {
    if (open && initialRolePermission) {
      loadRolePermissionDetail();
    }
  }, [open, initialRolePermission, loadRolePermissionDetail]);

  // 모달 닫기
  const handleClose = () => {
    onOpenChange(false);
  };

  if (!rolePermission && loading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>역할-권한 매핑 상세 정보</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!rolePermission) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">역할-권한 매핑 상세 정보</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            역할-권한 매핑의 상세 정보를 조회합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 기본 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">기본 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">매핑 ID</Label>
                <div className="font-mono text-sm py-2 px-3 bg-muted/50 rounded-md border">
                  {rolePermission.role_permission_id}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할명</Label>
                <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                  {rolePermission.role?.role_nm || rolePermission.role_id}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할 ID</Label>
                <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                  <span className="font-mono text-sm">{rolePermission.role_id}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">리소스</Label>
                <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                  {rolePermission.permission?.rsrc || rolePermission.permission_id}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">액션</Label>
                <div className="py-2">
                  <Badge variant="outline" className="text-xs">
                    {rolePermission.permission?.act || rolePermission.permission_id}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">권한 ID</Label>
                <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                  <span className="font-mono text-sm">{rolePermission.permission_id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 상태 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">상태 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">사용 여부</Label>
                <div className="py-2">
                  <Badge variant={rolePermission.use_yn ? 'default' : 'secondary'} className="text-xs">
                    {rolePermission.use_yn ? '사용' : '미사용'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">권한 활성</Label>
                <div className="py-2">
                  <Badge variant={rolePermission.permission?.actv_yn ? 'default' : 'secondary'} className="text-xs">
                    {rolePermission.permission?.actv_yn ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">메타 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">생성일</Label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border text-sm">
                  {new Date(rolePermission.crt_dt).toLocaleString('ko-KR')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
