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
  pwd?: string;
  vw_cnt: number;
  lk_cnt: number;
  cmt_cnt: number;
  att_cnt: number;
  lst_cmt_dt?: string;
  pbl_dt: string;
  crt_dt: string;
  upd_dt?: string;
}

export interface PostCreate {
  board_id: number;
  category_id?: number;
  ttl: string;
  cn: string;
  smmry?: string;
  ntce_yn?: boolean;
  scr_yn?: boolean;
  pwd?: string;
}

export interface PostUpdate {
  ttl?: string;
  cn?: string;
  smmry?: string;
  category_id?: number;
  ntce_yn?: boolean;
  scr_yn?: boolean;
  pwd?: string;
}

export interface PostFilters {
  board_id?: number;
  category_id?: number;
  status?: string;
  search?: string;
  sort?: 'latest' | 'views' | 'likes';
}

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
}

export interface CommentCreate {
  post_id: number;
  parent_id?: number;
  cn: string;
  scr_yn?: boolean;
}

export interface CommentUpdate {
  cn?: string;
  scr_yn?: boolean;
}
