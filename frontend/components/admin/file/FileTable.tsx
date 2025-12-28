/**
 * 파일 목록 테이블 컴포넌트
 */

'use client';

import { useRef } from 'react';
import type { File } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/common/Loading';

interface FileTableProps {
  files: File[];
  loading: boolean;
  onViewFile: (file: File) => void;
  onDeleteFile: (file: File) => void;
  currentPage?: number;
  itemsPerPage?: number;
  totalCount?: number;
}

export function FileTable({
  files,
  loading,
  onViewFile,
  onDeleteFile,
  currentPage = 1,
  itemsPerPage = 10,
  totalCount = 0,
}: FileTableProps) {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<string | null>(null);

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // MIME 타입에 따른 아이콘
  const getFileIcon = (mimeType?: string, fileExt?: string): string => {
    if (!mimeType && !fileExt) return '📄';

    const mime = mimeType?.toLowerCase() || '';
    const ext = fileExt?.toLowerCase() || '';

    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return '🖼️';
    } else if (mime.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(ext)) {
      return '🎥';
    } else if (mime.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
      return '🎵';
    } else if (mime.includes('pdf')) {
      return '📕';
    } else if (mime.includes('zip') || mime.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return '📦';
    } else if (mime.includes('text') || ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(ext)) {
      return '📝';
    } else {
      return '📄';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        파일이 없습니다.
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
            <col className="w-12" />
            <col className="w-[200px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[120px]" />
            <col className="w-20" />
          </colgroup>
          <thead className="bg-background">
            <tr>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">번호</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">아이콘</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">파일명</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">파일 ID</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">사용자 ID</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">크기</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">확장자</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">저장소</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">공개</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">생성일</th>
              <th className="h-12 px-4 text-left border-b font-medium text-muted-foreground">작업</th>
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
            <col className="w-12" />
            <col className="w-[200px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[120px]" />
            <col className="w-20" />
          </colgroup>
          <tbody>
          {files.map((file, index) => {
            // 역순 번호 계산: 전체 개수 - (현재 페이지 - 1) * itemsPerPage - index
            const rowNumber = totalCount > 0
              ? totalCount - (currentPage - 1) * itemsPerPage - index
              : (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={file.file_id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle">{rowNumber}</td>
                <td className="p-4 align-middle text-center text-lg">
                  {getFileIcon(file.mime_typ, file.file_ext)}
                </td>
                <td className="p-4 align-middle">
                  <div className="font-medium truncate max-w-[200px]" title={file.file_nm}>
                    {file.file_nm}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <span className="font-mono text-sm">{file.file_id}</span>
                </td>
                <td className="p-4 align-middle">
                  <span className="font-mono text-sm">{file.user_id}</span>
                </td>
                <td className="p-4 align-middle text-sm">
                  {formatFileSize(file.file_sz)}
                </td>
                <td className="p-4 align-middle">
                  {file.file_ext ? (
                    <Badge variant="secondary" className="text-xs">
                      .{file.file_ext}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="p-4 align-middle">
                  <Badge variant="outline" className="text-xs">
                    {file.stg_typ}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  <Badge variant={file.pub_yn ? 'default' : 'secondary'} className="text-xs">
                    {file.pub_yn ? '공개' : '비공개'}
                  </Badge>
                </td>
                <td className="p-4 align-middle">
                  {new Date(file.crt_dt).toLocaleDateString('ko-KR')}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex justify-center gap-0.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewFile(file)}
                      title="상세 보기"
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
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive border-destructive"
                      onClick={() => onDeleteFile(file)}
                      title="삭제"
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
