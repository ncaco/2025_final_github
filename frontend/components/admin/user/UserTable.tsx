/**
 * 사용자 목록 테이블 컴포넌트
 */

'use client';

import { useRef } from 'react';
import type { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/common/Loading';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onViewUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
}

export function UserTable({
  users,
  loading,
  onViewUser,
  onDeleteUser,
  currentPage = 1,
  itemsPerPage = 10,
  totalCount = 0,
}: UserTableProps) {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        사용자가 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border flex flex-col h-full">
      {/* 테이블 헤더 (고정) */}
      <div 
        className="shrink-0 overflow-x-auto" 
        ref={headerScrollRef}
        onScroll={(e) => {
          if (isScrollingRef.current === 'body') return;
          const target = e.currentTarget;
          if (bodyScrollRef.current) {
            isScrollingRef.current = 'header';
            bodyScrollRef.current.scrollLeft = target.scrollLeft;
            requestAnimationFrame(() => {
              isScrollingRef.current = null;
            });
          }
        }}
      >
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-16" />
            <col className="w-[120px]" />
            <col className="w-[100px]" />
            <col className="w-[180px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-20" />
          </colgroup>
          <thead className="bg-background">
            <tr>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">번호</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">사용자 ID</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">사용자명</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">이메일</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">이름</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">닉네임</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">활성 상태</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">이메일 인증</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">생성일</th>
              <th className="h-12 p-1 text-center border font-medium text-muted-foreground">작업</th>
            </tr>
          </thead>
        </table>
      </div>
      
      {/* 테이블 바디 (스크롤 가능) */}
      <div 
        className="flex-1 min-h-0 overflow-auto" 
        ref={bodyScrollRef}
        onScroll={(e) => {
          if (isScrollingRef.current === 'header') return;
          const target = e.currentTarget;
          if (headerScrollRef.current) {
            isScrollingRef.current = 'body';
            headerScrollRef.current.scrollLeft = target.scrollLeft;
            requestAnimationFrame(() => {
              isScrollingRef.current = null;
            });
          }
        }}
      >
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-16" />
            <col className="w-[120px]" />
            <col className="w-[100px]" />
            <col className="w-[180px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[120px]" />
            <col className="w-20" />
          </colgroup>
          <tbody>
          {users.map((user, index) => {
            // 역순 번호 계산: 전체 개수 - (현재 페이지 - 1) * itemsPerPage - index
            const rowNumber = totalCount > 0 
              ? totalCount - (currentPage - 1) * itemsPerPage - index
              : (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={user.user_id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-1 border text-center align-middle">{rowNumber}</td>
                <td className="p-1 border text-center align-middle">{user.user_id}</td>
                <td className="p-1 border text-center align-middle">{user.username}</td>
                <td className="p-1 border text-center align-middle">{user.eml}</td>
                <td className="p-1 border text-center align-middle">{user.nm || '-'}</td>
                <td className="p-1 border text-center align-middle">{user.nickname || '-'}</td>
                <td className="p-1 border text-center align-middle">
                  <Badge variant={user.actv_yn ? 'default' : 'secondary'}>
                    {user.actv_yn ? '활성' : '비활성'}
                  </Badge>
                </td>
                <td className="p-1 border text-center align-middle">
                  {user.eml_vrf_yn ? (
                    <Badge variant="default">
                      인증됨
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      미인증
                    </Badge>
                  )}
                </td>
                <td className="p-1 border text-center align-middle">
                  {new Date(user.crt_dt).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-1 border text-center align-middle w-20">
                  <div className="flex justify-center gap-0.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onViewUser(user)}
                      title="상세 보기"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive border-destructive"
                      onClick={() => onDeleteUser(user)}
                      title="삭제"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
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
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

