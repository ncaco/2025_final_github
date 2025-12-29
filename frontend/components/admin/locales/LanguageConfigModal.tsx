'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';
import {
  getLanguageConfigs,
  createLanguageConfig,
  updateLanguageConfig,
  deleteLanguageConfig
} from '@/lib/api/languageConfigs';
import type { LanguageConfig, LanguageConfigCreate, LanguageConfigUpdate } from '@/types/user';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface LanguageConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

interface LanguageFormData {
  lang_cd: string;
  lang_nm: string;
  display_order: number;
  use_yn: boolean;
}

export function LanguageConfigModal({ open, onOpenChange, onSave }: LanguageConfigModalProps) {
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<LanguageConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<LanguageFormData>({
    lang_cd: '',
    lang_nm: '',
    display_order: 0,
    use_yn: true
  });
  const { toast } = useToast();

  // 언어 목록 로드
  const loadLanguages = async () => {
    try {
      setLoading(true);
      const data = await getLanguageConfigs();
      setLanguages(data);
    } catch (error) {
      console.error('언어 설정 로드 실패:', error);
      toast({
        title: '오류',
        description: '언어 설정을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadLanguages();
    }
  }, [open]);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      lang_cd: '',
      lang_nm: '',
      display_order: 0,
      use_yn: true
    });
    setEditingLanguage(null);
    setShowForm(false);
  };

  // 추가 모드 시작
  const handleAdd = () => {
    resetForm();
    setShowForm(true);
  };

  // 편집 모드 시작
  const handleEdit = (language: LanguageConfig) => {
    setFormData({
      lang_cd: language.lang_cd,
      lang_nm: language.lang_nm,
      display_order: language.display_order,
      use_yn: language.use_yn
    });
    setEditingLanguage(language);
    setShowForm(true);
  };

  // 저장
  const handleSave = async () => {
    if (!formData.lang_cd.trim() || !formData.lang_nm.trim()) {
      toast({
        title: '입력 오류',
        description: '언어 코드와 이름을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      if (editingLanguage) {
        // 수정
        const updateData: LanguageConfigUpdate = {
          lang_nm: formData.lang_nm.trim(),
          display_order: formData.display_order,
          use_yn: formData.use_yn
        };
        await updateLanguageConfig(editingLanguage.common_language_config_sn, updateData);
        toast({
          title: '성공',
          description: '언어 설정이 수정되었습니다.',
        });
      } else {
        // 추가
        const createData: LanguageConfigCreate = {
          lang_cd: formData.lang_cd.trim(),
          lang_nm: formData.lang_nm.trim(),
          display_order: formData.display_order,
          use_yn: formData.use_yn
        };
        await createLanguageConfig(createData);
        toast({
          title: '성공',
          description: '새 언어가 추가되었습니다.',
        });
      }

      resetForm();
      await loadLanguages();
      onSave?.();
    } catch (error: any) {
      console.error('언어 설정 저장 실패:', error);
      toast({
        title: '오류',
        description: error?.message || '언어 설정 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 삭제
  const handleDelete = async (language: LanguageConfig) => {
    if (!confirm(`${language.lang_nm}(${language.lang_cd}) 언어를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteLanguageConfig(language.common_language_config_sn);
      toast({
        title: '성공',
        description: '언어가 삭제되었습니다.',
      });
      await loadLanguages();
      onSave?.();
    } catch (error) {
      console.error('언어 삭제 실패:', error);
      toast({
        title: '오류',
        description: '언어 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>언어 설정 관리</DialogTitle>
          <DialogDescription>
            시스템에서 사용할 언어를 추가, 수정, 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* 헤더 액션 */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold">언어 목록</h3>
            <Button onClick={handleAdd} size="sm" disabled={showForm}>
              <Plus className="w-4 h-4 mr-2" />
              언어 추가
            </Button>
          </div>

          {/* 언어 목록 */}
          <div className="flex-1 overflow-y-auto">
            {loading && languages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loading />
              </div>
            ) : languages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                등록된 언어가 없습니다.
              </div>
            ) : (
              <div className="space-y-2">
                {languages.map((language) => (
                  <div
                    key={language.common_language_config_sn}
                    className="flex items-center justify-between p-4 border rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="font-medium">{language.lang_nm}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {language.lang_cd}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        순서: {language.display_order}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={language.use_yn} disabled />
                        <span className="text-sm">
                          {language.use_yn ? '사용' : '미사용'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(language)}
                        disabled={showForm}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(language)}
                        disabled={showForm}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 추가/편집 폼 */}
          {showForm && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-4">
                {editingLanguage ? '언어 수정' : '새 언어 추가'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lang_cd">언어 코드 *</Label>
                  <Input
                    id="lang_cd"
                    value={formData.lang_cd}
                    onChange={(e) => setFormData(prev => ({ ...prev, lang_cd: e.target.value }))}
                    placeholder="ko, en, ja 등"
                    disabled={!!editingLanguage} // 수정 시에는 코드 변경 불가
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lang_nm">언어 이름 *</Label>
                  <Input
                    id="lang_nm"
                    value={formData.lang_nm}
                    onChange={(e) => setFormData(prev => ({ ...prev, lang_nm: e.target.value }))}
                    placeholder="한국어, English 등"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">표시 순서</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>사용 여부</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={formData.use_yn}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, use_yn: checked }))}
                    />
                    <span className="text-sm text-gray-600">
                      {formData.use_yn ? '사용' : '미사용'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  취소
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
