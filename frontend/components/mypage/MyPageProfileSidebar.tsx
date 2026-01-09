/**
 * 마이페이지 프로필 정보 오른쪽 사이드바
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Calendar, Mail, Phone, User } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

export function MyPageProfileSidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name?: string, nickname?: string) => {
    if (nickname) return nickname.charAt(0).toUpperCase();
    if (name) return name.charAt(0).toUpperCase();
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <aside className="hidden xl:block w-80 shrink-0 h-screen border-l border-border bg-white">
      <div className="sticky top-0 p-6 space-y-6">
        {/* 프로필 카드 */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* 아바타 */}
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {getInitials(user.nm, user.nickname)}
                </div>
                {user.actv_yn && (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1 border-2 border-white shadow-md">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* 사용자 이름 */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-bold">
                    {user.nickname || user.nm || user.username}
                  </h2>
                  {user.actv_yn && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      활성
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>

              {/* 사용자 정보 */}
              <div className="w-full space-y-3 pt-4 border-t">
                {/* 이메일 */}
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-xs text-muted-foreground mb-1">이메일</div>
                    <div className="flex items-center gap-2">
                      <span className="break-all">{user.eml}</span>
                      {user.eml_vrf_yn && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {/* 전화번호 */}
                {user.telno && (
                  <div className="flex items-start gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="text-xs text-muted-foreground mb-1">전화번호</div>
                      <div className="flex items-center gap-2">
                        <span>{user.telno}</span>
                        {user.telno_vrf_yn && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 가입일 */}
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-xs text-muted-foreground mb-1">가입일</div>
                    <div>
                      {user.crt_dt
                        ? format(new Date(user.crt_dt), 'yyyy년 MM월 dd일', { locale: ko })
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
