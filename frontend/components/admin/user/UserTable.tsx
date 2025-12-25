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
}

export function UserTable({
  users,
  loading,
  onViewUser,
  onDeleteUser,
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
            <TableHead>사용자 ID</TableHead>
            <TableHead>사용자명</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>닉네임</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell>{user.eml}</TableCell>
              <TableCell>{user.nm || '-'}</TableCell>
              <TableCell>{user.nickname || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant={user.actv_yn ? 'default' : 'secondary'}>
                    {user.actv_yn ? '활성' : '비활성'}
                  </Badge>
                  {user.eml_vrf_yn && (
                    <Badge variant="outline" className="text-xs">
                      이메일 인증
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(user.crt_dt).toLocaleDateString('ko-KR')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewUser(user)}
                  >
                    상세
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteUser(user)}
                    className="text-destructive hover:text-destructive"
                  >
                    삭제
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

