"""게시판 관련 엔드포인트"""
from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, UploadFile, File, Body, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, text, cast, Date
from app.database import get_db
from app.models.board import (
    BbsBoard, BbsCategory, BbsPost, BbsComment, BbsAttachment,
    BbsPostLike, BbsCommentLike, BbsBookmark, BbsReport, BbsNotification,
    BbsTag, BbsPostTag, BbsFollow, BbsPostView, PostStatus, CommentStatus,
    LikeType, ReportTargetType, BoardType, PermissionLevel, FollowType
)
from app.models.user import CommonUser
from app.dependencies import get_current_active_user, is_admin_user
from app.schemas.board import (
    BoardCreate, BoardUpdate, BoardResponse, CategoryCreate, CategoryUpdate,
    CategoryResponse, PostCreate, PostUpdate, PostResponse, PostDetailResponse,
    PostListRequest, PostListResponse, CommentCreate, CommentUpdate, CommentResponse,
    LikeRequest, LikeResponse, BookmarkResponse, ReportCreate, ReportResponse,
    TagCreate, TagUpdate, TagResponse, FollowCreate, FollowResponse,
    SearchRequest, SearchResponse, BoardStatisticsResponse, PopularPostResponse,
    UserActivityStatsResponse, UserPreferenceUpdate, UserPreferenceResponse,
    AttachmentResponse
)

router = APIRouter()


def get_client_ip(request: Request) -> str:
    """클라이언트 IP 주소 추출"""
    # X-Forwarded-For 헤더 확인 (프록시/로드밸런서 뒤에 있는 경우)
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        # 여러 IP가 있을 수 있으므로 첫 번째 IP 사용
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        # 직접 연결인 경우
        ip = request.client.host if request.client else "127.0.0.1"

    # IPv4 주소 검증 및 정리
    ip = ip.split(":")[0] if ":" in ip else ip  # IPv6에서 IPv4 부분만 추출
    return ip


def increment_post_view_count(
    post_id: int,
    user_id: Optional[str],
    ip_addr: str,
    user_agent: Optional[str],
    db: Session
) -> bool:
    """
    게시글 조회수 증가 (중복 체크 포함)
    
    Args:
        post_id: 게시글 ID
        user_id: 사용자 ID (None이면 비로그인 사용자)
        ip_addr: IP 주소
        user_agent: User-Agent 헤더
        db: 데이터베이스 세션
        
    Returns:
        조회수가 증가했으면 True, 중복이면 False
    """
    today = date.today()
    
    # 중복 체크: 로그인 사용자는 user_id로, 비로그인 사용자는 ip_addr로 체크
    # date_trunc('day', crt_dt AT TIME ZONE 'UTC')를 사용하여 날짜 부분만 비교 (인덱스와 일치)
    # UTC로 변환하여 타임존 문제 방지
    today_start = datetime.combine(today, datetime.min.time())
    
    if user_id:
        # 로그인 사용자: (post_id, user_id, DATE(crt_dt))로 중복 체크
        existing_view = db.query(BbsPostView).filter(
            BbsPostView.post_id == post_id,
            BbsPostView.user_id == user_id,
            func.date_trunc('day', func.timezone('UTC', BbsPostView.crt_dt)) == func.date_trunc('day', func.timezone('UTC', today_start))
        ).first()
    else:
        # 비로그인 사용자: (post_id, ip_addr, DATE(crt_dt))로 중복 체크
        existing_view = db.query(BbsPostView).filter(
            BbsPostView.post_id == post_id,
            BbsPostView.user_id.is_(None),
            BbsPostView.ip_addr == ip_addr,
            func.date_trunc('day', func.timezone('UTC', BbsPostView.crt_dt)) == func.date_trunc('day', func.timezone('UTC', today_start))
        ).first()
    
    # 중복이면 조회수 증가하지 않음
    if existing_view:
        return False
    
    # 조회 기록 추가
    new_view = BbsPostView(
        post_id=post_id,
        user_id=user_id,
        ip_addr=ip_addr,
        user_agent=user_agent
    )
    db.add(new_view)
    
    # 게시글 조회수 증가
    post = db.query(BbsPost).filter(BbsPost.id == post_id).first()
    if post:
        post.vw_cnt += 1
    
    db.commit()
    return True


# 게시판 관리 엔드포인트
@router.post(
    "/boards",
    response_model=BoardResponse,
    summary="게시판 생성",
    description="새로운 게시판을 생성합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def create_board(
    board: BoardCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시판 생성"""
    # 게시판명 중복 체크
    existing_board = db.query(BbsBoard).filter(
        BbsBoard.nm == board.nm
    ).first()

    if existing_board:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 게시판 이름입니다"
        )

    db_board = BbsBoard(**board.dict())
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    return db_board


@router.get(
    "/boards",
    response_model=List[BoardResponse],
    summary="게시판 목록 조회",
    description="활성화된 게시판 목록을 조회합니다."
)
async def get_boards(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    include_inactive: bool = Query(False, description="비활성 게시판도 포함할지 여부"),
    db: Session = Depends(get_db)
):
    """게시판 목록 조회"""
    query = db.query(BbsBoard).filter(BbsBoard.del_yn == False)

    # include_inactive가 False이면 활성 게시판만 필터링
    if not include_inactive:
        query = query.filter(BbsBoard.actv_yn == True)

    boards = query.order_by(BbsBoard.sort_order, BbsBoard.crt_dt.desc()).offset(skip).limit(limit).all()

    # 각 게시판의 실제 게시물 개수, 총 조회수, 팔로워 수 계산
    for board in boards:
        # 게시물 개수 계산 (삭제된 게시물 제외)
        actual_post_count = db.query(func.count(BbsPost.id)).filter(
            BbsPost.board_id == board.id,
            BbsPost.stts == PostStatus.PUBLISHED  # 삭제된 게시물 제외
        ).scalar()
        board.post_count = actual_post_count or 0

        # 총 조회수 계산 (bbs_post_views 테이블 기반, PUBLISHED 상태의 게시글만)
        total_view_count = db.query(func.count(BbsPostView.id)).join(
            BbsPost, BbsPostView.post_id == BbsPost.id
        ).filter(
            BbsPost.board_id == board.id,
            BbsPost.stts == PostStatus.PUBLISHED
        ).scalar() or 0
        board.total_view_count = int(total_view_count)

        # 팔로워 수 계산
        follower_count = db.query(func.count(BbsFollow.id)).filter(
            BbsFollow.following_id == str(board.id),
            BbsFollow.typ == FollowType.BOARD
        ).scalar() or 0
        board.follower_count = follower_count

    return boards


@router.get(
    "/boards/{board_id}",
    response_model=BoardResponse,
    summary="게시판 상세 조회",
    description="특정 게시판의 상세 정보를 조회합니다."
)
async def get_board(
    board_id: int = Path(..., description="게시판 ID"),
    db: Session = Depends(get_db)
):
    """게시판 상세 조회"""
    board = db.query(BbsBoard).filter(
        BbsBoard.id == board_id,
        BbsBoard.actv_yn == True
    ).first()

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시판을 찾을 수 없습니다"
        )

    # 실제 게시물 개수 계산 (삭제된 게시물 제외)
    actual_post_count = db.query(func.count(BbsPost.id)).filter(
        BbsPost.board_id == board.id,
        BbsPost.stts == PostStatus.PUBLISHED  # 삭제된 게시물 제외
    ).scalar()
    board.post_count = actual_post_count or 0

    # 총 조회수 계산 (bbs_post_views 테이블 기반, PUBLISHED 상태의 게시글만)
    total_view_count = db.query(func.count(BbsPostView.id)).join(
        BbsPost, BbsPostView.post_id == BbsPost.id
    ).filter(
        BbsPost.board_id == board.id,
        BbsPost.stts == PostStatus.PUBLISHED
    ).scalar() or 0
    board.total_view_count = int(total_view_count)

    # 팔로워 수 계산
    follower_count = db.query(func.count(BbsFollow.id)).filter(
        BbsFollow.following_id == str(board.id),
        BbsFollow.typ == FollowType.BOARD
    ).scalar() or 0
    board.follower_count = follower_count

    return board


@router.get(
    "/boards/{board_id}/statistics",
    summary="게시판 통계 조회",
    description="특정 게시판의 통계 정보(총 조회수 등)를 조회합니다."
)
async def get_board_statistics(
    board_id: int = Path(..., description="게시판 ID"),
    db: Session = Depends(get_db)
):
    """게시판 통계 조회"""
    # 게시판 존재 확인
    board = db.query(BbsBoard).filter(
        BbsBoard.id == board_id,
        BbsBoard.actv_yn == True
    ).first()

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시판을 찾을 수 없습니다"
        )

    # 총 조회수 계산 (bbs_post_views 테이블 기반, PUBLISHED 상태의 게시글만)
    total_view_count = db.query(func.count(BbsPostView.id)).join(
        BbsPost, BbsPostView.post_id == BbsPost.id
    ).filter(
        BbsPost.board_id == board_id,
        BbsPost.stts == PostStatus.PUBLISHED
    ).scalar() or 0

    return {
        "board_id": board_id,
        "total_view_count": int(total_view_count),
        "post_count": board.post_count or 0
    }


@router.put(
    "/boards/{board_id}",
    response_model=BoardResponse,
    summary="게시판 수정",
    description="게시판 정보를 수정합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def update_board(
    board_update: BoardUpdate,
    board_id: int = Path(..., description="게시판 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시판 수정"""
    board = db.query(BbsBoard).filter(
        BbsBoard.id == board_id,
        BbsBoard.del_yn == False
    ).first()

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시판을 찾을 수 없습니다"
        )

    # 게시판명 중복 체크
    if board_update.nm:
        existing_board = db.query(BbsBoard).filter(
            BbsBoard.nm == board_update.nm,
            BbsBoard.id != board_id
        ).first()

        if existing_board:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 존재하는 게시판 이름입니다"
            )

    for field, value in board_update.dict(exclude_unset=True).items():
        setattr(board, field, value)

    db.commit()
    db.refresh(board)
    return board


