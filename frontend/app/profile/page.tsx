'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentUser, updateUser } from '@/lib/api/users';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, CheckCircle2, XCircle, Edit2, Save, X, UserCircle } from 'lucide-react';
import type { User as UserType, UserUpdate } from '@/types/user';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserUpdate>({
    nm: '',
    nickname: '',
    telno: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setFormData({
        nm: userData.nm || '',
        nickname: userData.nickname || '',
        telno: userData.telno || '',
      });
    } catch (error) {
      console.error('프로필 로딩 실패:', error);
      toast({
        title: '오류',
        description: '프로필 정보를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const updatedUser = await updateUser(user.user_id, formData);
      setUser(updatedUser);
      setIsEditing(false);
      toast({
        title: '성공',
        description: '프로필이 성공적으로 업데이트되었습니다.',
        variant: 'success',
      });
    } catch (error: unknown) {
      console.error('프로필 업데이트 실패:', error);
      toast({
        title: '오류',
        description: (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || '프로필 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nm: user.nm || '',
        nickname: user.nickname || '',
        telno: user.telno || '',
      });
    }
    setIsEditing(false);
  };

  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, telno: formatted });
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name?: string, nickname?: string) => {
    if (nickname) return nickname.charAt(0).toUpperCase();
    if (name) return name.charAt(0).toUpperCase();
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* 헤더 섹션 */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
            {/* 아바타 */}
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                {getInitials(user.nm, user.nickname)}
              </div>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-green-500 p-1.5 border-4 border-white shadow-lg">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col items-center gap-2 md:flex-row md:items-baseline md:gap-4">
                <h1 className="text-3xl font-bold text-white">
                  {user.nickname || user.nm || user.username}
                </h1>
                {user.actv_yn && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    활성
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-lg text-white/90">@{user.username}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-white/80 md:justify-start">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.eml}</span>
                  {user.eml_vrf_yn && (
                    <CheckCircle2 className="h-4 w-4 text-green-300" />
                  )}
                </div>
                {user.telno && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{user.telno}</span>
                    {user.telno_vrf_yn && (
                      <CheckCircle2 className="h-4 w-4 text-green-300" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    가입일: {format(new Date(user.crt_dt), 'yyyy년 MM월 dd일', { locale: ko })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 좌측: 프로필 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 프로필 정보 카드 */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    프로필 정보
                  </CardTitle>
                  <CardDescription>계정 정보를 관리하세요</CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                    수정
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 이메일 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    이메일
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={user.eml}
                      disabled
                      className="bg-gray-50"
                    />
                    {user.eml_vrf_yn ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 사용자명 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    사용자명
                  </Label>
                  <Input
                    value={user.username}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">사용자명은 변경할 수 없습니다</p>
                </div>

                {/* 이름 */}
                <div className="space-y-2">
                  <Label>이름 (실명)</Label>
                  {isEditing ? (
                    <Input
                      value={formData.nm || ''}
                      onChange={(e) => setFormData({ ...formData, nm: e.target.value })}
                      placeholder="이름을 입력하세요"
                    />
                  ) : (
                    <Input
                      value={user.nm || '미설정'}
                      disabled
                      className="bg-gray-50"
                    />
                  )}
                </div>

                {/* 닉네임 */}
                <div className="space-y-2">
                  <Label>닉네임</Label>
                  {isEditing ? (
                    <Input
                      value={formData.nickname || ''}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      placeholder="닉네임을 입력하세요"
                    />
                  ) : (
                    <Input
                      value={user.nickname || '미설정'}
                      disabled
                      className="bg-gray-50"
                    />
                  )}
                </div>

                {/* 전화번호 */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    전화번호
                  </Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="tel"
                        value={formData.telno || ''}
                        onChange={handlePhoneChange}
                        placeholder="010-1234-5678"
                        maxLength={13}
                        className="flex-1"
                      />
                      {user.telno_vrf_yn && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={user.telno || '미설정'}
                        disabled
                        className="bg-gray-50 flex-1"
                      />
                      {user.telno && user.telno_vrf_yn && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {user.telno && !user.telno_vrf_yn && (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* 수정 버튼 */}
                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? '저장 중...' : '저장'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      취소
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 계정 상태 카드 */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>계정 상태</CardTitle>
                <CardDescription>계정의 현재 상태를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">계정 활성화</p>
                      <p className="text-xs text-gray-500">계정 사용 가능 여부</p>
                    </div>
                    {user.actv_yn ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">이메일 인증</p>
                      <p className="text-xs text-gray-500">이메일 확인 상태</p>
                    </div>
                    {user.eml_vrf_yn ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">전화번호 인증</p>
                      <p className="text-xs text-gray-500">전화번호 확인 상태</p>
                    </div>
                    {user.telno_vrf_yn ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">계정 사용</p>
                      <p className="text-xs text-gray-500">계정 사용 여부</p>
                    </div>
                    {user.use_yn ? (
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 우측: 통계 및 정보 */}
          <div className="space-y-6">
            {/* 통계 카드 */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>활동 통계</CardTitle>
                <CardDescription>계정 활동 요약</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">가입일</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {format(new Date(user.crt_dt), 'yyyy.MM.dd', { locale: ko })}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                {user.upd_dt && (
                  <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-900">최종 수정일</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {format(new Date(user.upd_dt), 'yyyy.MM.dd', { locale: ko })}
                        </p>
                      </div>
                      <Edit2 className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                )}
                {/* 추후 게시글 수, 댓글 수 등 추가 가능 */}
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>빠른 액션</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/boards')}>
                  <User className="mr-2 h-4 w-4" />
                  내 게시글 보기
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/')}>
                  <Mail className="mr-2 h-4 w-4" />
                  홈으로 이동
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

