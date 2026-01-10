/**
 * 게시글 수정 모달 컴포넌트
 */
'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Post, PostUpdate } from '@/types/board';

const postUpdateSchema = z.object({
  ttl: z.string().min(1, '제목을 입력해주세요').max(200, '제목은 200자 이내로 입력해주세요').optional(),
  cn: z.string().min(1, '내용을 입력해주세요').optional(),
  smmry: z.string().max(300, '요약은 300자 이내로 입력해주세요').optional(),
  category_id: z.number().optional(),
  ntce_yn: z.boolean().optional(),
  scr_yn: z.boolean().optional(),
  stts: z.enum(['PUBLISHED', 'DRAFT', 'HIDDEN', 'SECRET']).optional(),
  tags: z.array(z.string()).optional(),
  change_rsn: z.string().optional(),
});

type PostUpdateForm = z.infer<typeof postUpdateSchema>;

interface PostUpdateModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PostUpdate) => Promise<void>;
}

export function PostUpdateModal({ post, open, onClose, onSubmit }: PostUpdateModalProps) {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const form = useForm<PostUpdateForm>({
    resolver: zodResolver(postUpdateSchema),
    defaultValues: {
      ttl: post.ttl,
      cn: post.cn,
      smmry: post.smmry || '',
      category_id: post.category_id,
      ntce_yn: post.ntce_yn,
      scr_yn: post.scr_yn,
      stts: post.stts === 'DELETED' ? undefined : post.stts,
      tags: post.tags || [],
      change_rsn: '',
    },
  });

  // 게시글 데이터가 변경될 때 폼 초기화
  useEffect(() => {
    if (post) {
      form.reset({
        ttl: post.ttl,
        cn: post.cn,
        smmry: post.smmry || '',
        category_id: post.category_id,
        ntce_yn: post.ntce_yn,
        scr_yn: post.scr_yn,
        stts: post.stts === 'DELETED' ? undefined : post.stts,
        tags: post.tags || [],
        change_rsn: '',
      });
    }
  }, [post, form]);

  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      if (post.board_id) {
        try {
          const { boardApi } = await import('@/lib/api/boards');
          const data = await boardApi.getCategoriesByBoard(post.board_id);
          setCategories(data);
        } catch (error) {
          console.error('카테고리 목록 로드 실패:', error);
        }
      }
    };
    if (open) {
      loadCategories();
    }
  }, [post.board_id, open]);

  const handleSubmit = async (data: PostUpdateForm) => {
    try {
      setLoading(true);
      // undefined 값 제거
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== '')
      );
      await onSubmit(filteredData);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.getValues('tags')?.includes(tagInput.trim())) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>게시글 수정</DialogTitle>
          <DialogDescription>
            게시글 정보를 수정합니다. 변경 사유를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ttl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목 *</FormLabel>
                    <FormControl>
                      <Input placeholder="게시글 제목" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상태</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PUBLISHED">게시됨</SelectItem>
                        <SelectItem value="DRAFT">임시저장</SelectItem>
                        <SelectItem value="HIDDEN">숨김</SelectItem>
                        <SelectItem value="SECRET">비밀글</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">카테고리 없음</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.nm}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>내용 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="게시글 내용"
                      className="min-h-[200px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smmry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>요약</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="게시글 요약 (선택사항)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 태그 입력 */}
            <div className="space-y-2">
              <FormLabel>태그</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="태그 입력 후 Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  추가
                </Button>
              </div>
              {form.watch('tags') && form.watch('tags')!.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.watch('tags')!.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ntce_yn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">공지사항</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        공지사항으로 표시합니다.
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scr_yn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">비밀글</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        비밀글로 설정합니다.
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="change_rsn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>변경 사유</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="변경 사유를 입력해주세요"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    변경 내용을 기록하여 추적할 수 있습니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '수정 중...' : '수정'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
