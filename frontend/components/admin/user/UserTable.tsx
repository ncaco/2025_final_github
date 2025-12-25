/**
 * 사용자 목록 테이블 컴포넌트
 */

'use client';

import { useState } from 'react';
import type { User } from '@/types/user';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center border w-16">번호</TableHead>
            <TableHead className="text-center border">사용자 ID</TableHead>
            <TableHead className="text-center border">사용자명</TableHead>
            <TableHead className="text-center border">이메일</TableHead>
            <TableHead className="text-center border">이름</TableHead>
            <TableHead className="text-center border">닉네임</TableHead>
            <TableHead className="text-center border">활성 상태</TableHead>
            <TableHead className="text-center border">이메일 인증</TableHead>
            <TableHead className="text-center border">생성일</TableHead>
            <TableHead className="text-center border w-24">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => {
            // 역순 번호 계산: 전체 개수 - (현재 페이지 - 1) * itemsPerPage - index
            const rowNumber = totalCount > 0 
              ? totalCount - (currentPage - 1) * itemsPerPage - index
              : (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <TableRow key={user.user_id}>
                <TableCell className="border text-center">{rowNumber}</TableCell>
                <TableCell className="font-mono text-xs border text-center">{user.user_id}</TableCell>
              <TableCell className="font-medium border text-center">{user.username}</TableCell>
              <TableCell className="border text-center">{user.eml}</TableCell>
              <TableCell className="border text-center">{user.nm || '-'}</TableCell>
              <TableCell className="border text-center">{user.nickname || '-'}</TableCell>
              <TableCell className="border text-center">
                <Badge variant={user.actv_yn ? 'default' : 'secondary'}>
                  {user.actv_yn ? '활성' : '비활성'}
                </Badge>
              </TableCell>
              <TableCell className="border text-center">
                {user.eml_vrf_yn ? (
                  <Badge variant="default">
                    인증됨
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    미인증
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground border text-center">
                {new Date(user.crt_dt).toLocaleDateString('ko-KR')}
              </TableCell>
              <TableCell className="border text-center w-24">
                <div className="flex justify-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onViewUser(user)}
                    title="상세 보기"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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
                    onClick={() => onDeleteUser(user)}
                    className="text-destructive hover:text-destructive border-destructive"
                    title="삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
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
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

