/**
 * 다국어 관리 페이지
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getLocales, deleteLocale } from '@/lib/api/locales';
import type { Locale } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { LanguageConfigModal } from '@/components/admin/locales/LanguageConfigModal';
import { getLanguageConfigs } from '@/lib/api/languageConfigs';
import type { LanguageConfig } from '@/types/user';

const ITEMS_PER_PAGE_STORAGE_KEY = 'admin_locales_items_per_page';

export default function LocalesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isInitialized } = useAuth();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [groupedLocales, setGroupedLocales] = useState<Record<string, { rsrc_typ: string; rsrc_key: string; translations: Record<string, Locale>; locales: Locale[] }>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSearchColumn, setSelectedSearchColumn] = useState('rsrc_key');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLangCd, setSelectedLangCd] = useState<string>('all');
  const [selectedRsrcTyp, setSelectedRsrcTyp] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [localeToDelete, setLocaleToDelete] = useState<Locale | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<{ rsrc_key: string; rsrc_typ: string; locales: Locale[] } | null>(null);
  const [showLanguageConfig, setShowLanguageConfig] = useState(false);
  const [enabledLanguages, setEnabledLanguages] = useState<LanguageConfig[]>([]);
  const { toast } = useToast();

  // 검색 옵션
  const searchOptions = [
    { value: 'rsrc_key', label: '리소스 키' },
    { value: 'rsrc_val', label: '번역 값' },
  ];

  // 언어 코드 옵션 (동적 생성)
  const langOptions = [
    { value: 'all', label: '모든 언어' },
    ...enabledLanguages.map(lang => ({
      value: lang.lang_cd,
      label: lang.lang_nm
    }))
  ];

  // 리소스 타입 옵션
  const rsrcTypeOptions = [
    { value: 'all', label: '모든 타입' },
    { value: 'LABEL', label: '라벨' },
    { value: 'MESSAGE', label: '메시지' },
    { value: 'ERROR', label: '에러' },
  ];

  // 언어 설정 로드
  const loadLanguageConfigs = useCallback(async () => {
    try {
      const languages = await getLanguageConfigs({ use_yn: true });
      setEnabledLanguages(languages);
    } catch (error) {
      console.error('언어 설정 로드 실패:', error);
    }
  }, []);

  // 언어 설정 저장 핸들러
  const handleLanguageConfigSave = () => {
    loadLanguageConfigs();
    toast({
      title: '언어 설정 적용됨',
      description: '변경된 언어 설정이 목록에 반영되었습니다.',
    });
  };

  // 다국어 데이터 로드
  const loadLocalesData = useCallback(async () => {
    try {
      setLoading(true);

      // 모든 언어 데이터를 가져와서 그룹화
      // 기본 파라미터만 사용해서 422 에러 해결 시도
      const params: {
        skip: number;
        limit: number;
        rsrc_typ?: string;
      } = {
        skip: 0,
        limit: 9999999, // 충분한 데이터를 가져와서 프론트엔드에서 페이징
      };

      // rsrc_typ이 'all'이 아니고 유효한 값일 때만 필터링 적용
      const validRsrcTypes = ['LABEL', 'MESSAGE', 'ERROR'];
      if (selectedRsrcTyp !== 'all' && validRsrcTypes.includes(selectedRsrcTyp)) {
        params.rsrc_typ = selectedRsrcTyp;
      }

      const data = await getLocales(params);

      // 데이터 검증
      if (!Array.isArray(data)) {
        console.error('응답 데이터가 배열이 아님:', data);
        throw new Error('서버에서 잘못된 응답을 받았습니다.');
      }

      // 빈 데이터인 경우에도 처리
      if (data.length === 0) {
        console.log('다국어 데이터가 비어있음 - 샘플 데이터를 추가해야 합니다.');
      }

      // rsrc_key와 rsrc_typ을 기준으로 그룹화
      const groupedData = data.reduce((acc, locale) => {
        const key = `${locale.rsrc_typ}:${locale.rsrc_key}`;
        if (!acc[key]) {
          acc[key] = {
            rsrc_typ: locale.rsrc_typ,
            rsrc_key: locale.rsrc_key,
            translations: {},
            locales: []
          };
        }
        acc[key].translations[locale.lang_cd] = locale;
        acc[key].locales.push(locale);
        return acc;
      }, {} as Record<string, { rsrc_typ: string; rsrc_key: string; translations: Record<string, Locale>; locales: Locale[] }>);

      setLocales(data);
      setGroupedLocales(groupedData);
    } catch (error) {
      console.error('❌ 다국어 데이터 로드 실패:', error);
      console.error('에러 상세 정보:', {
        message: error instanceof Error ? error.message : '알 수 없는 에러',
        status: (error as any)?.status,
        data: (error as any)?.data
      });
      toast({
        title: '오류',
        description: `다국어 데이터를 불러오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRsrcTyp, toast]);

  useEffect(() => {
    loadLanguageConfigs();
  }, [loadLanguageConfigs]);

  useEffect(() => {
    loadLocalesData();
  }, [loadLocalesData]);

  // 검색 필터링 (그룹화된 데이터 기준)
  const filteredGroupedLocales = Object.entries(groupedLocales).filter(([key, group]) => {
    if (!searchKeyword) return true;

    const keyword = searchKeyword.toLowerCase();

    switch (selectedSearchColumn) {
      case 'rsrc_key':
        return group.rsrc_key?.toLowerCase().includes(keyword);
      case 'rsrc_val':
        // 모든 번역본에서 검색
        return Object.values(group.translations).some(locale =>
          locale.rsrc_val?.toLowerCase().includes(keyword)
        );
      default:
        return true;
    }
  });

  // 다국어 그룹 상세 보기 (편집)
  const handleViewLocaleGroup = (rsrcKey: string, rsrcType: string) => {
    router.push(`/admin/locales/${encodeURIComponent(rsrcKey)}?type=${rsrcType}`);
  };

  const handleEditGroup = (group: { rsrc_key: string; rsrc_typ: string; translations: Record<string, Locale>; locales: Locale[] }) => {
    // 그룹의 첫 번째 locale_id를 찾아 편집 페이지로 이동
    const firstLocale = group.locales[0];
    if (firstLocale) {
      router.push(`/admin/locales/${firstLocale.locale_id}`);
    }
  };

  // 다국어 그룹 삭제 확인
  const handleDeleteGroupClick = (group: { rsrc_key: string; rsrc_typ: string; locales: Locale[] }) => {
    setGroupToDelete(group);
  };

  // 다국어 그룹 삭제 실행
  const handleDeleteGroupConfirm = async () => {
    if (!groupToDelete) return;

    try {
      // 그룹 내 모든 locale 삭제
      await Promise.all(
        groupToDelete.locales.map(locale => deleteLocale(locale.locale_id))
      );

      toast({
        title: '다국어 그룹 삭제 완료',
        description: `${groupToDelete.rsrc_key} 그룹의 모든 번역본이 삭제되었습니다.`,
        variant: 'success',
      });
      setGroupToDelete(null);
      loadLocalesData();
    } catch (error) {
      console.error('다국어 그룹 삭제 실패:', error);
      toast({
        title: '다국어 그룹 삭제 실패',
        description: error instanceof Error ? error.message : '다국어 그룹 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
  };

  // 인증 상태 확인
  if (!isInitialized || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-muted-foreground">
          로그인이 필요합니다
        </h2>
        <p className="text-muted-foreground text-center">
          다국어 관리를 확인하려면 먼저 로그인해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] p-6">
      <div className="shrink-0 space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">다국어 관리</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => router.push('/admin/locales/create')} variant="default" size="sm">
              추가
            </Button>
            <Button
              onClick={() => setShowLanguageConfig(true)}
              variant="outline"
              size="sm"
            >
              언어 설정
            </Button>
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
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="rounded-md border bg-card">
          <div className="p-3">
            <div className="flex gap-3">
              <Select value={selectedRsrcTyp} onValueChange={setSelectedRsrcTyp}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-white">
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {rsrcTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSearchColumn} onValueChange={setSelectedSearchColumn}>
                <SelectTrigger className="w-[140px] h-8 text-sm bg-white">
                  <SelectValue placeholder="검색 컬럼 선택" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                className="h-8 text-sm"
                placeholder="검색어를 입력하세요..."
                value={searchKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 다국어 목록 */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : filteredGroupedLocales.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGroupedLocales
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map(([key, group]) => (
                  <div
                    key={key}
                    className="rounded-md border bg-card p-4"
                  >
                    {/* 리소스 키 헤더 */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium font-mono">{group.rsrc_key}</h3>
                          <p className="text-sm text-muted-foreground">타입: {group.rsrc_typ}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(group.translations).length}개 언어
                        </Badge>
                        <Button
                          onClick={() => handleEditGroup(group)}
                          variant="outline"
                          size="sm"
                          className="h-8"
                        >
                          편집
                        </Button>
                        <Button
                          onClick={() => handleDeleteGroupClick(group)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 text-destructive hover:text-destructive border-destructive"
                          title="그룹 삭제"
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
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </Button>
                      </div>
                    </div>

                    {/* 언어별 번역 표시 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {enabledLanguages.map(langConfig => {
                        const langCode = langConfig.lang_cd;
                        const locale = group.translations[langCode];
                        const langName = langConfig.lang_nm;

                        return (
                          <div
                            key={langCode}
                            className={`p-3 rounded-md border ${
                              locale?.use_yn
                                ? 'bg-background border-border'
                                : 'bg-muted/30 border-muted'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                {langName}
                              </Badge>
                              {locale && (
                                <Badge variant={locale.use_yn ? 'default' : 'secondary'} className="text-xs">
                                  {locale.use_yn ? '사용' : '미사용'}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm">
                              {locale ? (
                                <span className={locale.use_yn ? 'text-foreground' : 'text-muted-foreground'}>
                                  {locale.rsrc_val}
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic">번역 없음</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="py-4">
          {!loading && filteredGroupedLocales.length > 0 && (() => {
            const totalPages = Math.ceil(filteredGroupedLocales.length / itemsPerPage);

            // 페이지 번호 계산 (최대 7개 표시)
            let startPage: number;
            let endPage: number;

            if (totalPages <= 7) {
              startPage = 1;
              endPage = totalPages;
            } else {
              if (currentPage <= 4) {
                startPage = 1;
                endPage = 7;
              } else if (currentPage >= totalPages - 3) {
                startPage = totalPages - 6;
                endPage = totalPages;
              } else {
                startPage = currentPage - 3;
                endPage = currentPage + 3;
              }
            }

            const pageNumbers = [];
            for (let i = startPage; i <= endPage; i++) {
              pageNumbers.push(i);
            }

            const handleItemsPerPageChange = (value: string) => {
              const newItemsPerPage = parseInt(value, 10);
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
              if (typeof window !== 'undefined') {
                localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, String(newItemsPerPage));
              }
            };

            return (
              <div className="flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="10">10</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                  </select>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    title="맨 처음"
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
                      <path d="m11 17-5-5 5-5" />
                      <path d="m18 17-5-5 5-5" />
                    </svg>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    이전
                  </Button>

                  <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-10"
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    다음
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    title="맨 끝"
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
                      <path d="m6 17 5-5-5-5" />
                      <path d="m13 17 5-5-5-5" />
                    </svg>
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 그룹 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!groupToDelete}
        onOpenChange={(open) => !open && setGroupToDelete(null)}
        title="다국어 그룹 삭제"
        description={`${groupToDelete ? `${groupToDelete.rsrc_key} (${groupToDelete.rsrc_typ}) 그룹의 모든 번역본(${groupToDelete.locales.length}개)을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.` : ''}`}
        confirmText="그룹 삭제"
        cancelText="취소"
        variant="destructive"
        onConfirm={handleDeleteGroupConfirm}
      />

      {/* 언어 설정 모달 */}
      <LanguageConfigModal
        open={showLanguageConfig}
        onOpenChange={setShowLanguageConfig}
        onSave={handleLanguageConfigSave}
      />
    </div>
  );
}
