/**
 * 대시보드 관련 API 클라이언트
 */

import { get, post } from './client';

export interface DashboardStats {
  total_posts: number;
  total_comments: number;
  total_bookmarks: number;
  total_follows: number;
  posts_today: number;
  comments_today: number;
}

export interface RecentActivity {
  id: number;
  type: 'POST' | 'COMMENT' | 'BOOKMARK' | 'FOLLOW' | 'REPORT';
  title: string;
  created_at: string;
}

export interface MyPost {
  id: string;
  title: string;
  content: string;
  board_id: string;
  board_name: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

export interface MyComment {
  id: string;
  content: string;
  post_id: string;
  post_title: string;
  board_id: string;
  board_name: string;
  created_at: string;
  updated_at: string;
}

export interface MyBookmark {
  id: string;
  post_id: string;
  post_title: string;
  board_id: string;
  board_name: string;
  created_at: string;
}

export interface MyFollow {
  id: string;
  board_id: string;
  board_name: string;
  board_description: string;
  created_at: string;
}

export interface MyReport {
  id: string;
  title: string;
  reason: string;
  status: 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  title: string;
  content: string;
  answer?: string;
  status: 'PENDING' | 'ANSWERED' | 'CLOSED';
  created_at: string;
  updated_at: string;
}

export const dashboardApi = {
  /**
   * 대시보드 통계 조회
   */
  async getStats(): Promise<DashboardStats> {
    return get<DashboardStats>('/api/v1/dashboard/stats');
  },

  /**
   * 최근 활동 조회
   */
  async getRecentActivities(): Promise<RecentActivity[]> {
    return get<RecentActivity[]>('/api/v1/dashboard/recent-activities');
  },

  /**
   * 내 게시글 목록 조회
   */
  async getMyPosts(page: number = 1, limit: number = 20): Promise<{ items: MyPost[]; total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    return get<{ items: MyPost[]; total: number }>(`/api/v1/dashboard/my-posts?${queryParams.toString()}`);
  },

  /**
   * 내 댓글 목록 조회
   */
  async getMyComments(page: number = 1, limit: number = 20): Promise<{ items: MyComment[]; total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    return get<{ items: MyComment[]; total: number }>(`/api/v1/dashboard/my-comments?${queryParams.toString()}`);
  },

  /**
   * 내 북마크 목록 조회
   */
  async getMyBookmarks(page: number = 1, limit: number = 20): Promise<{ items: MyBookmark[]; total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    return get<{ items: MyBookmark[]; total: number }>(`/api/v1/dashboard/my-bookmarks?${queryParams.toString()}`);
  },

  /**
   * 내 팔로우 목록 조회
   */
  async getMyFollows(page: number = 1, limit: number = 20): Promise<{ items: MyFollow[]; total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    return get<{ items: MyFollow[]; total: number }>(`/api/v1/dashboard/my-follows?${queryParams.toString()}`);
  },

  /**
   * 내 신고 목록 조회
   */
  async getMyReports(page: number = 1, limit: number = 20): Promise<{ items: MyReport[]; total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    return get<{ items: MyReport[]; total: number }>(`/api/v1/dashboard/my-reports?${queryParams.toString()}`);
  },

  /**
   * 문의 내역 목록 조회
   */
  async getInquiries(page: number = 1, limit: number = 20): Promise<{ items: Inquiry[]; total: number }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    return get<{ items: Inquiry[]; total: number }>(`/api/v1/dashboard/inquiries?${queryParams.toString()}`);
  },

  /**
   * 새 문의 생성
   */
  async createInquiry(data: { title: string; content: string; category?: string }): Promise<Inquiry> {
    return post<Inquiry>('/api/v1/dashboard/inquiries', data);
  },

  /**
   * 관리자 대시보드 통계 조회
   */
  async getAdminStats(): Promise<{
    total_posts: number;
    total_users: number;
    total_comments: number;
    pending_reports: number;
    posts_today: number;
    comments_today: number;
    users_today: number;
  }> {
    return get('/api/v1/dashboard/admin/stats');
  },

  /**
   * 최근 시스템 활동 조회 (관리자용)
   */
  async getAdminRecentActivities(limit: number = 20): Promise<RecentActivity[]> {
    return get<RecentActivity[]>(`/api/v1/dashboard/admin/recent-activities?limit=${limit}`);
  },
};
