/**
 * 신고 및 관리 기능 API
 */
import { get, post, put, del } from './client';

// 신고 관련 타입들
export interface Report {
  id: number;
  reporter_id: string;
  target_type: 'POST' | 'COMMENT' | 'USER';
  target_id: number;
  rsn: 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';
  dsc?: string;
  stts: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  processed_by?: string;
  prcs_dt?: string;
  crt_dt: string;
}

export interface ReportCreate {
  target_type: 'POST' | 'COMMENT' | 'USER';
  target_id: number;
  rsn: 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';
  dsc?: string;
}

export interface ReportUpdate {
  stts?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  processed_by?: string;
}

// 팔로우 관련 타입들
export interface Follow {
  id: number;
  follower_id: string;
  following_id: string;
  typ: 'USER' | 'BOARD';
  crt_dt: string;
}

export interface FollowCreate {
  following_id: string;
  typ: 'USER' | 'BOARD';
}

// 알림 관련 타입들
export interface Notification {
  id: number;
  user_id: string;
  typ: 'NEW_COMMENT' | 'NEW_LIKE' | 'NEW_FOLLOW' | 'POST_MENTION' | 'COMMENT_MENTION' | 'ADMIN_NOTICE';
  ttl: string;
  msg?: string;
  is_read: boolean;
  related_post_id?: number;
  related_comment_id?: number;
  related_user_id?: string;
  noti_metadata?: Record<string, any>;
  crt_dt: string;
}

// 사용자 설정 관련 타입들
export interface UserPreference {
  id: number;
  user_id: string;
  pref_key: string;
  pref_val?: string;
  upd_dt?: string;
}

export interface UserPreferenceUpdate {
  pref_key: string;
  pref_val: string;
}

// 통계 관련 타입들
export interface BoardStatistics {
  id: number;
  nm: string;
  total_posts: number;
  published_posts: number;
  posts_last_week: number;
  posts_today: number;
  last_post_date?: string;
}

export interface PopularPost {
  id: number;
  ttl: string;
  vw_cnt: number;
  lk_cnt: number;
  cmt_cnt: number;
  author_nickname?: string;
  board_nm: string;
  crt_dt: string;
  popularity_score: number;
}

export interface UserActivityStats {
  user_id: string;
  nickname?: string;
  total_posts: number;
  total_comments: number;
  total_post_likes: number;
  total_comment_likes: number;
  total_bookmarks: number;
  last_activity_date?: string;
}

// 신고 API 함수들
export const reportApi = {
  // 신고 생성
  createReport: (data: ReportCreate) =>
    post<Report>('/api/v1/board-extra/reports', data),

  // 신고 목록 조회 (관리자용)
  getReports: (params?: {
    status?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
    skip?: number;
    limit?: number;
  }) =>
    get<Report[]>('/api/v1/board-extra/reports', { params }),

  // 신고 처리 (관리자용)
  updateReport: (reportId: number, data: ReportUpdate) =>
    put<Report>(`/api/v1/board-extra/reports/${reportId}`, data),
};

// 팔로우 API 함수들
export const followApi = {
  // 팔로우 추가
  follow: (data: FollowCreate) =>
    post<Follow>('/api/v1/board-extra/follow', data),

  // 팔로우 취소
  unfollow: (followingId: string, followType: 'USER' | 'BOARD') =>
    del<void>(`/api/v1/board-extra/follow/${followingId}?follow_type=${followType}`),

  // 팔로워 목록 조회
  getFollowers: (userId: string, params?: { skip?: number; limit?: number }) =>
    get<Follow[]>(`/api/v1/board-extra/follow/followers/${userId}`, { params }),

  // 팔로잉 목록 조회
  getFollowing: (userId: string, params?: {
    follow_type?: 'USER' | 'BOARD';
    skip?: number;
    limit?: number;
  }) =>
    get<Follow[]>(`/api/v1/board-extra/follow/following/${userId}`, { params }),
};

// 알림 API 함수들
export const notificationApi = {
  // 알림 목록 조회
  getNotifications: (params?: {
    is_read?: boolean;
    skip?: number;
    limit?: number;
  }) =>
    get<Notification[]>('/api/v1/board-extra/notifications', { params }),

  // 알림 읽음 처리
  markAsRead: (notificationId: number) =>
    put<void>(`/api/v1/board-extra/notifications/${notificationId}/read`),

  // 모든 알림 읽음 처리
  markAllAsRead: () =>
    put<void>('/api/v1/board-extra/notifications/read-all'),
};

// 사용자 설정 API 함수들
export const userPreferenceApi = {
  // 사용자 설정 조회
  getPreferences: () =>
    get<UserPreference[]>('/api/v1/board-extra/user/preferences'),

  // 사용자 설정 저장/업데이트
  setPreference: (data: UserPreferenceUpdate) =>
    post<UserPreference>('/api/v1/board-extra/user/preferences', data),

  // 사용자 설정 삭제
  deletePreference: (prefKey: string) =>
    del<void>(`/api/v1/board-extra/user/preferences/${prefKey}`),
};

// 통계 API 함수들
export const statisticsApi = {
  // 인기 게시글 조회
  getPopularPosts: (limit?: number) =>
    get<PopularPost[]>(`/api/v1/boards/statistics/popular-posts?limit=${limit || 10}`),

  // 게시판별 통계
  getBoardStatistics: () =>
    get<BoardStatistics[]>('/api/v1/boards/statistics/boards'),

  // 사용자 활동 통계
  getUserActivityStats: () =>
    get<UserActivityStats[]>('/api/v1/boards/statistics/user-activity'),
};

// 사용자 북마크 및 작성글 조회 API
export const userContentApi = {
  // 사용자 북마크 목록
  getUserBookmarks: (params?: { skip?: number; limit?: number }) =>
    get<any[]>('/api/v1/board-extra/user/bookmarks', { params }),

  // 사용자 작성 게시글
  getUserPosts: (userId?: string, params?: {
    status?: string;
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = userId ? { user_id: userId, ...params } : params;
    return get<any[]>('/api/v1/board-extra/user/posts', { params: queryParams });
  },

  // 사용자 작성 댓글
  getUserComments: (userId?: string, params?: {
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = userId ? { user_id: userId, ...params } : params;
    return get<any[]>('/api/v1/board-extra/user/comments', { params: queryParams });
  },

  // 사용자 좋아요한 게시글
  getUserLikes: (userId?: string, params?: {
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = userId ? { user_id: userId, ...params } : params;
    return get<any[]>('/api/v1/board-extra/user/likes', { params: queryParams });
  },

  // 사용자 팔로우한 게시판
  getUserFollowedBoards: (userId?: string, params?: {
    skip?: number;
    limit?: number;
  }) => {
    const queryParams = userId ? { user_id: userId, ...params } : params;
    return get<any[]>('/api/v1/board-extra/user/followed-boards', { params: queryParams });
  },
};
