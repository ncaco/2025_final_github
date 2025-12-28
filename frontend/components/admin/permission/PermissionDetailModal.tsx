/**
 * 권한 상세/수정 모달 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import type { Permission, PermissionUpdate } from '@/types/user';
import { getPermissionDetail, updatePermission } from '@/lib/api/permissions';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';

interface PermissionDetailModalProps {
  permission: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionUpdated: () => void;
}

export function PermissionDetailModal({
  permission: initialPermission,
  open,
  onOpenChange,
  onPermissionUpdated,
}: PermissionDetailModalProps) {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PermissionUpdate>({});
  const { toast } = useToast();

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

  // 권한 상세 정보 로드
  const loadPermissionDetail = async () => {
    try {
      setLoading(true);
      const permissionDetail = await getPermissionDetail(initialPermission.permission_id);
      setPermission(permissionDetail);
    } catch (error) {
      console.error('권한 상세 조회 실패:', error);
      toast({
        title: '권한 상세 조회 실패',
        description: error instanceof Error ? error.message : '권한 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 모달 열릴 때 권한 정보 로드
  useEffect(() => {
    if (open && initialPermission) {
      loadPermissionDetail();
      setIsEditing(false);
      setFormData({});
    }
  }, [open, initialPermission]);

  // 수정 모드 시작
  const handleStartEdit = () => {
    if (permission) {
      setFormData({
        permission_cd: permission.permission_cd,
        permission_nm: permission.permission_nm,
        dsc: permission.dsc,
        rsrc: permission.rsrc,
        act: permission.act,
        actv_yn: permission.actv_yn,
      });
      setIsEditing(true);
    }
  };

  // 수정 취소
  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  // 수정 저장
  const handleSave = async () => {
    if (!permission) return;

    try {
      setSaving(true);
      await updatePermission(permission.permission_id, formData);
      toast({
        title: '권한 수정 완료',
        description: '권한이 성공적으로 수정되었습니다.',
        variant: 'success',
      });
      setIsEditing(false);
      setFormData({});
      loadPermissionDetail(); // 갱신된 정보 다시 로드
      onPermissionUpdated();
    } catch (error) {
      console.error('권한 수정 실패:', error);
      toast({
        title: '권한 수정 실패',
        description: error instanceof Error ? error.message : '권한 수정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setIsEditing(false);
    setFormData({});
    onOpenChange(false);
  };

  if (!permission) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">권한 상세 정보</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            권한의 상세 정보를 조회하고 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* 기본 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">기본 정보</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">권한 ID</Label>
                  <div className="font-mono text-sm py-2 px-3 bg-muted/50 rounded-md border">
                    {permission.permission_id}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">권한 코드</Label>
                  {isEditing ? (
                    <Input
                      className="h-9 text-sm"
                      value={formData.permission_cd || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, permission_cd: e.target.value }))}
                      placeholder="USER_CREATE"
                    />
                  ) : (
                    <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                      {permission.permission_cd}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">권한 이름</Label>
                  {isEditing ? (
                    <Input
                      className="h-9 text-sm"
                      value={formData.permission_nm || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, permission_nm: e.target.value }))}
                      placeholder="사용자 생성"
                    />
                  ) : (
                    <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                      {permission.permission_nm}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">설명</Label>
                  {isEditing ? (
                    <Input
                      className="h-9 text-sm"
                      value={formData.dsc || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, dsc: e.target.value }))}
                      placeholder="권한에 대한 설명"
                    />
                  ) : (
                    <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                      {permission.dsc || '-'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 리소스 & 액션 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">리소스 & 액션</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">리소스 타입</Label>
                  {isEditing ? (
                    <Select
                      value={formData.rsrc || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, rsrc: value }))}
                    >
                      <SelectTrigger className="h-9 text-sm">
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
                  ) : (
                    <div className="py-2">
                      <Badge variant="secondary">
                        {resourceOptions.find(opt => opt.value === permission.rsrc)?.label || permission.rsrc}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">액션 타입</Label>
                  {isEditing ? (
                    <Select
                      value={formData.act || ''}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, act: value }))}
                    >
                      <SelectTrigger className="h-9 text-sm">
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
                  ) : (
                    <div className="py-2">
                      <Badge variant="outline">
                        {actionOptions.find(opt => opt.value === permission.act)?.label || permission.act}
                      </Badge>
                    </div>
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
                      checked={formData.actv_yn ?? permission.actv_yn}
                      onChange={(e) =>
                        setFormData({ ...formData, actv_yn: e.target.checked })
                      }
                      className="rounded w-4 h-4"
                    />
                    <span className="text-sm">
                      {formData.actv_yn ?? permission.actv_yn ? '활성' : '비활성'}
                    </span>
                  </div>
                ) : (
                  <div className="py-2">
                    <Badge variant={permission.actv_yn ? 'default' : 'secondary'}>
                      {permission.actv_yn ? '활성' : '비활성'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* 메타 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">메타 정보</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">생성일</Label>
                  <div className="py-2 px-3 bg-muted/50 rounded-md border text-sm">
                    {new Date(permission.crt_dt).toLocaleString('ko-KR')}
                  </div>
                </div>
                {permission.upd_dt && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">수정일</Label>
                    <div className="py-2 px-3 bg-muted/50 rounded-md border text-sm">
                      {new Date(permission.upd_dt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
              <Button variant="outline" onClick={handleClose} size="sm">
                닫기
              </Button>
              <Button onClick={handleStartEdit} size="sm">
                수정
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
