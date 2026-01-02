/**
 * 게시글 및 콘텐츠 관리 API
 */
import { get, post, put, del } from './client';

// 게시글 관련 타입들
export interface Post {
  id: number;
  board_id: number;
  category_id?: number;
  user_id: string;
  ttl: string;
  cn: string;
  smmry?: string;
  stts: 'PUBLISHED' | 'DRAFT' | 'DELETED' | 'HIDDEN' | 'SECRET';
  ntce_yn: boolean;
  scr_yn: boolean;
  vw_cnt: number;
  lk_cnt: number;
  cmt_cnt: number;
  att_cnt: number;
  pbl_dt: string;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
  author_nickname?: string;
  category_nm?: string;
  tags?: string[];
}

export interface PostCreate {
  board_id: number;
  category_id?: number;
  ttl: string;
  cn: string;
  smmry?: string;
  ntce_yn?: boolean;
  scr_yn?: boolean;
  tags?: string[];
}

export interface PostUpdate {
  ttl?: string;
  cn?: string;
  smmry?: string;
  category_id?: number;
  ntce_yn?: boolean;
  scr_yn?: boolean;
  stts?: 'PUBLISHED' | 'DRAFT' | 'DELETED' | 'HIDDEN' | 'SECRET';
  tags?: string[];
  change_rsn?: string;
}

export interface PostListResponse {
  posts: Post[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PostDetail extends Post {
  attachments?: Attachment[];
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

// 댓글 관련 타입들
export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  parent_id?: number;
  cn: string;
  stts: 'PUBLISHED' | 'DELETED' | 'HIDDEN' | 'SECRET';
  scr_yn: boolean;
  lk_cnt: number;
  depth: number;
  sort_order: number;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
  author_nickname?: string;
  is_liked?: boolean;
  children?: Comment[];
}

export interface CommentCreate {
  post_id: number;
  cn: string;
  parent_id?: number;
  scr_yn?: boolean;
}

export interface CommentUpdate {
  cn?: string;
  scr_yn?: boolean;
  stts?: 'PUBLISHED' | 'DELETED' | 'HIDDEN' | 'SECRET';
}

// 첨부파일 관련 타입들
export interface Attachment {
  id: number;
  post_id: number;
  user_id: string;
  orgnl_file_nm: string;
  file_url: string;
  file_sz: number;
  mime_typ: string;
  file_typ: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'OTHER';
  dwld_cnt: number;
  crt_dt: string;
  use_yn: boolean;
  thumbnails?: Thumbnail[];
}

export interface Thumbnail {
  id: number;
  attachment_id: number;
  thumbnail_path: string;
  thumbnail_url: string;
  thumbnail_sz: number;
  width?: number;
  height?: number;
  crt_dt: string;
}

// 좋아요 관련 타입들
export interface LikeRequest {
  typ?: 'LIKE' | 'DISLIKE';
}

export interface LikeResponse {
  id: number;
  user_id: string;
  typ: 'LIKE' | 'DISLIKE';
  crt_dt: string;
}

// 북마크 관련 타입들
export interface Bookmark {
  id: number;
  post_id: number;
  user_id: string;
  crt_dt: string;
}

// 태그 관련 타입들
export interface Tag {
  id: number;
  nm: string;
  dsc?: string;
  color?: string;
  usage_cnt: number;
  crt_dt: string;
}

export interface TagCreate {
  nm: string;
  dsc?: string;
  color?: string;
}

export interface TagUpdate {
  dsc?: string;
  color?: string;
}

// 검색 관련 타입들
export interface SearchRequest {
  query: string;
  board_id?: number;
  category_id?: number;
  search_type?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  posts: Post[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// 게시글 API 함수들
export const postApi = {
  // 게시글 생성
  createPost: (data: PostCreate) =>
    post<Post>('/api/v1/boards/posts', data),

  // 게시글 목록 조회
  getPosts: (params: {
    board_id: number;
    category_id?: number;
    status?: 'PUBLISHED' | 'DRAFT' | 'DELETED' | 'HIDDEN' | 'SECRET';
    search_query?: string;
    page?: number;
    limit?: number;
  }) =>
    get<PostListResponse>('/api/v1/boards/posts', { params }),

  // 게시글 상세 조회
  getPost: (postId: number) =>
    get<PostDetail>(`/api/v1/boards/posts/${postId}`),

  // 게시글 수정
  updatePost: (postId: number, data: PostUpdate) =>
    put<Post>(`/api/v1/boards/posts/${postId}`, data),

  // 게시글 삭제
  deletePost: (postId: number) =>
    del<void>(`/api/v1/boards/posts/${postId}`),

  // 게시글 좋아요 토글
  toggleLike: (postId: number, data?: LikeRequest) =>
    post<LikeResponse>(`/api/v1/boards/posts/${postId}/like`, data),

  // 게시글 북마크 토글
  toggleBookmark: (postId: number) =>
    post<Bookmark>(`/api/v1/boards/posts/${postId}/bookmark`),

  // 게시글 태그 조회
  getPostTags: (postId: number) =>
    get<Tag[]>(`/api/v1/boards/posts/${postId}/tags`),
};

// 댓글 API 함수들
export const commentApi = {
  // 댓글 생성
  createComment: (data: CommentCreate) =>
    post<Comment>('/api/v1/boards/comments', data),

  // 게시글별 댓글 목록 조회
  getCommentsByPost: (postId: number) =>
    get<Comment[]>(`/api/v1/boards/posts/${postId}/comments`),

  // 댓글 수정
  updateComment: (commentId: number, data: CommentUpdate) =>
    put<Comment>(`/api/v1/boards/comments/${commentId}`, data),

  // 댓글 삭제
  deleteComment: (commentId: number) =>
    del<void>(`/api/v1/boards/comments/${commentId}`),

  // 댓글 좋아요 토글
  toggleLike: (commentId: number, data?: LikeRequest) =>
    post<LikeResponse>(`/api/v1/boards/comments/${commentId}/like`, data),
};

// 태그 API 함수들
export const tagApi = {
  // 태그 목록 조회
  getTags: (params?: { search?: string; limit?: number }) =>
    get<Tag[]>('/api/v1/board-extra/tags', { params }),

  // 인기 태그 조회
  getPopularTags: (limit?: number) =>
    get<Tag[]>(`/api/v1/board-extra/tags/popular?limit=${limit || 20}`),
};

// 검색 API 함수들
export const searchApi = {
  // 게시글 검색
  searchPosts: (params: SearchRequest) =>
    get<SearchResponse>('/api/v1/boards/search', { params }),
};
