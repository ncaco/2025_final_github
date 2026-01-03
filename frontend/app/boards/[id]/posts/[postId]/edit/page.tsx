'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { boardApi, categoryApi, postApi, Board, Category, PostUpdate, Post } from '@/lib/api/boards';
import { useToast } from '@/hooks/useToast';
import { Loading } from '@/components/common/Loading';
import { ArrowLeft, Save, Edit } from 'lucide-react';

export default function EditPostPage() {
  const { id: boardId, postId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // 폼 상태
  const [formData, setFormData] = useState<PostUpdate>({
    ttl: '',
    cn: '',
    smmry: '',
    category_id: undefined,
    ntce_yn: false,
    scr_yn: false,
    tags: [],
  });

  // UI 상태
  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pwd, setPwd] = useState(''); // 비밀번호는 별도 관리 (기존 값은 표시하지 않음)

  // 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) return;

    loadData();
  }, [isAuthenticated, boardId, postId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 게시판 정보 로드
      const boardResponse = await boardApi.getBoards();
      const currentBoard = boardResponse.find(b => b.id === Number(boardId));
      if (!currentBoard) {
        toast({
          title: '오류',
          description: '게시판을 찾을 수 없습니다.',
          variant: 'destructive',
        });
        router.push('/boards');
        return;
      }
      setBoard(currentBoard);

      // 게시글 정보 로드
      const postResponse = await postApi.getPost(Number(postId));
      
      // 작성자 확인
      if (postResponse.user_id !== user?.user_id) {
        toast({
          title: '권한 없음',
          description: '본인이 작성한 게시글만 수정할 수 있습니다.',
          variant: 'destructive',
        });
        router.push(`/boards/${boardId}/posts/${postId}`);
        return;
      }

      setPost(postResponse);

      // 폼 데이터 초기화
      setFormData({
        ttl: postResponse.ttl || '',
        cn: postResponse.cn || '',
        smmry: postResponse.smmry || '',
        category_id: postResponse.category_id,
        ntce_yn: postResponse.ntce_yn || false,
        scr_yn: postResponse.scr_yn || false,
        tags: postResponse.tags || [],
      });

      // 카테고리 로드
      try {
        const categoriesResponse = await categoryApi.getCategoriesByBoard(Number(boardId));
        setCategories(categoriesResponse);
      } catch (error) {
        console.log('카테고리 로드 실패:', error);
      }

    } catch (error) {
      console.error('데이터 로드 실패:', error);
      toast({
        title: '오류',
        description: '데이터를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
      router.push(`/boards/${boardId}/posts/${postId}`);
    } finally {
      setLoading(false);
    }
  };

  // 폼 핸들러
  const handleInputChange = (field: keyof PostUpdate, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ttl?.trim()) {
      toast({
        title: '오류',
        description: '제목을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.cn?.trim()) {
      toast({
        title: '오류',
        description: '내용을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.scr_yn && pwd.trim() && pwd.length < 4) {
      toast({
        title: '오류',
        description: '비밀번호는 최소 4자 이상이어야 합니다.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const updateData: PostUpdate = {
        ...formData,
        smmry: formData.smmry?.trim() || undefined,
        // 비밀번호는 변경할 때만 전송
        ...(formData.scr_yn && pwd.trim() ? { pwd: pwd } : {}),
      };

      await postApi.updatePost(Number(postId), updateData);

      toast({
        title: '성공',
        description: '게시글이 수정되었습니다.',
      });

      // 게시글 상세 페이지로 이동
      router.push(`/boards/${boardId}/posts/${postId}`);

    } catch (error: any) {
      console.error('게시글 수정 실패:', error);
      toast({
        title: '오류',
        description: error?.message || '게시글 수정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
          <p className="text-muted-foreground">게시글을 수정하려면 먼저 로그인해주세요.</p>
          <Button asChild>
            <Link href="/auth/login">로그인하기</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Loading size="lg" />
      </div>
    );
  }

  if (!board || !post) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">게시글을 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href={`/boards/${boardId}`}>게시판으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 수정 폼 */}
          <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="shrink-0 h-8 w-8 hover:bg-slate-100/50"
                >
                  <Link href={`/boards/${boardId}/posts/${postId}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  게시글 수정
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    제목 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="게시글 제목을 입력하세요"
                    value={formData.ttl}
                    onChange={(e) => handleInputChange('ttl', e.target.value)}
                    maxLength={200}
                    required
                    className="bg-white/50"
                  />
                  <p className="text-xs text-slate-500">
                    {formData.ttl?.length || 0}/200자
                  </p>
                </div>

                {/* 카테고리 */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      카테고리
                    </Label>
                    <Select
                      value={formData.category_id?.toString() || ''}
                      onValueChange={(value) =>
                        handleInputChange('category_id', value ? Number(value) : undefined)
                      }
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue placeholder="카테고리를 선택하세요 (선택사항)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">카테고리 없음</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.nm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 내용 */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm font-medium">
                    내용 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="게시글 내용을 입력하세요"
                    value={formData.cn}
                    onChange={(e) => handleInputChange('cn', e.target.value)}
                    rows={12}
                    required
                    className="bg-white/50 resize-none"
                  />
                </div>

                {/* 요약 */}
                <div className="space-y-2">
                  <Label htmlFor="summary" className="text-sm font-medium">
                    요약
                  </Label>
                  <Textarea
                    id="summary"
                    placeholder="게시글 요약을 입력하세요 (선택사항)"
                    value={formData.smmry || ''}
                    onChange={(e) => handleInputChange('smmry', e.target.value)}
                    rows={3}
                    maxLength={300}
                    className="bg-white/50 resize-none"
                  />
                  <p className="text-xs text-slate-500">
                    {(formData.smmry || '').length}/300자
                  </p>
                </div>

                {/* 옵션들 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notice"
                      checked={formData.ntce_yn || false}
                      onCheckedChange={(checked) =>
                        handleInputChange('ntce_yn', checked as boolean)
                      }
                    />
                    <Label htmlFor="notice" className="text-sm">
                      공지사항으로 등록
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="secret"
                        checked={formData.scr_yn || false}
                        onCheckedChange={(checked) =>
                          handleInputChange('scr_yn', checked as boolean)
                        }
                      />
                      <Label htmlFor="secret" className="text-sm">
                        비밀글로 작성
                      </Label>
                    </div>

                    {formData.scr_yn && (
                      <div className="space-y-1">
                        <Input
                          type="password"
                          placeholder="비밀번호를 입력하세요 (변경 시에만 입력)"
                          value={pwd}
                          onChange={(e) => setPwd(e.target.value)}
                          maxLength={255}
                          className="bg-white/50"
                        />
                        <p className="text-xs text-slate-500">
                          비밀번호를 변경하려면 새 비밀번호를 입력하세요. 변경하지 않으려면 비워두세요.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loading size="sm" className="mr-2" />
                        수정 중...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        수정하기
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/boards/${boardId}/posts/${postId}`)}
                    disabled={submitting}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

