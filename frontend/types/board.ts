/**
 * 게시판 관련 타입 정의
 */

// 게시판 타입들
export interface Board {
  id: number;
  nm: string;
  dsc?: string;
  typ: BoardType;
  actv_yn: boolean;
  read_permission: PermissionLevel;
  write_permission: PermissionLevel;
  comment_permission: PermissionLevel;
  allow_attachment: boolean;
  allow_image: boolean;
  max_file_size: number;
  sort_order: number;
  post_count: number;
  total_view_count?: number;
  follower_count?: number;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

export type BoardType = 'GENERAL' | 'NOTICE' | 'QNA' | 'IMAGE' | 'VIDEO';
export type PermissionLevel = 'ALL' | 'USER' | 'ADMIN';

export interface BoardCreate {
  nm: string;
  dsc?: string;
  typ?: BoardType;
  read_permission?: PermissionLevel;
  write_permission?: PermissionLevel;
  comment_permission?: PermissionLevel;
  allow_attachment?: boolean;
  allow_image?: boolean;
  max_file_size?: number;
  sort_order?: number;
}

export interface BoardUpdate {
  nm?: string;
  dsc?: string;
  typ?: BoardType;
  actv_yn?: boolean;
  read_permission?: PermissionLevel;
  write_permission?: PermissionLevel;
  comment_permission?: PermissionLevel;
  allow_attachment?: boolean;
  allow_image?: boolean;
  max_file_size?: number;
  sort_order?: number;
}

// 카테고리 타입들
export interface Category {
  id: number;
  board_id: number;
  nm: string;
  dsc?: string;
  color?: string;
  icon?: string;
  sort_order: number;
  actv_yn: boolean;
  post_count: number;
  crt_dt: string;
  upd_dt?: string;
  use_yn: boolean;
}

export interface CategoryCreate {
  board_id: number;
  nm: string;
  dsc?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface CategoryUpdate {
  nm?: string;
  dsc?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
  actv_yn?: boolean;
}

// 게시글 타입들
export interface Post {
  id: number;
  board_id: number;
  category_id?: number;
  user_id: string;
  ttl: string;
  cn: string;
  smmry?: string;
  stts: PostStatus;
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

export type PostStatus = 'PUBLISHED' | 'DRAFT' | 'DELETED' | 'HIDDEN' | 'SECRET';

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
  stts?: PostStatus;
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

// 댓글 타입들
export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  parent_id?: number;
  cn: string;
  stts: CommentStatus;
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

export type CommentStatus = 'PUBLISHED' | 'DELETED' | 'HIDDEN' | 'SECRET';

export interface CommentCreate {
  post_id: number;
  cn: string;
  parent_id?: number;
  scr_yn?: boolean;
}

export interface CommentUpdate {
  cn?: string;
  scr_yn?: boolean;
  stts?: CommentStatus;
}

// 첨부파일 타입들
export interface Attachment {
  id: number;
  post_id: number;
  user_id: string;
  orgnl_file_nm: string;
  file_url: string;
  file_sz: number;
  mime_typ: string;
  file_typ: AttachmentFileType;
  dwld_cnt: number;
  crt_dt: string;
  use_yn: boolean;
  thumbnails?: Thumbnail[];
}

export type AttachmentFileType = 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'OTHER';

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

// 상호작용 타입들
export interface LikeRequest {
  typ?: 'LIKE' | 'DISLIKE';
}

export interface LikeResponse {
  id: number;
  user_id: string;
  typ: 'LIKE' | 'DISLIKE';
  crt_dt: string;
}

export interface Bookmark {
  id: number;
  post_id: number;
  user_id: string;
  crt_dt: string;
}

// 신고 타입들
export interface Report {
  id: number;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: number;
  rsn: ReportReason;
  dsc?: string;
  stts: ReportStatus;
  processed_by?: string;
  prcs_dt?: string;
  crt_dt: string;
}

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';
export type ReportReason = 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

export interface ReportCreate {
  target_type: ReportTargetType;
  target_id: number;
  rsn: ReportReason;
  dsc?: string;
}

export interface ReportUpdate {
  stts?: ReportStatus;
  processed_by?: string;
}

// 팔로우 타입들
export interface Follow {
  id: number;
  follower_id: string;
  following_id: string;
  typ: FollowType;
  crt_dt: string;
}

export type FollowType = 'USER' | 'BOARD';

export interface FollowCreate {
  following_id: string;
  typ: FollowType;
}

// 알림 타입들
export interface Notification {
  id: number;
  user_id: string;
  typ: NotificationType;
  ttl: string;
  msg?: string;
  is_read: boolean;
  related_post_id?: number;
  related_comment_id?: number;
  related_user_id?: string;
  noti_metadata?: Record<string, any>;
  crt_dt: string;
}

export type NotificationType = 'NEW_COMMENT' | 'NEW_LIKE' | 'NEW_FOLLOW' | 'POST_MENTION' | 'COMMENT_MENTION' | 'ADMIN_NOTICE';

// 태그 타입들
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

// 검색 타입들
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

// 통계 타입들
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

// 사용자 설정 타입들
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

// 관리자 대시보드 타입들
export interface DashboardStats {
  total_posts: number;
  total_users: number;
  total_comments: number;
  pending_reports: number;
  posts_today: number;
  users_today: number;
  comments_today: number;
}

export interface ActivityChartData {
  date: string;
  posts: number;
  comments: number;
  users: number;
}

export interface BoardActivityData {
  board_id: number;
  board_name: string;
  posts: number;
  comments: number;
  users: number;
}

export interface RecentActivity {
  id: number;
  type: 'POST' | 'COMMENT' | 'REPORT' | 'USER';
  title: string;
  author?: string;
  created_at: string;
  status?: string;
}

// 관리자 필터 타입들
export interface ContentFilters {
  board_id?: number;
  category_id?: number;
  status?: PostStatus;
  author_id?: string;
  date_from?: string;
  date_to?: string;
  has_attachments?: boolean;
  search_query?: string;
}

export interface UserFilters {
  role_id?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  date_from?: string;
  date_to?: string;
  search_query?: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  target_type?: ReportTargetType;
  reason?: ReportReason;
  date_from?: string;
  date_to?: string;
  processed?: boolean;
}

// 일괄 작업 타입들
export interface BulkActionRequest {
  ids: number[];
  action: 'HIDE' | 'SHOW' | 'DELETE' | 'RESTORE' | 'MOVE';
  target_board_id?: number;
  target_category_id?: number;
  reason?: string;
}

export interface BulkActionResponse {
  success_count: number;
  fail_count: number;
  errors?: string[];
}
