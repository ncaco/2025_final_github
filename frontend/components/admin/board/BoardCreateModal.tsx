/**
 * 게시판 생성 모달 컴포넌트
 */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BoardCreate, BoardType, PermissionLevel } from '@/types/board';

const boardCreateSchema = z.object({
  nm: z.string().min(1, '게시판명을 입력해주세요').max(100, '게시판명은 100자 이내로 입력해주세요'),
  dsc: z.string().optional(),
  typ: z.enum(['GENERAL', 'NOTICE', 'QNA', 'IMAGE', 'VIDEO']).default('GENERAL'),
  read_permission: z.enum(['ALL', 'USER', 'ADMIN']).default('ALL'),
  write_permission: z.enum(['ALL', 'USER', 'ADMIN']).default('USER'),
  comment_permission: z.enum(['ALL', 'USER', 'ADMIN']).default('USER'),
  allow_attachment: z.boolean().default(true),
  allow_image: z.boolean().default(true),
  max_file_size: z.number().min(1).max(100).default(10),
  sort_order: z.number().min(0).default(0),
});

type BoardCreateForm = z.infer<typeof boardCreateSchema>;

interface BoardCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BoardCreate) => Promise<void>;
}

export function BoardCreateModal({ open, onClose, onSubmit }: BoardCreateModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<BoardCreateForm>({
    resolver: zodResolver(boardCreateSchema),
    defaultValues: {
      nm: '',
      dsc: '',
      typ: 'GENERAL',
      read_permission: 'ALL',
      write_permission: 'USER',
      comment_permission: 'USER',
      allow_attachment: true,
      allow_image: true,
      max_file_size: 10,
      sort_order: 0,
    },
  });

  const handleSubmit = async (data: BoardCreateForm) => {
    try {
      setLoading(true);
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('게시판 생성 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>게시판 생성</DialogTitle>
          <DialogDescription>
            새로운 게시판을 생성합니다. 모든 필드를 정확히 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>게시판명 *</FormLabel>
                    <FormControl>
                      <Input placeholder="게시판명을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="typ"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>게시판 유형</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="유형 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GENERAL">일반</SelectItem>
                        <SelectItem value="NOTICE">공지</SelectItem>
                        <SelectItem value="QNA">Q&A</SelectItem>
                        <SelectItem value="IMAGE">이미지</SelectItem>
                        <SelectItem value="VIDEO">동영상</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dsc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="게시판에 대한 설명을 입력하세요"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    게시판의 용도와 규칙을 설명해주세요.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="read_permission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>읽기 권한</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">전체</SelectItem>
                        <SelectItem value="USER">사용자</SelectItem>
                        <SelectItem value="ADMIN">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="write_permission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>쓰기 권한</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">전체</SelectItem>
                        <SelectItem value="USER">사용자</SelectItem>
                        <SelectItem value="ADMIN">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment_permission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>댓글 권한</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL">전체</SelectItem>
                        <SelectItem value="USER">사용자</SelectItem>
                        <SelectItem value="ADMIN">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_file_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>최대 파일 크기 (MB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>정렬 순서</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      낮은 숫자가 먼저 표시됩니다.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="allow_attachment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">첨부파일 허용</FormLabel>
                      <FormDescription>
                        파일 첨부를 허용할지 설정합니다.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_image"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">이미지 허용</FormLabel>
                      <FormDescription>
                        이미지 업로드를 허용할지 설정합니다.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '생성 중...' : '생성'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
