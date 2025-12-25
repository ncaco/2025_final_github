/**
 * 사용자 상세 정보 모달 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import type { User, UserUpdate } from '@/types/user';
import { getUserDetail, updateUser } from '@/lib/api/users';
import type { UserDetailResponse } from '@/types/user';
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
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';

interface UserDetailModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserDetailModal({
  user: initialUser,
  open,
  onOpenChange,
  onUserUpdated,
}: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserUpdate>({});
  const { toast } = useToast();

  // 사용자 상세 정보 로드
  useEffect(() => {
    if (open && initialUser) {
      loadUserDetail();
    }
  }, [open, initialUser]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const userDetail = await getUserDetail(initialUser.user_id);
      setUser(userDetail);
      setFormData({
        eml: userDetail.eml,
        username: userDetail.username,
        nm: userDetail.nm,
        nickname: userDetail.nickname,
        telno: userDetail.telno,
        actv_yn: userDetail.actv_yn,
        eml_vrf_yn: userDetail.eml_vrf_yn,
        telno_vrf_yn: userDetail.telno_vrf_yn,
      });
    } catch (error) {
      console.error('사용자 상세 정보 로드 실패:', error);
      toast({
        title: '오류',
        description: '사용자 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      await updateUser(user.user_id, formData);
      toast({
        title: '저장 완료',
        description: '사용자 정보가 업데이트되었습니다.',
        variant: 'success',
      });
      setIsEditing(false);
      onUserUpdated();
      loadUserDetail();
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '사용자 정보 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        eml: user.eml,
        username: user.username,
        nm: user.nm,
        nickname: user.nickname,
        telno: user.telno,
        actv_yn: user.actv_yn,
        eml_vrf_yn: user.eml_vrf_yn,
        telno_vrf_yn: user.telno_vrf_yn,
      });
    }
    setIsEditing(false);
  };

  if (!user && loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>사용자 상세 정보</DialogTitle>
          <DialogDescription>
            사용자의 상세 정보를 조회하고 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>사용자 ID</Label>
                <div className="font-mono text-sm text-muted-foreground">
                  {user.user_id}
                </div>
              </div>

              <div className="space-y-2">
                <Label>사용자명</Label>
                {isEditing ? (
                  <Input
                    value={formData.username || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                  />
                ) : (
                  <div>{user.username}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>이메일</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.eml || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, eml: e.target.value })
                    }
                  />
                ) : (
                  <div>{user.eml}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>이름</Label>
                {isEditing ? (
                  <Input
                    value={formData.nm || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, nm: e.target.value })
                    }
                  />
                ) : (
                  <div>{user.nm || '-'}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>닉네임</Label>
                {isEditing ? (
                  <Input
                    value={formData.nickname || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
                  />
                ) : (
                  <div>{user.nickname || '-'}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>전화번호</Label>
                {isEditing ? (
                  <Input
                    value={formData.telno || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, telno: e.target.value })
                    }
                  />
                ) : (
                  <div>{user.telno || '-'}</div>
                )}
              </div>
            </div>
          </div>

          {/* 상태 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">상태 정보</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>활성 상태</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.actv_yn ?? user.actv_yn}
                      onChange={(e) =>
                        setFormData({ ...formData, actv_yn: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      {formData.actv_yn ?? user.actv_yn ? '활성' : '비활성'}
                    </span>
                  </div>
                ) : (
                  <Badge variant={user.actv_yn ? 'default' : 'secondary'}>
                    {user.actv_yn ? '활성' : '비활성'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>이메일 인증</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.eml_vrf_yn ?? user.eml_vrf_yn}
                      onChange={(e) =>
                        setFormData({ ...formData, eml_vrf_yn: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      {formData.eml_vrf_yn ?? user.eml_vrf_yn ? '인증됨' : '미인증'}
                    </span>
                  </div>
                ) : (
                  <Badge variant={user.eml_vrf_yn ? 'default' : 'outline'}>
                    {user.eml_vrf_yn ? '인증됨' : '미인증'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label>전화번호 인증</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.telno_vrf_yn ?? user.telno_vrf_yn}
                      onChange={(e) =>
                        setFormData({ ...formData, telno_vrf_yn: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">
                      {formData.telno_vrf_yn ?? user.telno_vrf_yn ? '인증됨' : '미인증'}
                    </span>
                  </div>
                ) : (
                  <Badge variant={user.telno_vrf_yn ? 'default' : 'outline'}>
                    {user.telno_vrf_yn ? '인증됨' : '미인증'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 역할 정보 */}
          {user.roles && user.roles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">역할</h3>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role.role_id} variant="outline">
                    {role.role_nm}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">메타 정보</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">생성일</Label>
                <div>{new Date(user.crt_dt).toLocaleString('ko-KR')}</div>
              </div>
              {user.upd_dt && (
                <div>
                  <Label className="text-muted-foreground">수정일</Label>
                  <div>{new Date(user.upd_dt).toLocaleString('ko-KR')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                닫기
              </Button>
              <Button onClick={() => setIsEditing(true)}>수정</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

