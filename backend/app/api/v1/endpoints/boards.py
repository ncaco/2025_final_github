"""게시판 관련 엔드포인트"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, text
from app.database import get_db
from app.models.board import (
    BbsBoard, BbsCategory, BbsPost, BbsComment, BbsAttachment,
    BbsPostLike, BbsCommentLike, BbsBookmark, BbsReport, BbsNotification,
    BbsTag, BbsPostTag, BbsFollow, PostStatus, CommentStatus,
    LikeType, ReportTargetType, BoardType, PermissionLevel
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

    # 각 게시판의 실제 게시물 개수 계산 (삭제된 게시물 제외)
    for board in boards:
        actual_post_count = db.query(func.count(BbsPost.id)).filter(
            BbsPost.board_id == board.id,
            BbsPost.stts == PostStatus.PUBLISHED  # 삭제된 게시물 제외
        ).scalar()
        board.post_count = actual_post_count or 0

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

    # 총 조회수 계산 (PUBLISHED 상태의 게시글만)
    total_view_count = db.query(func.sum(BbsPost.vw_cnt)).filter(
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
    db_post = BbsPost(
        **post.dict(exclude={'tags'}),
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
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시글 상세 조회"""
    # 게시글 조회 및 조회수 증가
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

    # 조회수 증가 (삭제된 게시물은 조회수 증가하지 않음)
    if post.stts != PostStatus.DELETED:
        post.vw_cnt += 1
        db.commit()

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

    # 응답 구성
    post_dict = PostDetailResponse.from_orm(post).dict()
    post_dict.update({
        'author_nickname': author_nickname,
        'category_nm': category_nm,
        'tags': tag_names,
        'attachments': [AttachmentResponse.from_orm(att).dict() for att in attachments],
        'is_liked': is_liked,
        'is_bookmarked': is_bookmarked
    })

    return PostDetailResponse(**post_dict)


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
    for field, value in post_update.dict(exclude_unset=True, exclude={'tags', 'change_rsn'}).items():
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
    if comment.parent_id:
        parent_comment = db.query(BbsComment).filter(
            BbsComment.id == comment.parent_id,
            BbsComment.post_id == comment.post_id,
            BbsComment.del_yn == False
        ).first()

        if not parent_comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="부모 댓글을 찾을 수 없습니다"
            )

    # 댓글 생성
    db_comment = BbsComment(
        **comment.dict(),
        user_id=current_user.user_id,
        depth=1 if comment.parent_id else 0
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


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
        BbsComment.del_yn == False
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

        comment_dict = CommentResponse.from_orm(comment).dict()
        comment_dict.update({
            'author_nickname': author_nickname,
            'is_liked': is_liked
        })
        comment_list.append(CommentResponse(**comment_dict))

    return comment_list


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
    # 인기도 점수 계산 (조회수 + 좋아요*10 + 댓글*5)
    posts = db.query(
        BbsPost,
        CommonUser.nickname.label('author_nickname'),
        BbsBoard.nm.label('board_nm'),
        (BbsPost.vw_cnt + BbsPost.lk_cnt * 10 + BbsPost.cmt_cnt * 5).label('popularity_score')
    ).join(
        CommonUser, BbsPost.user_id == CommonUser.user_id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsPost.stts == PostStatus.PUBLISHED,
        BbsPost.stts != PostStatus.DELETED  # 삭제된 게시물 제외
    ).order_by(
        (BbsPost.vw_cnt + BbsPost.lk_cnt * 10 + BbsPost.cmt_cnt * 5).desc()
    ).limit(limit).all()

    result = []
    for post, author_nickname, board_nm, score in posts:
        post_dict = PopularPostResponse(
            id=post.id,
            ttl=post.ttl,
            vw_cnt=post.vw_cnt,
            lk_cnt=post.lk_cnt,
            cmt_cnt=post.cmt_cnt,
            author_nickname=author_nickname,
            board_nm=board_nm,
            crt_dt=post.crt_dt,
            popularity_score=score
        )
        result.append(post_dict)

    return result


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
