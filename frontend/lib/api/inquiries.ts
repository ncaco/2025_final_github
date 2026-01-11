/**
 * 문의(Inquiry) 관련 API 클라이언트
 */

import { get, post, put, del } from './client';

export interface Inquiry {
  id: number;
  user_id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'TECHNICAL' | 'BUG' | 'FEATURE' | 'PARTNERSHIP' | 'OTHER';
  answer?: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  answered_by?: string;
  answered_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface InquiryCreate {
  title: string;
  content: string;
  category?: 'GENERAL' | 'TECHNICAL' | 'BUG' | 'FEATURE' | 'PARTNERSHIP' | 'OTHER';
}

export interface InquiryUpdate {
  title?: string;
  content?: string;
  category?: 'GENERAL' | 'TECHNICAL' | 'BUG' | 'FEATURE' | 'PARTNERSHIP' | 'OTHER';
}

export interface InquiryAnswer {
  answer: string;
}

export const inquiryApi = {
  /**
   * 문의 생성
   */
  createInquiry: (data: InquiryCreate) =>
    post<Inquiry>('/api/v1/inquiries', data),

  /**
   * 내 문의 목록 조회
   */
  getMyInquiries: (params?: {
    status?: 'PENDING' | 'ANSWERED' | 'CLOSED';
    category?: 'GENERAL' | 'TECHNICAL' | 'BUG' | 'FEATURE' | 'PARTNERSHIP' | 'OTHER';
    page?: number;
    limit?: number;
  }) =>
    get<Inquiry[]>('/api/v1/inquiries', { params }),

  /**
   * 문의 상세 조회
   */
  getInquiry: (inquiryId: number) =>
    get<Inquiry>(`/api/v1/inquiries/${inquiryId}`),

  /**
   * 문의 수정
   */
  updateInquiry: (inquiryId: number, data: InquiryUpdate) =>
    put<Inquiry>(`/api/v1/inquiries/${inquiryId}`, data),

  /**
   * 문의 답변 (관리자만)
   */
  answerInquiry: (inquiryId: number, data: InquiryAnswer) =>
    put<Inquiry>(`/api/v1/inquiries/${inquiryId}/answer`, data),

  /**
   * 문의 종료
   */
  closeInquiry: (inquiryId: number) =>
    put<Inquiry>(`/api/v1/inquiries/${inquiryId}/close`, {}),

  /**
   * 문의 삭제
   */
  deleteInquiry: (inquiryId: number) =>
    del<void>(`/api/v1/inquiries/${inquiryId}`),

  /**
   * 모든 문의 목록 조회 (관리자용)
   */
  getAllInquiries: (params?: {
    status?: 'PENDING' | 'ANSWERED' | 'CLOSED';
    category?: 'GENERAL' | 'TECHNICAL' | 'BUG' | 'FEATURE' | 'PARTNERSHIP' | 'OTHER';
    user_id?: string;
    page?: number;
    limit?: number;
  }) =>
    get<Inquiry[]>('/api/v1/inquiries/admin/all', { params }),
};
