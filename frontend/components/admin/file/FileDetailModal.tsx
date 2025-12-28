/**
 * 파일 상세 정보 모달 컴포넌트
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { File, FileUpdate } from '@/types/user';
import { getFileDetail, updateFile } from '@/lib/api/files';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';

interface FileDetailModalProps {
  file: File;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpdated: () => void;
}

export function FileDetailModal({
  file: initialFile,
  open,
  onOpenChange,
  onFileUpdated,
}: FileDetailModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FileUpdate>({});
  const { toast } = useToast();

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 상세 정보 로드
  const loadFileDetail = useCallback(async () => {
    try {
      setLoading(true);
      const fileDetail = await getFileDetail(initialFile.file_id);
      setFile(fileDetail);
      setFormData({
        file_nm: fileDetail.file_nm,
        pub_yn: fileDetail.pub_yn,
        use_yn: fileDetail.use_yn,
      });
    } catch (error) {
      console.error('파일 상세 정보 로드 실패:', error);
      toast({
        title: '오류',
        description: '파일 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [initialFile.file_id, toast]);

  // 모달 열릴 때 파일 정보 로드
  useEffect(() => {
    if (open && initialFile) {
      loadFileDetail();
    }
  }, [open, initialFile, loadFileDetail]);

  const handleSave = async () => {
    if (!file) return;

    try {
      setSaving(true);
      await updateFile(file.file_id, formData);
      toast({
        title: '저장 완료',
        description: '파일 정보가 업데이트되었습니다.',
        variant: 'success',
      });
      setIsEditing(false);
      onFileUpdated();
      loadFileDetail();
    } catch (error) {
      console.error('파일 정보 업데이트 실패:', error);
      toast({
        title: '저장 실패',
        description: error instanceof Error ? error.message : '파일 정보 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (file) {
      setFormData({
        file_nm: file.file_nm,
        pub_yn: file.pub_yn,
        use_yn: file.use_yn,
      });
    }
    setIsEditing(false);
  };

  // 모달 닫기
  const handleClose = () => {
    onOpenChange(false);
  };

  if (!file && loading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>파일 상세 정보</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!file) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">파일 상세 정보</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            파일의 상세 정보를 조회하고 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 기본 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">기본 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">파일 ID</Label>
                <div className="font-mono text-sm py-2 px-3 bg-muted/50 rounded-md border">
                  {file.file_id}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">사용자 ID</Label>
                <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                  <span className="font-mono text-sm">{file.user_id}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">파일명</Label>
                {isEditing ? (
                  <Input
                    className="h-9 text-sm"
                    value={formData.file_nm || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, file_nm: e.target.value })
                    }
                  />
                ) : (
                  <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                    {file.file_nm}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">파일 경로</Label>
                <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center font-mono text-sm break-all">
                  {file.file_path}
                </div>
              </div>
            </div>
          </div>

          {/* 파일 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">파일 정보</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">파일 크기</Label>
                <div className="py-2 px-3 bg-background rounded-md border min-h-[36px] flex items-center">
                  {formatFileSize(file.file_sz)}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">MIME 타입</Label>
                <div className="py-2">
                  {file.mime_typ ? (
                    <Badge variant="outline" className="text-xs">
                      {file.mime_typ}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">확장자</Label>
                <div className="py-2">
                  {file.file_ext ? (
                    <Badge variant="secondary" className="text-xs">
                      .{file.file_ext}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 저장소 정보 */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">저장소 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">저장소 타입</Label>
                <div className="py-2">
                  <Badge variant="outline" className="text-xs">
                    {file.stg_typ}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">공개 여부</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2 py-2">
                    <Switch
                      checked={formData.pub_yn ?? file.pub_yn}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, pub_yn: checked })
                      }
                    />
                    <span className="text-sm">
                      {formData.pub_yn ?? file.pub_yn ? '공개' : '비공개'}
                    </span>
                  </div>
                ) : (
                  <div className="py-2">
                    <Badge variant={file.pub_yn ? 'default' : 'secondary'} className="text-xs">
                      {file.pub_yn ? '공개' : '비공개'}
                    </Badge>
                  </div>
                )}
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
                  {new Date(file.crt_dt).toLocaleString('ko-KR')}
                </div>
              </div>
              {file.upd_dt && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">수정일</Label>
                  <div className="py-2 px-3 bg-muted/50 rounded-md border text-sm">
                    {new Date(file.upd_dt).toLocaleString('ko-KR')}
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
