/**
 * 다국어 리소스 추가 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createLocale } from '@/lib/api/locales';
import { getLanguageConfigs } from '@/lib/api/languageConfigs';
import type { LocaleCreate, LanguageConfig } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';

interface LocaleInput {
  lang_cd: string;
  rsrc_val: string;
}

export default function AddLocalePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rsrcKey, setRsrcKey] = useState('');
  const [rsrcTyp, setRsrcTyp] = useState('');
  const [locales, setLocales] = useState<LocaleInput[]>([]);
  const [enabledLanguages, setEnabledLanguages] = useState<LanguageConfig[]>([]);
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
        // 기본적으로 한국어와 영어 추가
        const defaultLocales: LocaleInput[] = [];
        const koLang = languages.find(l => l.lang_cd === 'ko');
        const enLang = languages.find(l => l.lang_cd === 'en');
        if (koLang) defaultLocales.push({ lang_cd: 'ko', rsrc_val: '' });
        if (enLang) defaultLocales.push({ lang_cd: 'en', rsrc_val: '' });
        setLocales(defaultLocales);
      } catch (error) {
        console.error('언어 설정 로드 실패:', error);
      }
    };

    if (isAuthenticated) {
      loadLanguages();
    }
  }, [isAuthenticated]);

  // 언어 추가
  const addLanguage = () => {
    setLocales([...locales, { lang_cd: '', rsrc_val: '' }]);
  };

  // 언어 제거
  const removeLanguage = (index: number) => {
    if (locales.length > 1) {
      setLocales(locales.filter((_, i) => i !== index));
    }
  };

  // 언어 업데이트
  const updateLanguage = (index: number, field: keyof LocaleInput, value: string) => {
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

    setLoading(true);
    try {
      // 유효한 locale들만 필터링
      const validLocales = locales.filter(locale => locale.lang_cd && locale.rsrc_val.trim());

      // 각 언어별로 locale 생성
      const promises = validLocales.map(locale => {
        const localeData: LocaleCreate = {
          lang_cd: locale.lang_cd,
          rsrc_typ: rsrcTyp,
          rsrc_key: rsrcKey.trim(),
          rsrc_val: locale.rsrc_val.trim()
        };
        return createLocale(localeData);
      });

      await Promise.all(promises);

      toast({
        title: '성공',
        description: `${validLocales.length}개의 다국어 리소스가 추가되었습니다.`,
      });

      router.push('/admin/locales');
    } catch (error) {
      console.error('다국어 리소스 추가 실패:', error);
      toast({
        title: '오류',
        description: '다국어 리소스 추가에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 로딩 중
  if (authLoading || !isInitialized) {
    return <Loading />;
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">다국어 리소스 추가</h1>
            <p className="text-sm text-muted-foreground">새로운 다국어 리소스를 추가합니다.</p>
          </div>
          <div className="flex items-center gap-2">
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

      {/* 다국어 리소스 추가 영역 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {/* 기본 정보 */}
          <div className="mb-6 p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">리소스 키 *</label>
                <Input
                  value={rsrcKey}
                  onChange={(e) => setRsrcKey(e.target.value)}
                  placeholder="예: common.save"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">리소스 타입 *</label>
                <Select value={rsrcTyp} onValueChange={setRsrcTyp}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {rsrcTypOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      setLocales([...locales, { lang_cd: value, rsrc_val: '' }]);
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

          {/* 추가된 언어 번역 목록 */}
          <div className="p-4 rounded-md border bg-card">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              언어 번역 ({locales.length}개)
            </h3>

            {locales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                추가된 언어 번역이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {locales.map((locale, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-md border bg-background">
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
              disabled={loading}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
