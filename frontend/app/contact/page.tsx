/**
 * 문의 페이지
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { dashboardApi } from '@/lib/api/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ContactPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    privacy: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: '로그인 필요',
        description: '문의를 제출하려면 로그인이 필요합니다.',
        variant: 'destructive',
      });
      router.push('/auth/login');
      return;
    }

    if (!formData.privacy) {
      toast({
        title: '오류',
        description: '개인정보처리방침에 동의해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // 카테고리 매핑
      const categoryMap: Record<string, string> = {
        'general': 'GENERAL',
        'technical': 'TECHNICAL',
        'bug': 'BUG',
        'feature': 'FEATURE',
        'partnership': 'PARTNERSHIP',
        'other': 'OTHER',
      };

      await dashboardApi.createInquiry({
        title: formData.subject || formData.message.substring(0, 50),
        content: `이름: ${formData.name}\n이메일: ${formData.email}\n문의 유형: ${formData.category}\n\n${formData.message}`,
        category: categoryMap[formData.category] || 'GENERAL',
      });

      toast({
        title: '성공',
        description: '문의가 성공적으로 제출되었습니다.',
        variant: 'success',
      });

      // 폼 초기화
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
        privacy: false,
      });

      // 문의 내역 페이지로 이동
      router.push('/dashboard/inquiries');
    } catch (error) {
      console.error('문의 제출 실패:', error);
      toast({
        title: '오류',
        description: '문의 제출에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">문의하기</h1>
          <p className="text-xl text-gray-600">프로젝트에 대해 궁금한 점이 있으시면 언제든지 연락주세요</p>
        </div>

        {/* 문의 양식 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">문의 양식</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="name">
                  이름 *
                </Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="email">
                  이메일 *
                </Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1"
                  placeholder="이메일을 입력하세요"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">
                제목 *
              </Label>
              <Input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="mt-1"
                placeholder="문의 제목을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="category">
                문의 유형
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="문의 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반 문의</SelectItem>
                  <SelectItem value="technical">기술 지원</SelectItem>
                  <SelectItem value="bug">버그 신고</SelectItem>
                  <SelectItem value="feature">기능 제안</SelectItem>
                  <SelectItem value="partnership">제휴 문의</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="message">
                메시지 *
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                required
                className="mt-1"
                placeholder="문의 내용을 자세히 입력하세요"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="privacy"
                checked={formData.privacy}
                onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                <a href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</a>에 동의합니다 *
              </label>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="px-6 py-3"
              >
                {loading ? '제출 중...' : '문의 보내기'}
              </Button>
            </div>
          </form>
        </div>

        {/* 연락처 정보 */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">연락처 정보</h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">이메일</p>
                  <a href="mailto:contact@2026challenge.com" className="text-blue-600 hover:underline">
                    contact@2026challenge.com
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">GitHub</p>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    github.com/2026challenge
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">응답 시간</p>
                  <p className="text-gray-600">24-48시간 이내</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">자주 묻는 질문</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">프로젝트에 참여하고 싶어요</h3>
                <p className="text-gray-600 text-sm">GitHub 저장소를 확인하시고 Issue나 Pull Request를 통해 참여하실 수 있습니다.</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">기술 지원이 필요해요</h3>
                <p className="text-gray-600 text-sm">API 문서를 참고하시거나 상세한 오류 메시지와 함께 문의해 주세요.</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">버그를 발견했어요</h3>
                <p className="text-gray-600 text-sm">GitHub Issues에 버그 리포트를 작성해 주시면 빠르게 수정하겠습니다.</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">기능 제안이 있어요</h3>
                <p className="text-gray-600 text-sm">프로젝트 로드맵과 일치하는지 확인 후 적극적으로 검토하겠습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}