@router.delete(
    "/boards/{board_id}",
    summary="게시판 삭제",
    description="게시판을 삭제합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def delete_board(
    board_id: int = Path(..., description="게시판 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시판 삭제"""
    board = db.query(BbsBoard).filter(
        BbsBoard.id == board_id
    ).first()

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시판을 찾을 수 없습니다"
        )

    board.del_yn = True
    db.commit()

    return {"message": "게시판이 삭제되었습니다"}


# 카테고리 관리 엔드포인트
@router.post(
    "/categories",
    response_model=CategoryResponse,
    summary="카테고리 생성",
    description="새로운 카테고리를 생성합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """카테고리 생성"""
    # 게시판 존재 확인
    board = db.query(BbsBoard).filter(
        BbsBoard.id == category.board_id
    ).first()

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시판을 찾을 수 없습니다"
        )

    # 카테고리명 중복 체크
    existing_category = db.query(BbsCategory).filter(
        BbsCategory.board_id == category.board_id,
        BbsCategory.nm == category.nm,
        BbsCategory.actv_yn == True,
        BbsCategory.del_yn == False
    ).first()

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 카테고리 이름입니다"
        )

    db_category = BbsCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get(
    "/boards/{board_id}/categories",
    response_model=List[CategoryResponse],
    summary="게시판별 카테고리 목록 조회",
    description="특정 게시판의 활성화된 카테고리 목록을 조회합니다."
)
async def get_categories_by_board(
    board_id: int = Path(..., description="게시판 ID"),
    db: Session = Depends(get_db)
):
    """게시판별 카테고리 목록 조회"""
    categories = db.query(BbsCategory).filter(
        BbsCategory.board_id == board_id,
        BbsCategory.actv_yn == True,
        BbsCategory.del_yn == False
    ).order_by(BbsCategory.sort_order, BbsCategory.crt_dt.desc()).all()

    # 각 카테고리의 실제 게시물 개수 계산 (삭제된 게시물 제외)
    for category in categories:
        actual_post_count = db.query(func.count(BbsPost.id)).filter(
            BbsPost.category_id == category.id,
            BbsPost.stts == PostStatus.PUBLISHED  # 삭제된 게시물 제외
        ).scalar()
        category.post_count = actual_post_count or 0

    return categories


# 게시글 관리 엔드포인트
@router.post(
    "/posts",
    response_model=PostResponse,
    summary="게시글 생성",
    description="새로운 게시글을 생성합니다."
)
async def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 생성"""
    # 게시판 존재 및 권한 확인
    board = db.query(BbsBoard).filter(
        BbsBoard.id == post.board_id,
        BbsBoard.actv_yn == True
    ).first()

    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시판을 찾을 수 없습니다"
        )

    # 카테고리 확인 (선택적)
    if post.category_id:
        category = db.query(BbsCategory).filter(
            BbsCategory.id == post.category_id,
            BbsCategory.board_id == post.board_id,
            BbsCategory.actv_yn == True,
            BbsCategory.del_yn == False
        ).first()

        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="카테고리를 찾을 수 없습니다"
            )

    # 게시글 생성
    post_data = post.dict(exclude={'tags'})
    
    # 비밀글인 경우 비밀번호 해시 처리
    if post_data.get('scr_yn') and post_data.get('pwd'):
        from app.core.security import get_password_hash
        post_data['pwd'] = get_password_hash(post_data['pwd'])
    
    db_post = BbsPost(
        **post_data,
        user_id=current_user.user_id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # 태그 처리
    if post.tags:
        for tag_name in post.tags:
            # 태그 존재 확인 또는 생성
            tag = db.query(BbsTag).filter(BbsTag.nm == tag_name).first()
            if not tag:
                tag = BbsTag(nm=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)

            # 게시글-태그 연결
            post_tag = BbsPostTag(post_id=db_post.id, tag_id=tag.id)
            db.add(post_tag)

        db.commit()

    return db_post


@router.get(
    "/posts",
    response_model=PostListResponse,
    summary="게시글 목록 조회",
    description="게시글 목록을 페이지네이션으로 조회합니다."
)
async def get_posts(
    board_id: int = Query(..., description="게시판 ID"),
    category_id: Optional[int] = Query(None, description="카테고리 ID"),
    status: PostStatus = Query(PostStatus.PUBLISHED, description="게시글 상태"),
    search_query: Optional[str] = Query(None, description="검색 쿼리"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 목록 조회"""
    offset = (page - 1) * limit

    # 기본 쿼리 - 사용자 화면에서는 삭제된 게시물 제외
    query = db.query(
        BbsPost,
        CommonUser.nickname.label('author_nickname'),
        BbsCategory.nm.label('category_nm')
    ).join(
        CommonUser, BbsPost.user_id == CommonUser.user_id
    ).outerjoin(
        BbsCategory, BbsPost.category_id == BbsCategory.id
    ).filter(
        BbsPost.board_id == board_id,
        BbsPost.stts == status,
        BbsPost.stts != PostStatus.DELETED  # 삭제된 게시물 항상 제외
    )

    # 카테고리 필터
    if category_id:
        query = query.filter(BbsPost.category_id == category_id)

    # 검색 필터
    if search_query:
        search_filter = or_(
            BbsPost.ttl.ilike(f'%{search_query}%'),
            BbsPost.cn.ilike(f'%{search_query}%'),
            BbsPost.smmry.ilike(f'%{search_query}%')
        )
        query = query.filter(search_filter)

    # 정렬 및 페이지네이션
    query = query.order_by(
        BbsPost.ntce_yn.desc(),
        BbsPost.pbl_dt.desc()
    )

    total_count = query.count()
    posts = query.offset(offset).limit(limit).all()

    # 응답 포맷팅
    post_list = []
    for post, author_nickname, category_nm in posts:
        post_dict = PostResponse.from_orm(post).dict()
        post_dict['author_nickname'] = author_nickname
        post_dict['category_nm'] = category_nm

        # 조회수 계산 (bbs_post_views 테이블 기반)
        view_count = db.query(func.count(BbsPostView.id)).filter(
            BbsPostView.post_id == post.id
        ).scalar() or 0
        post_dict['vw_cnt'] = int(view_count)

        # 비밀글 처리: 본인 글이 아니면 제목과 요약 숨기기
        if post.scr_yn and post.user_id != current_user.user_id:
            post_dict['ttl'] = '비밀글입니다'
            post_dict['smmry'] = None
            post_dict['cn'] = ''  # 내용도 숨김

        # 태그 정보 조회
        tags = db.query(BbsTag.nm).join(
            BbsPostTag, BbsTag.id == BbsPostTag.tag_id
        ).filter(
            BbsPostTag.post_id == post.id
        ).all()
        post_dict['tags'] = [tag[0] for tag in tags]

        post_list.append(PostResponse(**post_dict))

    total_pages = (total_count + limit - 1) // limit

    return PostListResponse(
        posts=post_list,
        total_count=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


# 관리자용 게시글 목록 조회 엔드포인트 (라우팅 순서 중요: /posts/{post_id}보다 앞에 배치)
@router.get(
    "/posts/admin",
    response_model=PostListResponse,
    summary="전체 게시글 목록 조회 (관리자용)",
    description="모든 게시글 목록을 조회합니다. 관리자 권한이 필요합니다."
)
async def get_all_posts_admin(
    board_id: Optional[int] = Query(None, description="게시판 ID 필터"),
    category_id: Optional[int] = Query(None, description="카테고리 ID 필터"),
    status: Optional[PostStatus] = Query(None, description="게시글 상태 필터"),
    search_query: Optional[str] = Query(None, description="검색 쿼리"),
    author_id: Optional[str] = Query(None, description="작성자 ID 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=1000, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(is_admin_user)
):
    """전체 게시글 목록 조회 (관리자용)"""
    offset = (page - 1) * limit

    # 기본 쿼리
    query = db.query(
        BbsPost,
        CommonUser.nickname.label('author_nickname'),
        BbsCategory.nm.label('category_nm'),
        BbsBoard.nm.label('board_nm')
    ).join(
        CommonUser, BbsPost.user_id == CommonUser.user_id
    ).outerjoin(
        BbsCategory, BbsPost.category_id == BbsCategory.id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsPost.stts != PostStatus.DELETED  # 삭제된 게시물 제외
    )

    # 게시판 필터
    if board_id:
        query = query.filter(BbsPost.board_id == board_id)

    # 카테고리 필터
    if category_id:
        query = query.filter(BbsPost.category_id == category_id)

    # 상태 필터
    if status:
        query = query.filter(BbsPost.stts == status)

    # 작성자 필터
    if author_id:
        query = query.filter(BbsPost.user_id == author_id)

    # 검색 필터
    if search_query:
        search_filter = or_(
            BbsPost.ttl.ilike(f'%{search_query}%'),
            BbsPost.cn.ilike(f'%{search_query}%'),
            BbsPost.smmry.ilike(f'%{search_query}%'),
            CommonUser.nickname.ilike(f'%{search_query}%')
        )
        query = query.filter(search_filter)

    # 정렬 및 페이지네이션
    query = query.order_by(
        BbsPost.ntce_yn.desc(),
        BbsPost.pbl_dt.desc()
    )

    total_count = query.count()
    posts = query.offset(offset).limit(limit).all()

    # 응답 포맷팅
    post_list = []
    for post, author_nickname, category_nm, board_nm in posts:
        post_dict = PostResponse.from_orm(post).dict()
        post_dict['author_nickname'] = author_nickname
        post_dict['category_nm'] = category_nm
        post_dict['board_nm'] = board_nm

        # 조회수 계산 (bbs_post_views 테이블 기반)
        view_count = db.query(func.count(BbsPostView.id)).filter(
            BbsPostView.post_id == post.id
        ).scalar() or 0
        post_dict['vw_cnt'] = int(view_count)

        # 댓글수 계산
        comment_count = db.query(func.count(BbsComment.id)).filter(
            BbsComment.post_id == post.id,
            BbsComment.stts != CommentStatus.DELETED
        ).scalar() or 0
        post_dict['cmt_cnt'] = int(comment_count)

        # 태그 정보 조회
        tags = db.query(BbsTag.nm).join(
            BbsPostTag, BbsTag.id == BbsPostTag.tag_id
        ).filter(
            BbsPostTag.post_id == post.id
        ).all()
        post_dict['tags'] = [tag[0] for tag in tags]

        post_list.append(PostResponse(**post_dict))

    total_pages = (total_count + limit - 1) // limit

    return PostListResponse(
        posts=post_list,
        total_count=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get(
    "/posts/{post_id}",
    response_model=PostDetailResponse,
    summary="게시글 상세 조회",
    description="특정 게시글의 상세 정보를 조회합니다."
)
async def get_post(
    post_id: int = Path(..., description="게시글 ID"),
    access_token: Optional[str] = Query(None, description="비밀글 접근 토큰"),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 상세 조회"""
    # 게시글 조회
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 삭제된 게시물 접근 제한 (작성자 또는 관리자만 접근 가능)
    if post.stts == PostStatus.DELETED:
        if post.user_id != current_user.user_id and not is_admin_user(current_user):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="게시글을 찾을 수 없습니다"
            )

    # 비밀글 처리: 본인 글이 아니면 접근 토큰 확인 필요
    if post.scr_yn and post.user_id != current_user.user_id:
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="비밀글은 비밀번호가 필요합니다"
            )
        
        # 접근 토큰 검증
        from app.core.security import verify_secret_post_access_token
        if not verify_secret_post_access_token(access_token, post_id, current_user.user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="유효하지 않은 접근 토큰입니다"
            )

    # 조회수 증가 (삭제된 게시물은 조회수 증가하지 않음)
    if post.stts != PostStatus.DELETED:
        ip_addr = get_client_ip(request)
        user_agent = request.headers.get("user-agent")
        increment_post_view_count(
            post_id=post_id,
            user_id=current_user.user_id,
            ip_addr=ip_addr,
            user_agent=user_agent,
            db=db
        )

    # 작성자 정보
    author = db.query(CommonUser).filter(CommonUser.user_id == post.user_id).first()
    author_nickname = author.nickname if author else None

    # 카테고리 정보
    category = None
    if post.category_id:
        category = db.query(BbsCategory).filter(BbsCategory.id == post.category_id).first()
    category_nm = category.nm if category else None

    # 태그 정보
    tags = db.query(BbsTag.nm).join(
        BbsPostTag, BbsTag.id == BbsPostTag.tag_id
    ).filter(BbsPostTag.post_id == post_id).all()
    tag_names = [tag[0] for tag in tags]

    # 첨부파일 정보
    attachments = db.query(BbsAttachment).filter(
        BbsAttachment.post_id == post_id,
        BbsAttachment.del_yn == False
    ).all()

    # 좋아요 여부 확인
    post_like = db.query(BbsPostLike).filter(
        BbsPostLike.post_id == post_id,
        BbsPostLike.user_id == current_user.user_id
    ).first()
    is_liked = post_like is not None

    # 북마크 여부 확인
    bookmark = db.query(BbsBookmark).filter(
        BbsBookmark.post_id == post_id,
        BbsBookmark.user_id == current_user.user_id
    ).first()
    is_bookmarked = bookmark is not None

    # 조회수 계산 (bbs_post_views 테이블 기반)
    view_count = db.query(func.count(BbsPostView.id)).filter(
        BbsPostView.post_id == post_id
    ).scalar() or 0

    # 응답 구성
    post_dict = PostDetailResponse.from_orm(post).dict()
    post_dict.update({
        'vw_cnt': int(view_count),  # bbs_post_views 테이블 기반 조회수
        'author_nickname': author_nickname,
        'category_nm': category_nm,
        'tags': tag_names,
        'attachments': [AttachmentResponse.from_orm(att).dict() for att in attachments],
        'is_liked': is_liked,
        'is_bookmarked': is_bookmarked
    })

    return PostDetailResponse(**post_dict)


@router.post(
    "/posts/{post_id}/verify-password",
    summary="비밀글 비밀번호 검증",
    description="비밀글의 비밀번호를 검증하고 접근 토큰을 발급합니다."
)
async def verify_post_password(
    post_id: int = Path(..., description="게시글 ID"),
    password: str = Body(..., embed=True, description="비밀번호"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """비밀글 비밀번호 검증 및 접근 토큰 발급"""
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
        BbsPost.scr_yn == True
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="비밀글을 찾을 수 없습니다"
        )

    # 본인 글은 비밀번호 불필요하지만 토큰 발급
    if post.user_id == current_user.user_id:
        from app.core.security import create_secret_post_access_token
        access_token = create_secret_post_access_token(
            post_id=post_id,
            user_id=current_user.user_id
        )
        return {"verified": True, "access_token": access_token}

    # 비밀번호 검증
    from app.core.security import verify_password, create_secret_post_access_token
    import logging
    logger = logging.getLogger(__name__)
    
    if not post.pwd:
        logger.warning(f"게시글 {post_id}의 비밀번호가 설정되지 않았습니다.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비밀번호가 설정되지 않았습니다"
        )
    
    if not verify_password(password, post.pwd):
        logger.warning(f"게시글 {post_id}의 비밀번호 검증 실패 (입력된 비밀번호 길이: {len(password)})")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비밀번호가 올바르지 않습니다"
        )

    # 비밀번호 검증 성공 시 접근 토큰 발급
    access_token = create_secret_post_access_token(
        post_id=post_id,
        user_id=current_user.user_id
    )
    
    return {"verified": True, "access_token": access_token}


@router.put(
    "/posts/{post_id}",
    response_model=PostResponse,
    summary="게시글 수정",
    description="게시글을 수정합니다. 작성자 또는 관리자만 수정할 수 있습니다."
)
async def update_post(
    post_update: PostUpdate,
    post_id: int = Path(..., description="게시글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 수정"""
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 권한 확인 (작성자 또는 관리자)
    if post.user_id != current_user.user_id and not is_admin_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="게시글을 수정할 권한이 없습니다"
        )

    # 수정 전 히스토리 저장
    if any(field in post_update.dict(exclude_unset=True) for field in ['ttl', 'cn']):
        from app.models.board import BbsPostHistory, ChangeType
        history = BbsPostHistory(
            post_id=post.id,
            user_id=current_user.user_id,
            prev_ttl=post.ttl if 'ttl' in post_update.dict(exclude_unset=True) else None,
            new_ttl=post_update.ttl if post_update.ttl else None,
            prev_cn=post.cn if 'cn' in post_update.dict(exclude_unset=True) else None,
            new_cn=post_update.cn if post_update.cn else None,
            change_typ=ChangeType.UPDATE,
            change_rsn=post_update.change_rsn
        )
        db.add(history)

    # 게시글 업데이트
    update_data = post_update.dict(exclude_unset=True, exclude={'tags', 'change_rsn'})
    
    # 비밀번호가 변경되는 경우 해시 처리
    if 'pwd' in update_data and update_data['pwd']:
        from app.core.security import get_password_hash
        update_data['pwd'] = get_password_hash(update_data['pwd'])
    
    for field, value in update_data.items():
        setattr(post, field, value)

    # 태그 업데이트
    if post_update.tags is not None:
        # 기존 태그 삭제
        db.query(BbsPostTag).filter(BbsPostTag.post_id == post_id).delete()

        # 새 태그 추가
        for tag_name in post_update.tags:
            tag = db.query(BbsTag).filter(BbsTag.nm == tag_name).first()
            if not tag:
                tag = BbsTag(nm=tag_name)
                db.add(tag)
                db.commit()
                db.refresh(tag)

            post_tag = BbsPostTag(post_id=post_id, tag_id=tag.id)
            db.add(post_tag)

    db.commit()
    db.refresh(post)
    return post


@router.delete(
    "/posts/{post_id}",
    summary="게시글 삭제",
    description="게시글을 삭제합니다. 작성자 또는 관리자만 삭제할 수 있습니다."
)
async def delete_post(
    post_id: int = Path(..., description="게시글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 삭제"""
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 이미 삭제된 게시물인지 확인
    if post.stts == PostStatus.DELETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 삭제된 게시글입니다"
        )

    # 권한 확인 (작성자 또는 관리자)
    if post.user_id != current_user.user_id and not is_admin_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="게시글을 삭제할 권한이 없습니다"
        )

    # 삭제 히스토리 저장
    from app.models.board import BbsPostHistory, ChangeType
    history = BbsPostHistory(
        post_id=post.id,
        user_id=current_user.user_id,
        prev_ttl=post.ttl,
        prev_cn=post.cn,
        change_typ=ChangeType.DELETE,
        change_rsn="게시글 삭제"
    )
    db.add(history)

    # 게시글 상태를 DELETED로 변경
    post.stts = PostStatus.DELETED
    db.commit()
    db.refresh(post)

    return {"message": "게시글이 삭제되었습니다"}


# 댓글 관리 엔드포인트
@router.post(
    "/comments",
    response_model=CommentResponse,
    summary="댓글 생성",
    description="새로운 댓글을 생성합니다."
)
async def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """댓글 생성"""
    # 게시글 존재 확인
    post = db.query(BbsPost).filter(
        BbsPost.id == comment.post_id,
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 부모 댓글 확인 (대댓글인 경우)
    parent_depth = 0
    if comment.parent_id:
        parent_comment = db.query(BbsComment).filter(
            BbsComment.id == comment.parent_id,
            BbsComment.post_id == comment.post_id,
            BbsComment.stts != CommentStatus.DELETED
        ).first()

        if not parent_comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="부모 댓글을 찾을 수 없습니다"
            )

        # 부모 댓글의 depth 확인 (최대 5단계까지 허용)
        parent_depth = parent_comment.depth
        if parent_depth >= 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="답글의 깊이가 너무 깊습니다. 최대 5단계까지 가능합니다."
            )

    # 댓글 생성
    db_comment = BbsComment(
        **comment.dict(),
        user_id=current_user.user_id,
        depth=parent_depth + 1 if comment.parent_id else 0
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    # 작성자 닉네임 조회
    author = db.query(CommonUser).filter(
        CommonUser.user_id == db_comment.user_id
    ).first()

    # 댓글 데이터를 딕셔너리로 변환
    comment_dict = {
        'id': db_comment.id,
        'post_id': db_comment.post_id,
        'user_id': db_comment.user_id,
        'cn': db_comment.cn,
        'parent_id': db_comment.parent_id,
        'scr_yn': db_comment.scr_yn,
        'stts': db_comment.stts,
        'lk_cnt': db_comment.lk_cnt,
        'depth': db_comment.depth,
        'sort_order': db_comment.sort_order,
        'crt_dt': db_comment.crt_dt,
        'upd_dt': db_comment.upd_dt,
        'use_yn': True,
        'author_nickname': author.nickname if author else '익명',
        'is_liked': False,
        'children': []
    }

    return CommentResponse(**comment_dict)


@router.get(
    "/posts/{post_id}/comments",
    response_model=List[CommentResponse],
    summary="게시글별 댓글 목록 조회",
    description="특정 게시글의 댓글 목록을 조회합니다."
)
async def get_comments_by_post(
    post_id: int = Path(..., description="게시글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글별 댓글 목록 조회"""
    # 게시글 존재 확인
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 댓글 조회
    comments = db.query(
        BbsComment,
        CommonUser.nickname.label('author_nickname')
    ).join(
        CommonUser, BbsComment.user_id == CommonUser.user_id
    ).filter(
        BbsComment.post_id == post_id,
        BbsComment.stts != CommentStatus.DELETED
    ).order_by(BbsComment.depth, BbsComment.sort_order, BbsComment.crt_dt).all()

    # 응답 포맷팅
    comment_list = []
    for comment, author_nickname in comments:
        # 좋아요 여부 확인
        comment_like = db.query(BbsCommentLike).filter(
            BbsCommentLike.comment_id == comment.id,
            BbsCommentLike.user_id == current_user.user_id
        ).first()
        is_liked = comment_like is not None

        # 댓글 데이터를 딕셔너리로 변환
        comment_dict = {
            'id': comment.id,
            'post_id': comment.post_id,
            'user_id': comment.user_id,
            'cn': comment.cn,
            'parent_id': comment.parent_id,
            'scr_yn': comment.scr_yn,
            'stts': comment.stts,
            'lk_cnt': comment.lk_cnt,
            'depth': comment.depth,
            'sort_order': comment.sort_order,
            'crt_dt': comment.crt_dt,
            'upd_dt': comment.upd_dt,
            'use_yn': True,  # 기본값 설정
            'author_nickname': author_nickname,
            'is_liked': is_liked,
            'children': []
        }
        comment_list.append(CommentResponse(**comment_dict))

    return comment_list


@router.put(
    "/comments/{comment_id}",
    response_model=CommentResponse,
    summary="댓글 수정",
    description="댓글을 수정합니다."
)
async def update_comment(
    comment_id: int = Path(..., description="댓글 ID"),
    comment_update: CommentUpdate = None,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """댓글 수정"""
    # 댓글 존재 확인
    comment = db.query(BbsComment).filter(
        BbsComment.id == comment_id,
        BbsComment.stts != CommentStatus.DELETED
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )

    # 작성자 확인
    if comment.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="댓글을 수정할 권한이 없습니다"
        )

    # 댓글 수정
    if comment_update.cn is not None:
        comment.cn = comment_update.cn
    if comment_update.scr_yn is not None:
        comment.scr_yn = comment_update.scr_yn
    if comment_update.stts is not None:
        comment.stts = comment_update.stts

    db.commit()
    db.refresh(comment)

    # 작성자 닉네임 조회
    author = db.query(CommonUser).filter(
        CommonUser.user_id == comment.user_id
    ).first()

    # 댓글 데이터를 딕셔너리로 변환
    comment_dict = {
        'id': comment.id,
        'post_id': comment.post_id,
        'user_id': comment.user_id,
        'cn': comment.cn,
        'parent_id': comment.parent_id,
        'scr_yn': comment.scr_yn,
        'stts': comment.stts,
        'lk_cnt': comment.lk_cnt,
        'depth': comment.depth,
        'sort_order': comment.sort_order,
        'crt_dt': comment.crt_dt,
        'upd_dt': comment.upd_dt,
        'use_yn': True,
        'author_nickname': author.nickname if author else '익명',
        'is_liked': False,
        'children': []
    }

    return CommentResponse(**comment_dict)


@router.delete(
    "/comments/{comment_id}",
    summary="댓글 삭제",
    description="댓글을 삭제합니다."
)
async def delete_comment(
    comment_id: int = Path(..., description="댓글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """댓글 삭제"""
    # 댓글 존재 확인
    comment = db.query(BbsComment).filter(
        BbsComment.id == comment_id,
        BbsComment.stts != CommentStatus.DELETED
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )

    # 작성자 확인
    if comment.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="댓글을 삭제할 권한이 없습니다"
        )

    # 댓글 삭제 (소프트 삭제)
    comment.stts = CommentStatus.DELETED
    db.commit()

    return {"message": "댓글이 삭제되었습니다"}


# 관리자용 댓글 관리 엔드포인트
@router.get(
    "/comments/admin",
    response_model=List[CommentResponse],
    summary="전체 댓글 목록 조회 (관리자용)",
    description="모든 댓글 목록을 조회합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def get_all_comments_admin(
    board_id: Optional[int] = Query(None, description="게시판 ID 필터"),
    post_id: Optional[int] = Query(None, description="게시글 ID 필터"),
    status: Optional[CommentStatus] = Query(None, description="댓글 상태 필터"),
    search_query: Optional[str] = Query(None, description="댓글 내용 검색"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=200, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db)
):
    """전체 댓글 목록 조회 (관리자용)"""
    query = db.query(
        BbsComment,
        CommonUser.nickname.label('author_nickname'),
        BbsPost.ttl.label('post_title'),
        BbsPost.board_id.label('board_id')
    ).join(
        CommonUser, BbsComment.user_id == CommonUser.user_id
    ).join(
        BbsPost, BbsComment.post_id == BbsPost.id
    ).filter(
        BbsComment.stts != CommentStatus.DELETED
    )

    if board_id:
        query = query.filter(BbsPost.board_id == board_id)

    if post_id:
        query = query.filter(BbsComment.post_id == post_id)

    if status:
        query = query.filter(BbsComment.stts == status)

    if search_query:
        query = query.filter(BbsComment.cn.ilike(f'%{search_query}%'))

    comments = query.order_by(BbsComment.crt_dt.desc()).offset(skip).limit(limit).all()

    comment_list = []
    for comment, author_nickname, post_title, board_id_val in comments:
        comment_dict = {
            'id': comment.id,
            'post_id': comment.post_id,
            'user_id': comment.user_id,
            'cn': comment.cn,
            'parent_id': comment.parent_id,
            'scr_yn': comment.scr_yn,
            'stts': comment.stts,
            'lk_cnt': comment.lk_cnt,
            'depth': comment.depth,
            'sort_order': comment.sort_order,
            'crt_dt': comment.crt_dt,
            'upd_dt': comment.upd_dt,
            'use_yn': True,
            'author_nickname': author_nickname or '익명',
            'is_liked': False,
            'children': []
        }
        comment_list.append(CommentResponse(**comment_dict))

    return comment_list


@router.put(
    "/comments/{comment_id}/hide",
    response_model=CommentResponse,
    summary="댓글 숨김 (관리자용)",
    description="댓글을 숨깁니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def hide_comment_admin(
    comment_id: int = Path(..., description="댓글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """댓글 숨김 (관리자용)"""
    from datetime import datetime
    from app.models.board import BbsAdminLog, AdminActionType
    
    comment = db.query(BbsComment).filter(
        BbsComment.id == comment_id,
        BbsComment.stts != CommentStatus.DELETED
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )

    old_status = comment.stts.value if hasattr(comment.stts, 'value') else str(comment.stts)
    comment.stts = CommentStatus.HIDDEN

    # 관리자 로그 기록
    admin_log = BbsAdminLog(
        admin_id=current_user.user_id,
        act_typ=AdminActionType.COMMENT_HIDE,
        act_dsc=f"댓글 #{comment_id} 숨김",
        target_typ="COMMENT",
        target_id=comment_id,
        old_val={"status": old_status},
        new_val={"status": "HIDDEN"}
    )
    db.add(admin_log)
    db.commit()
    db.refresh(comment)

    # 작성자 닉네임 조회
    author = db.query(CommonUser).filter(
        CommonUser.user_id == comment.user_id
    ).first()

    comment_dict = {
        'id': comment.id,
        'post_id': comment.post_id,
        'user_id': comment.user_id,
        'cn': comment.cn,
        'parent_id': comment.parent_id,
        'scr_yn': comment.scr_yn,
        'stts': comment.stts,
        'lk_cnt': comment.lk_cnt,
        'depth': comment.depth,
        'sort_order': comment.sort_order,
        'crt_dt': comment.crt_dt,
        'upd_dt': comment.upd_dt,
        'use_yn': True,
        'author_nickname': author.nickname if author else '익명',
        'is_liked': False,
        'children': []
    }

    return CommentResponse(**comment_dict)


@router.put(
    "/comments/{comment_id}/show",
    response_model=CommentResponse,
    summary="댓글 표시 (관리자용)",
    description="숨겨진 댓글을 다시 표시합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def show_comment_admin(
    comment_id: int = Path(..., description="댓글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """댓글 표시 (관리자용)"""
    from datetime import datetime
    from app.models.board import BbsAdminLog, AdminActionType
    
    comment = db.query(BbsComment).filter(
        BbsComment.id == comment_id,
        BbsComment.stts != CommentStatus.DELETED
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )

    old_status = comment.stts.value if hasattr(comment.stts, 'value') else str(comment.stts)
    comment.stts = CommentStatus.PUBLISHED

    # 관리자 로그 기록
    admin_log = BbsAdminLog(
        admin_id=current_user.user_id,
        act_typ=AdminActionType.COMMENT_SHOW,
        act_dsc=f"댓글 #{comment_id} 표시",
        target_typ="COMMENT",
        target_id=comment_id,
        old_val={"status": old_status},
        new_val={"status": "PUBLISHED"}
    )
    db.add(admin_log)
    db.commit()
    db.refresh(comment)

    # 작성자 닉네임 조회
    author = db.query(CommonUser).filter(
        CommonUser.user_id == comment.user_id
    ).first()

    comment_dict = {
        'id': comment.id,
        'post_id': comment.post_id,
        'user_id': comment.user_id,
        'cn': comment.cn,
        'parent_id': comment.parent_id,
        'scr_yn': comment.scr_yn,
        'stts': comment.stts,
        'lk_cnt': comment.lk_cnt,
        'depth': comment.depth,
        'sort_order': comment.sort_order,
        'crt_dt': comment.crt_dt,
        'upd_dt': comment.upd_dt,
        'use_yn': True,
        'author_nickname': author.nickname if author else '익명',
        'is_liked': False,
        'children': []
    }

    return CommentResponse(**comment_dict)


@router.delete(
    "/comments/{comment_id}/admin",
    summary="댓글 삭제 (관리자용)",
    description="댓글을 삭제합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def delete_comment_admin(
    comment_id: int = Path(..., description="댓글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """댓글 삭제 (관리자용)"""
    from datetime import datetime
    from app.models.board import BbsAdminLog, AdminActionType
    
    comment = db.query(BbsComment).filter(
        BbsComment.id == comment_id,
        BbsComment.stts != CommentStatus.DELETED
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )

    old_status = comment.stts.value if hasattr(comment.stts, 'value') else str(comment.stts)
    comment.stts = CommentStatus.DELETED

    # 관리자 로그 기록
    admin_log = BbsAdminLog(
        admin_id=current_user.user_id,
        act_typ=AdminActionType.COMMENT_HIDE,  # 삭제는 숨김으로 처리
        act_dsc=f"댓글 #{comment_id} 삭제",
        target_typ="COMMENT",
        target_id=comment_id,
        old_val={"status": old_status},
        new_val={"status": "DELETED"}
    )
    db.add(admin_log)
    db.commit()

    return {"message": "댓글이 삭제되었습니다"}


@router.post(
    "/comments/{comment_id}/like",
    summary="댓글 좋아요 토글",
    description="댓글에 좋아요를 추가하거나 제거합니다."
)
async def toggle_comment_like(
    comment_id: int = Path(..., description="댓글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """댓글 좋아요 토글"""
    # 댓글 존재 확인
    comment = db.query(BbsComment).filter(
        BbsComment.id == comment_id,
        BbsComment.stts != CommentStatus.DELETED
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )

    # 기존 좋아요 확인
    existing_like = db.query(BbsCommentLike).filter(
        BbsCommentLike.comment_id == comment_id,
        BbsCommentLike.user_id == current_user.user_id
    ).first()

    if existing_like:
        # 좋아요 제거
        db.delete(existing_like)
        liked = False
    else:
        # 좋아요 추가
        new_like = BbsCommentLike(
            comment_id=comment_id,
            user_id=current_user.user_id,
            typ=LikeType.LIKE
        )
        db.add(new_like)
        liked = True

    db.commit()

    # 좋아요 수 조회
    like_count = db.query(func.count(BbsCommentLike.id)).filter(
        BbsCommentLike.comment_id == comment_id
    ).scalar()

    return {
        "liked": liked,
        "like_count": like_count
    }


# 좋아요 엔드포인트
@router.post(
    "/posts/{post_id}/like",
    summary="게시글 좋아요 토글",
    description="게시글에 좋아요를 추가하거나 제거합니다."
)
async def toggle_post_like(
    post_id: int = Path(..., description="게시글 ID"),
    like_request: LikeRequest = None,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 좋아요 토글"""
    # 기본값 설정
    if like_request is None:
        like_request = LikeRequest()

    # 게시글 존재 확인
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 기존 좋아요 확인
    existing_like = db.query(BbsPostLike).filter(
        BbsPostLike.post_id == post_id,
        BbsPostLike.user_id == current_user.user_id
    ).first()

    # 트리거가 자동으로 lk_cnt를 업데이트하므로 단순화된 처리
    try:
        if existing_like:
            # 좋아요 취소 - 트리거가 자동으로 lk_cnt 감소
            db.delete(existing_like)
            db.commit()
            
            # 트리거가 업데이트한 최신 값 조회
            db.refresh(post)
            
            return {
                "liked": False,
                "like_count": post.lk_cnt,
                "like": LikeResponse(
                    id=existing_like.id,
                    user_id=existing_like.user_id,
                    typ=existing_like.typ,
                    crt_dt=existing_like.crt_dt
                )
            }
        else:
            # 좋아요 추가 - 트리거가 자동으로 lk_cnt 증가
            like = BbsPostLike(
                post_id=post_id,
                user_id=current_user.user_id,
                typ=like_request.typ
            )
            db.add(like)
            db.commit()
            db.refresh(like)
            db.refresh(post)  # 트리거가 업데이트한 최신 값 조회
            
            return {
                "liked": True,
                "like_count": post.lk_cnt,
                "like": LikeResponse(
                    id=like.id,
                    user_id=like.user_id,
                    typ=like.typ,
                    crt_dt=like.crt_dt
                )
            }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"좋아요 처리 실패: {str(e)}"
        )


# 북마크 엔드포인트
@router.post(
    "/posts/{post_id}/bookmark",
    summary="게시글 북마크 토글",
    description="게시글을 북마크에 추가하거나 제거합니다."
)
async def toggle_bookmark(
    post_id: int = Path(..., description="게시글 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 북마크 토글"""
    # 게시글 존재 확인
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 기존 북마크 확인
    existing_bookmark = db.query(BbsBookmark).filter(
        BbsBookmark.post_id == post_id,
        BbsBookmark.user_id == current_user.user_id
    ).first()

    if existing_bookmark:
        # 북마크 취소
        db.delete(existing_bookmark)
        db.commit()
        return {"message": "북마크가 취소되었습니다"}
    else:
        # 북마크 추가
        bookmark = BbsBookmark(
            post_id=post_id,
            user_id=current_user.user_id
        )
        db.add(bookmark)
        db.commit()
        db.refresh(bookmark)
        return bookmark


# 검색 엔드포인트
@router.get(
    "/search",
    response_model=SearchResponse,
    summary="게시글 검색",
    description="게시글을 제목, 내용, 작성자 등으로 검색합니다."
)
async def search_posts(
    query: str = Query(..., description="검색 쿼리"),
    board_id: Optional[int] = Query(None, description="게시판 ID"),
    category_id: Optional[int] = Query(None, description="카테고리 ID"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db)
):
    """게시글 검색"""
    offset = (page - 1) * limit

    # 검색 쿼리 구성
    search_query = db.query(
        BbsPost,
        CommonUser.nickname.label('author_nickname'),
        BbsBoard.nm.label('board_nm')
    ).join(
        CommonUser, BbsPost.user_id == CommonUser.user_id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsPost.stts == PostStatus.PUBLISHED,
        BbsPost.stts != PostStatus.DELETED,  # 삭제된 게시물 제외
        or_(
            BbsPost.ttl.ilike(f'%{query}%'),
            BbsPost.cn.ilike(f'%{query}%'),
            BbsPost.smmry.ilike(f'%{query}%'),
            CommonUser.nickname.ilike(f'%{query}%')
        )
    )

    # 게시판 필터
    if board_id:
        search_query = search_query.filter(BbsPost.board_id == board_id)

    # 카테고리 필터
    if category_id:
        search_query = search_query.filter(BbsPost.category_id == category_id)

    # 정렬 및 페이지네이션
    search_query = search_query.order_by(BbsPost.pbl_dt.desc())

    total_count = search_query.count()
    results = search_query.offset(offset).limit(limit).all()

    # 응답 포맷팅
    post_list = []
    for post, author_nickname, board_nm in results:
        post_dict = PostResponse.from_orm(post).dict()
        post_dict['author_nickname'] = author_nickname
        
        # 조회수 계산 (bbs_post_views 테이블 기반)
        view_count = db.query(func.count(BbsPostView.id)).filter(
            BbsPostView.post_id == post.id
        ).scalar() or 0
        post_dict['vw_cnt'] = int(view_count)
        
        post_list.append(PostResponse(**post_dict))

    total_pages = (total_count + limit - 1) // limit

    return SearchResponse(
        posts=post_list,
        total_count=total_count,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


# 통계 엔드포인트
@router.get(
    "/statistics/popular-posts",
    response_model=List[PopularPostResponse],
    summary="인기 게시글 조회",
    description="조회수, 좋아요, 댓글 수를 기준으로 인기 게시글을 조회합니다."
)
async def get_popular_posts(
    limit: int = Query(10, ge=1, le=50, description="반환할 게시글 수"),
    db: Session = Depends(get_db)
):
    """인기 게시글 조회"""
    # 게시글 조회 (인기도 점수는 나중에 계산)
    posts = db.query(
        BbsPost,
        CommonUser.nickname.label('author_nickname'),
        BbsBoard.nm.label('board_nm')
    ).join(
        CommonUser, BbsPost.user_id == CommonUser.user_id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsPost.stts == PostStatus.PUBLISHED,
        BbsPost.stts != PostStatus.DELETED  # 삭제된 게시물 제외
    ).limit(limit * 2).all()  # 더 많이 가져온 후 정렬

    result = []
    for post, author_nickname, board_nm in posts:
        # 조회수 계산 (bbs_post_views 테이블 기반)
        view_count = db.query(func.count(BbsPostView.id)).filter(
            BbsPostView.post_id == post.id
        ).scalar() or 0
        
        # 인기도 점수 계산 (조회수 + 좋아요*10 + 댓글*5)
        popularity_score = int(view_count) + post.lk_cnt * 10 + post.cmt_cnt * 5
        
        post_dict = PopularPostResponse(
            id=post.id,
            ttl=post.ttl,
            vw_cnt=int(view_count),  # bbs_post_views 테이블 기반 조회수
            lk_cnt=post.lk_cnt,
            cmt_cnt=post.cmt_cnt,
            author_nickname=author_nickname,
            board_nm=board_nm,
            crt_dt=post.crt_dt,
            popularity_score=popularity_score
        )
        result.append(post_dict)

    # 인기도 점수로 정렬하고 상위 limit개만 반환
    result.sort(key=lambda x: x.popularity_score, reverse=True)
    return result[:limit]


@router.get(
    "/statistics/boards",
    response_model=List[BoardStatisticsResponse],
    summary="게시판별 통계 조회",
    description="모든 게시판의 통계 정보를 조회합니다."
)
async def get_board_statistics(
    db: Session = Depends(get_db)
):
    """게시판별 통계 조회"""
    from datetime import datetime, timedelta
    
    # 지난 주 시작일
    last_week_start = datetime.now() - timedelta(days=7)
    today = datetime.now().date()
    
    boards = db.query(BbsBoard).filter(
        BbsBoard.del_yn == False,
        BbsBoard.actv_yn == True
    ).all()
    
    result = []
    for board in boards:
        # 전체 게시글 수
        total_posts = db.query(func.count(BbsPost.id)).filter(
            BbsPost.board_id == board.id,
            BbsPost.stts != PostStatus.DELETED
        ).scalar() or 0
        
        # 공개 게시글 수
        published_posts = db.query(func.count(BbsPost.id)).filter(
            BbsPost.board_id == board.id,
            BbsPost.stts == PostStatus.PUBLISHED,
            BbsPost.stts != PostStatus.DELETED
        ).scalar() or 0
        
        # 지난 주 게시글 수
        posts_last_week = db.query(func.count(BbsPost.id)).filter(
            BbsPost.board_id == board.id,
            BbsPost.crt_dt >= last_week_start,
            BbsPost.stts != PostStatus.DELETED
        ).scalar() or 0
        
        # 오늘 게시글 수
        posts_today = db.query(func.count(BbsPost.id)).filter(
            BbsPost.board_id == board.id,
            func.date(BbsPost.crt_dt) == today,
            BbsPost.stts != PostStatus.DELETED
        ).scalar() or 0
        
        # 최근 게시글 날짜
        last_post = db.query(BbsPost.crt_dt).filter(
            BbsPost.board_id == board.id,
            BbsPost.stts != PostStatus.DELETED
        ).order_by(BbsPost.crt_dt.desc()).first()
        
        last_post_date = last_post[0] if last_post else None
        
        result.append(BoardStatisticsResponse(
            id=board.id,
            nm=board.nm,
            total_posts=int(total_posts),
            published_posts=int(published_posts),
            posts_last_week=int(posts_last_week),
            posts_today=int(posts_today),
            last_post_date=last_post_date
        ))
    
    return result


@router.get(
    "/statistics/user-activity",
    response_model=List[UserActivityStatsResponse],
    summary="사용자 활동 통계 조회",
    description="사용자별 활동 통계를 조회합니다."
)
async def get_user_activity_stats(
    limit: int = Query(10, ge=1, le=100, description="반환할 사용자 수"),
    db: Session = Depends(get_db)
):
    """사용자 활동 통계 조회"""
    from app.models.user import CommonUser
    
    users = db.query(CommonUser).filter(
        CommonUser.del_yn == False,
        CommonUser.actv_yn == True
    ).limit(limit * 2).all()  # 더 많이 가져온 후 정렬
    
    result = []
    for user in users:
        # 게시글 수
        total_posts = db.query(func.count(BbsPost.id)).filter(
            BbsPost.user_id == user.user_id,
            BbsPost.stts != PostStatus.DELETED
        ).scalar() or 0
        
        # 댓글 수
        total_comments = db.query(func.count(BbsComment.id)).filter(
            BbsComment.user_id == user.user_id,
            BbsComment.stts != CommentStatus.DELETED
        ).scalar() or 0
        
        # 게시글 좋아요 수 (받은 좋아요)
        total_post_likes = db.query(func.count(BbsPostLike.id)).join(
            BbsPost, BbsPostLike.post_id == BbsPost.id
        ).filter(
            BbsPost.user_id == user.user_id
        ).scalar() or 0
        
        # 댓글 좋아요 수 (받은 좋아요)
        total_comment_likes = db.query(func.count(BbsCommentLike.id)).join(
            BbsComment, BbsCommentLike.comment_id == BbsComment.id
        ).filter(
            BbsComment.user_id == user.user_id
        ).scalar() or 0
        
        # 북마크 수
        total_bookmarks = db.query(func.count(BbsBookmark.id)).filter(
            BbsBookmark.user_id == user.user_id
        ).scalar() or 0
        
        # 최근 활동 날짜 (게시글 또는 댓글 중 최신)
        last_post = db.query(BbsPost.crt_dt).filter(
            BbsPost.user_id == user.user_id,
            BbsPost.stts != PostStatus.DELETED
        ).order_by(BbsPost.crt_dt.desc()).first()
        
        last_comment = db.query(BbsComment.crt_dt).filter(
            BbsComment.user_id == user.user_id,
            BbsComment.stts != CommentStatus.DELETED
        ).order_by(BbsComment.crt_dt.desc()).first()
        
        last_activity_date = None
        if last_post and last_comment:
            last_activity_date = max(last_post[0], last_comment[0])
        elif last_post:
            last_activity_date = last_post[0]
        elif last_comment:
            last_activity_date = last_comment[0]
        
        # 활동 점수 계산 (게시글*10 + 댓글*5 + 좋아요*2)
        activity_score = total_posts * 10 + total_comments * 5 + (total_post_likes + total_comment_likes) * 2
        
        result.append(UserActivityStatsResponse(
            user_id=user.user_id,
            nickname=user.nickname,
            total_posts=int(total_posts),
            total_comments=int(total_comments),
            total_post_likes=int(total_post_likes),
            total_comment_likes=int(total_comment_likes),
            total_bookmarks=int(total_bookmarks),
            last_activity_date=last_activity_date
        ))
    
    # 활동 점수로 정렬하고 상위 limit개만 반환
    result.sort(key=lambda x: x.total_posts * 10 + x.total_comments * 5 + (x.total_post_likes + x.total_comment_likes) * 2, reverse=True)
    return result[:limit]


# 임시 엔드포인트: DB 함수 및 트리거 업데이트
@router.post("/admin/update-db-functions", summary="DB 함수 및 트리거 업데이트")
async def update_db_functions(db: Session = Depends(get_db)):
    """DB 함수와 트리거를 업데이트합니다 (임시 엔드포인트)"""
    try:
        # 트리거 삭제
        db.execute(text('DROP TRIGGER IF EXISTS trigger_update_post_like_statistics ON bbs_post_likes;'))
        db.execute(text('DROP TRIGGER IF EXISTS trigger_update_comment_like_statistics ON bbs_comment_likes;'))

        # 함수 삭제 (더 이상 필요 없음)
        db.execute(text('DROP FUNCTION IF EXISTS update_like_statistics() CASCADE;'))

        db.commit()
        return {"message": "트리거와 함수가 성공적으로 제거되었습니다."}

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DB 업데이트 실패: {str(e)}"
        )
