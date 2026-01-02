/**
 * 게시글 필터 컴포넌트
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ContentFilters } from '@/types/board';
import { boardApi } from '@/lib/api/boards';

interface PostFiltersProps {
  filters: ContentFilters;
  onFiltersChange: (filters: Partial<ContentFilters>) => void;
}

export function PostFilters({ filters, onFiltersChange }: PostFiltersProps) {
  const [boards, setBoards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // 게시판 목록 로드
  useEffect(() => {
    const loadBoards = async () => {
      try {
        const data = await boardApi.getBoards();
        setBoards(data);
      } catch (error) {
        console.error('게시판 목록 로드 실패:', error);
      }
    };
    loadBoards();
  }, []);

  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (filters.board_id) {
        try {
          const data = await boardApi.getCategoriesByBoard(filters.board_id);
          setCategories(data);
        } catch (error) {
          console.error('카테고리 목록 로드 실패:', error);
        }
      } else {
        setCategories([]);
      }
    };
    loadCategories();
  }, [filters.board_id]);

  const handleFilterChange = (key: keyof ContentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };

    // 게시판이 변경되면 카테고리 초기화
    if (key === 'board_id') {
      newFilters.category_id = undefined;
    }

    onFiltersChange(newFilters);
  };

  const clearFilter = (key: keyof ContentFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search_query') return false; // 검색어는 별도 표시
    return value !== undefined && value !== '' && value !== null;
  });

  return (
    <div className="space-y-4">
      {/* 필터 컨트롤 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">게시판</label>
          <Select
            value={filters.board_id?.toString() || ''}
            onValueChange={(value) => handleFilterChange('board_id', value ? Number(value) : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체 게시판" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체 게시판</SelectItem>
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id.toString()}>
                  {board.nm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">카테고리</label>
          <Select
            value={filters.category_id?.toString() || ''}
            onValueChange={(value) => handleFilterChange('category_id', value ? Number(value) : undefined)}
            disabled={!filters.board_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체 카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체 카테고리</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.nm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">상태</label>
          <Select
            value={filters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체 상태</SelectItem>
              <SelectItem value="PUBLISHED">게시됨</SelectItem>
              <SelectItem value="DRAFT">임시저장</SelectItem>
              <SelectItem value="HIDDEN">숨김</SelectItem>
              <SelectItem value="DELETED">삭제됨</SelectItem>
              <SelectItem value="SECRET">비밀글</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">작성자</label>
          <Select
            value={filters.author_id || ''}
            onValueChange={(value) => handleFilterChange('author_id', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="전체 작성자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체 작성자</SelectItem>
              {/* TODO: 작성자 목록을 API로 가져와서 표시 */}
              <SelectItem value="admin">관리자</SelectItem>
              <SelectItem value="user1">사용자1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 추가 옵션 */}
      <div className="flex items-center gap-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.has_attachments || false}
            onChange={(e) => handleFilterChange('has_attachments', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">첨부파일 있음</span>
        </label>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">기간:</label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          />
          <span className="text-sm text-muted-foreground">~</span>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          />
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">활성 필터:</span>
          {activeFilters.map(([key, value]) => (
            <Badge key={key} variant="secondary" className="flex items-center gap-1">
              {getFilterLabel(key)}: {getFilterValue(key, value, boards, categories)}
              <button
                onClick={() => clearFilter(key as keyof ContentFilters)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            전체 해제
          </Button>
        </div>
      )}
    </div>
  );
}

// 필터 라벨 변환
function getFilterLabel(key: string): string {
  const labels: Record<string, string> = {
    board_id: '게시판',
    category_id: '카테고리',
    status: '상태',
    author_id: '작성자',
    has_attachments: '첨부파일',
    date_from: '시작일',
    date_to: '종료일',
  };
  return labels[key] || key;
}

// 필터 값 변환
function getFilterValue(
  key: string,
  value: any,
  boards: any[],
  categories: any[]
): string {
  if (key === 'board_id') {
    const board = boards.find(b => b.id === Number(value));
    return board?.nm || value;
  }

  if (key === 'category_id') {
    const category = categories.find(c => c.id === Number(value));
    return category?.nm || value;
  }

  if (key === 'status') {
    const statusLabels: Record<string, string> = {
      PUBLISHED: '게시됨',
      DRAFT: '임시저장',
      HIDDEN: '숨김',
      DELETED: '삭제됨',
      SECRET: '비밀글',
    };
    return statusLabels[value] || value;
  }

  if (key === 'has_attachments') {
    return value ? '있음' : '없음';
  }

  return String(value);
}
