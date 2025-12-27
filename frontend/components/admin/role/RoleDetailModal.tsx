/**
 * 역할 상세/생성 모달 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import type { RoleWithPermissions, RoleCreate, RoleUpdate } from '@/types/user';
import { getRoleDetail, updateRole } from '@/lib/api/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';

interface RoleDetailModalProps {
  role: RoleWithPermissions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleUpdated: () => void;
}

export function RoleDetailModal({
  role: initialRole,
  open,
  onOpenChange,
  onRoleUpdated,
}: RoleDetailModalProps) {
  const [role, setRole] = useState<RoleWithPermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<RoleUpdate>({});
  const { toast } = useToast();

  // 역할 코드 옵션 (수정 시 사용)
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

  // 역할 상세 정보 로드
  useEffect(() => {
    if (open && initialRole) {
      loadRoleDetail();
    }
  }, [open, initialRole]);

  const loadRoleDetail = async () => {
    try {
      setLoading(true);
      const roleDetail = await getRoleDetail(initialRole.role_id);
      setRole(roleDetail);
      setFormData({
        role_nm: roleDetail.role_nm,
        role_cd: roleDetail.role_cd,
        role_dc: roleDetail.role_dc,
        actv_yn: roleDetail.actv_yn,
      });
    } catch (error) {
      console.error('역할 상세 정보 로드 실패:', error);
      toast({
        title: '오류',
        description: '역할 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!role) return;

    try {
      setSaving(true);
      await updateRole(role.role_id, formData);
      toast({
        title: '저장 완료',
        description: '역할 정보가 업데이트되었습니다.',
        variant: 'success',
      });
      setIsEditing(false);
      onRoleUpdated();
      loadRoleDetail();
    } catch (error) {
      console.error('역할 정보 업데이트 실패:', error);
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '역할 정보 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (role) {
      setFormData({
        role_nm: role.role_nm,
        role_cd: role.role_cd,
        role_dc: role.role_dc,
        actv_yn: role.actv_yn,
      });
    }
    setIsEditing(false);
  };

  if (!role && loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>역할 상세 정보</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">역할 상세 정보</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            역할의 상세 정보를 조회하고 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 기본 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">기본 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할 ID</Label>
                <div className="font-mono text-sm py-2 px-3 bg-muted/50 rounded-md border">
                  {role.role_id}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할 코드</Label>
                {isEditing ? (
                  <Select
                    value={formData.role_cd || role.role_cd || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role_cd: value })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
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
                ) : (
                  <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                    {role.role_cd ? (
                      <>
                        {roleCodeOptions.find(opt => opt.value === role.role_cd)?.label || role.role_cd} ({role.role_cd})
                      </>
                    ) : (
                      '-'
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할 이름</Label>
                {isEditing ? (
                  <Input
                    className="h-9 text-sm"
                    value={formData.role_nm || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, role_nm: e.target.value })
                    }
                  />
                ) : (
                  <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">{role.role_nm}</div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">역할 설명</Label>
                {isEditing ? (
                  <Input
                    className="h-9 text-sm"
                    value={formData.role_dc || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, role_dc: e.target.value })
                    }
                  />
                ) : (
                  <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">{role.role_dc || '-'}</div>
                )}
              </div>
            </div>
          </div>

          {/* 상태 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">상태 정보</h3>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">활성 상태</Label>
              {isEditing ? (
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={formData.actv_yn ?? role.actv_yn}
                    onChange={(e) =>
                      setFormData({ ...formData, actv_yn: e.target.checked })
                    }
                    className="rounded w-4 h-4"
                  />
                  <span className="text-sm">
                    {formData.actv_yn ?? role.actv_yn ? '활성' : '비활성'}
                  </span>
                </div>
              ) : (
                <div className="py-2">
                  <Badge variant={role.actv_yn ? 'default' : 'secondary'}>
                    {role.actv_yn ? '활성' : '비활성'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* 권한 정보 */}
          {role.permissions && role.permissions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">권한</h3>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Badge key={permission.permission_id} variant="outline" className="text-xs">
                    {permission.permission_nm}
                    {permission.rsrc && permission.act && (
                      <span className="ml-1 text-muted-foreground">
                        ({permission.rsrc}:{permission.act})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">메타 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">생성일</Label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border text-sm">
                  {role.crt_dt ? new Date(role.crt_dt).toLocaleString('ko-KR') : '-'}
                </div>
              </div>
              {role.upd_dt && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">수정일</Label>
                  <div className="py-2 px-3 bg-muted/50 rounded-md border text-sm">
                    {new Date(role.upd_dt).toLocaleString('ko-KR')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving} size="sm">
                취소
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? '저장 중...' : '저장'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} size="sm">
                닫기
              </Button>
              <Button onClick={() => setIsEditing(true)} size="sm">
                수정
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
