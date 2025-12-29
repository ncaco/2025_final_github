/**
 * 다국어 리소스 편집 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLocaleDetail, updateLocale, createLocale, deleteLocale } from '@/lib/api/locales';
import { getLocales } from '@/lib/api/locales';
import { getLanguageConfigs } from '@/lib/api/languageConfigs';
import type { Locale, LocaleCreate, LocaleUpdate, LanguageConfig } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ArrowLeft, Plus, X, Save } from 'lucide-react';

interface LocaleInput {
  locale_id?: string;
  lang_cd: string;
  rsrc_val: string;
  use_yn: boolean;
  isNew?: boolean;
}

export default function EditLocalePage() {
  const router = useRouter();
  const params = useParams();
  const localeId = params.locale_id as string;
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale | null>(null);
  const [relatedLocales, setRelatedLocales] = useState<Locale[]>([]);
  const [rsrcKey, setRsrcKey] = useState('');
  const [rsrcTyp, setRsrcTyp] = useState('');
  const [locales, setLocales] = useState<LocaleInput[]>([]);
  const [enabledLanguages, setEnabledLanguages] = useState<LanguageConfig[]>([]);
  const [localeToRemove, setLocaleToRemove] = useState<LocaleInput | null>(null);
  const { toast } = useToast();

  // 리소스 타입 옵션
  const rsrcTypOptions = [
    { value: 'LABEL', label: 'LABEL' },
    { value: 'MESSAGE', label: 'MESSAGE' },
    { value: 'ERROR', label: 'ERROR' }
  ];

  // 언어 코드 옵션 (동적 생성)
  const langCdOptions = enabledLanguages.map(lang => ({
    value: lang.lang_cd,
    label: `${lang.lang_nm} (${lang.lang_cd})`
  }));

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !authLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, isInitialized, router]);

  // 언어 설정 로드
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await getLanguageConfigs({ use_yn: true });
        setEnabledLanguages(languages);
      } catch (error) {
        console.error('언어 설정 로드 실패:', error);
      }
    };

    if (isAuthenticated) {
      loadLanguages();
    }
  }, [isAuthenticated]);

  // 데이터 로드 함수
  const loadLocalesData = useCallback(async () => {
    if (!localeId || !isAuthenticated) return;

    try {
      setLoading(true);

      // 현재 locale 정보 가져오기
      const localeDetail = await getLocaleDetail(localeId);
      setCurrentLocale(localeDetail);
      setRsrcKey(localeDetail.rsrc_key);
      setRsrcTyp(localeDetail.rsrc_typ);

      // 같은 rsrc_key를 가진 모든 locale 가져오기
      const allLocales = await getLocales({
        rsrc_key: localeDetail.rsrc_key,
        rsrc_typ: localeDetail.rsrc_typ
      });
      setRelatedLocales(allLocales);

      // 편집용 데이터 구조로 변환
      const localeInputs: LocaleInput[] = allLocales.map(locale => ({
        locale_id: locale.locale_id,
        lang_cd: locale.lang_cd,
        rsrc_val: locale.rsrc_val,
        use_yn: locale.use_yn,
        isNew: false
      }));

      setLocales(localeInputs);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '다국어 리소스 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      router.push('/admin/locales');
    } finally {
      setLoading(false);
    }
  }, [localeId, isAuthenticated, router, toast]);

  // 데이터 로드
  useEffect(() => {
    loadLocalesData();
  }, [loadLocalesData]);

  // 언어 추가
  const addLanguage = () => {
    const existingLangCodes = locales.map(l => l.lang_cd);
    const availableLangCodes = langCdOptions.filter(opt => !existingLangCodes.includes(opt.value));

    if (availableLangCodes.length === 0) {
      toast({
        title: '알림',
        description: '모든 언어가 이미 추가되었습니다.',
      });
      return;
    }

    const newLang = availableLangCodes[0].value;
    setLocales([...locales, {
      lang_cd: newLang,
      rsrc_val: '',
      use_yn: true,
      isNew: true
    }]);
  };

  // 언어 제거 확인
  const handleRemoveLanguageClick = (index: number) => {
    const localeToRemove = locales[index];
    setLocaleToRemove(localeToRemove);
  };

  // 언어 제거 실행
  const handleRemoveLanguageConfirm = () => {
    if (!localeToRemove) return;

    const index = locales.findIndex(l => l === localeToRemove);
    if (index !== -1) {
      setLocales(locales.filter((_, i) => i !== index));
    }
    setLocaleToRemove(null);
  };

  // 언어 제거 (구버전 호환용)
  const removeLanguage = (index: number) => {
    const localeToRemove = locales[index];
    if (localeToRemove.isNew) {
      // 새로 추가된 항목은 그냥 제거
      setLocales(locales.filter((_, i) => i !== index));
    } else {
      // 기존 항목은 삭제 확인 모달 표시
      handleRemoveLanguageClick(index);
    }
  };

  // 언어 업데이트
  const updateLanguage = (index: number, field: keyof LocaleInput, value: string | boolean) => {
    const updatedLocales = [...locales];
    updatedLocales[index] = { ...updatedLocales[index], [field]: value };
    setLocales(updatedLocales);
  };

  // 폼 검증
  const validateForm = () => {
    if (!rsrcKey.trim()) {
      toast({
        title: '입력 오류',
        description: '리소스 키를 입력해주세요.',
        variant: 'destructive',
      });
      return false;
    }

    if (!rsrcTyp) {
      toast({
        title: '입력 오류',
        description: '리소스 타입을 선택해주세요.',
        variant: 'destructive',
      });
      return false;
    }

    const validLocales = locales.filter(locale => locale.lang_cd && locale.rsrc_val.trim());
    if (validLocales.length === 0) {
      toast({
        title: '입력 오류',
        description: '적어도 하나의 언어 번역을 입력해주세요.',
        variant: 'destructive',
      });
      return false;
    }

    // 중복 언어 코드 체크
    const langCodes = validLocales.map(locale => locale.lang_cd);
    if (new Set(langCodes).size !== langCodes.length) {
      toast({
        title: '입력 오류',
        description: '중복된 언어 코드는 사용할 수 없습니다.',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  // 저장
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const promises: Promise<any>[] = [];

      // 기존 locale 업데이트 또는 삭제
      const existingLocales = relatedLocales;
      for (const existing of existingLocales) {
        const updated = locales.find(l => l.locale_id === existing.locale_id);
        if (updated) {
          // 업데이트
          const updateData: LocaleUpdate = {
            rsrc_val: updated.rsrc_val.trim(),
            use_yn: updated.use_yn
          };
          promises.push(updateLocale(existing.locale_id, updateData));
        } else {
          // 삭제
          promises.push(deleteLocale(existing.locale_id));
        }
      }

      // 새로 추가된 locale 생성
      const newLocales = locales.filter(l => l.isNew && l.lang_cd && l.rsrc_val.trim());
      for (const newLocale of newLocales) {
        const createData: LocaleCreate = {
          lang_cd: newLocale.lang_cd,
          rsrc_typ: rsrcTyp,
          rsrc_key: rsrcKey.trim(),
          rsrc_val: newLocale.rsrc_val.trim()
        };
        promises.push(createLocale(createData));
      }

      await Promise.all(promises);

      toast({
        title: '성공',
        description: '다국어 리소스가 수정되었습니다.',
      });

      router.push('/admin/locales');
    } catch (error) {
      console.error('다국어 리소스 수정 실패:', error);
      toast({
        title: '오류',
        description: '다국어 리소스 수정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 로딩 중
  if (authLoading || !isInitialized || loading) {
    return <Loading />;
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return null;
  }

  // 데이터가 없는 경우
  if (!currentLocale) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">다국어 리소스를 찾을 수 없습니다.</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/admin/locales')}
          >
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">다국어 리소스 편집</h1>
            <p className="text-sm text-muted-foreground">{rsrcKey} 리소스의 번역을 관리합니다.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadLocalesData} variant="outline" size="icon" title="새로고침">
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
            <Button
              onClick={() => router.push('/admin/locales')}
              variant="outline"
              size="icon"
              title="목록으로 돌아가기"
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* 다국어 리소스 편집 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {/* 기본 정보 */}
          <div className="mb-6 p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">리소스 키</label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border mt-1">
                  {rsrcKey}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">리소스 타입</label>
                <div className="py-2 px-3 bg-muted/50 rounded-md border mt-1">
                  {rsrcTypOptions.find(opt => opt.value === rsrcTyp)?.label || rsrcTyp}
                </div>
              </div>
            </div>
          </div>

          {/* 언어 번역 추가 */}
          <div className="mb-6 p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">언어 번역 추가</h3>
            <div className="flex items-center gap-3">
              <Select
                value=""
                onValueChange={(value) => {
                  if (value) {
                    const existingLangCodes = locales.map(l => l.lang_cd);
                    if (!existingLangCodes.includes(value)) {
                      setLocales([...locales, {
                        lang_cd: value,
                        rsrc_val: '',
                        use_yn: true,
                        isNew: true
                      }]);
                    }
                  }
                }}
              >
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue placeholder="추가할 언어 선택..." />
                </SelectTrigger>
                <SelectContent className="max-h-32 overflow-y-auto">
                  {langCdOptions.map(option => {
                    const isAdded = locales.some(l => l.lang_cd === option.value);
                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={isAdded}
                        className={isAdded ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {option.label}
                        {isAdded && " (이미 추가됨)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 언어 번역 목록 */}
          <div className="p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              언어 번역 ({locales.length}개)
            </h3>

            {locales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                번역된 언어가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {locales.map((locale, index) => (
                  <div key={locale.locale_id || `new-${index}`} className="flex items-center justify-between p-4 rounded-md border bg-background">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <div className="font-medium">{langCdOptions.find(opt => opt.value === locale.lang_cd)?.label}</div>
                        <div className="text-sm text-muted-foreground font-mono">{locale.lang_cd}</div>
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={locale.rsrc_val}
                          onChange={(e) => updateLanguage(index, 'rsrc_val', e.target.value)}
                          placeholder="번역 내용을 입력하세요"
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={locale.use_yn}
                          onCheckedChange={(checked) => updateLanguage(index, 'use_yn', checked)}
                        />
                        <span className="text-sm text-gray-600 min-w-[40px]">
                          {locale.use_yn ? '사용' : '미사용'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {locale.locale_id && new Date(currentLocale?.upd_dt || '').toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLanguage(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive border-destructive"
                      title="언어 제거"
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
                ))}
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/locales')}
              disabled={saving}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>

      {/* 언어 제거 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!localeToRemove}
        onOpenChange={(open) => !open && setLocaleToRemove(null)}
        title="언어 번역 삭제"
        description={`${localeToRemove?.lang_cd} 언어의 번역을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleRemoveLanguageConfirm}
      />
    </div>
  );
}
