"""게시판 추가 기능 엔드포인트 (신고, 팔로우, 알림 등)"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.board import (
    BbsReport, BbsNotification, BbsFollow, BbsUserPreference,
    BbsTag, BbsPostTag, ReportTargetType, ReportStatus,
    FollowType, BbsPost, BbsComment, BbsBoard, BbsCategory, PostStatus,
    BbsPostView, BbsPostLike, BbsCommentLike, CommentStatus
)
from sqlalchemy import func
from app.models.user import CommonUser
from app.dependencies import get_current_active_user, is_admin_user
from app.schemas.board import (
    ReportCreate, ReportResponse, NotificationResponse,
    FollowCreate, FollowResponse, UserPreferenceUpdate,
    UserPreferenceResponse, TagResponse
)

router = APIRouter()


# 신고 기능 엔드포인트
@router.post(
    "/reports",
    response_model=ReportResponse,
    summary="콘텐츠 신고",
    description="게시글, 댓글, 사용자를 신고합니다."
)
async def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """콘텐츠 신고"""
    # 대상 존재 확인
    if report.target_type == ReportTargetType.POST:
        target = db.query(BbsPost).filter(
            BbsPost.id == report.target_id,
            BbsPost.stts != PostStatus.DELETED
        ).first()
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="신고 대상 게시글을 찾을 수 없습니다"
            )
    elif report.target_type == ReportTargetType.COMMENT:
        target = db.query(BbsComment).filter(
            BbsComment.id == report.target_id,
            BbsComment.del_yn == False
        ).first()
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="신고 대상 댓글을 찾을 수 없습니다"
            )
    elif report.target_type == ReportTargetType.USER:
        target = db.query(CommonUser).filter(
            CommonUser.user_id == str(report.target_id),
            CommonUser.del_yn == False
        ).first()
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="신고 대상 사용자를 찾을 수 없습니다"
            )

    # 중복 신고 확인
    existing_report = db.query(BbsReport).filter(
        BbsReport.reporter_id == current_user.user_id,
        BbsReport.target_type == report.target_type,
        BbsReport.target_id == report.target_id,
        BbsReport.stts.in_([ReportStatus.PENDING, ReportStatus.REVIEWED])
    ).first()

    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 신고한 콘텐츠입니다"
        )

    # 신고 생성
    db_report = BbsReport(
        **report.dict(),
        reporter_id=current_user.user_id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@router.get(
    "/reports",
    response_model=List[ReportResponse],
    summary="신고 목록 조회",
    description="신고 목록을 조회합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def get_reports(
    status: Optional[ReportStatus] = Query(None, description="신고 상태 필터"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(100, ge=1, le=1000, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db)
):
    """신고 목록 조회"""
    query = db.query(BbsReport).filter(BbsReport.del_yn == False)

    if status:
        query = query.filter(BbsReport.stts == status)

    reports = query.order_by(BbsReport.crt_dt.desc()).offset(skip).limit(limit).all()
    return reports


# 팔로우 기능 엔드포인트
@router.post(
    "/follow",
    response_model=FollowResponse,
    summary="팔로우 추가",
    description="사용자 또는 게시판을 팔로우합니다."
)
async def follow(
    follow_request: FollowCreate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """팔로우 추가"""
    # 대상 존재 확인
    if follow_request.typ == FollowType.USER:
        target = db.query(CommonUser).filter(
            CommonUser.user_id == follow_request.following_id,
            CommonUser.del_yn == False
        ).first()
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="팔로우 대상 사용자를 찾을 수 없습니다"
            )

        # 자기 자신 팔로우 불가
        if follow_request.following_id == current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="자기 자신을 팔로우할 수 없습니다"
            )
    elif follow_request.typ == FollowType.BOARD:
        target = db.query(BbsBoard).filter(
            BbsBoard.id == int(follow_request.following_id),
            BbsBoard.actv_yn == True,
            BbsBoard.del_yn == False
        ).first()
        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="팔로우 대상 게시판을 찾을 수 없습니다"
            )

    # 중복 팔로우 확인
    existing_follow = db.query(BbsFollow).filter(
        BbsFollow.follower_id == current_user.user_id,
        BbsFollow.following_id == follow_request.following_id,
        BbsFollow.typ == follow_request.typ
    ).first()

    if existing_follow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 팔로우 중입니다"
        )

    # 팔로우 생성 (외래키 제약조건 제거로 인해 단순한 ORM 사용 가능)
    follow_obj = BbsFollow(
        follower_id=current_user.user_id,
        following_id=follow_request.following_id,
        typ=follow_request.typ
    )
    db.add(follow_obj)
    db.commit()
    db.refresh(follow_obj)
    return follow_obj


@router.delete(
    "/follow/{following_id}",
    summary="팔로우 취소",
    description="팔로우를 취소합니다."
)
async def unfollow(
    following_id: str = Path(..., description="팔로잉 대상 ID"),
    follow_type: FollowType = Query(..., description="팔로우 유형"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """팔로우 취소"""
    follow_obj = db.query(BbsFollow).filter(
        BbsFollow.follower_id == current_user.user_id,
        BbsFollow.following_id == following_id,
        BbsFollow.typ == follow_type
    ).first()

    if not follow_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="팔로우 정보를 찾을 수 없습니다"
        )

    db.delete(follow_obj)
    db.commit()

    return {"message": "팔로우가 취소되었습니다"}


@router.get(
    "/follow/followers/{user_id}",
    response_model=List[FollowResponse],
    summary="팔로워 목록 조회",
    description="특정 사용자의 팔로워 목록을 조회합니다."
)
async def get_followers(
    user_id: str = Path(..., description="사용자 ID"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=200, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db)
):
    """팔로워 목록 조회"""
    followers = db.query(BbsFollow).filter(
        BbsFollow.following_id == user_id,
        BbsFollow.typ == FollowType.USER
    ).order_by(BbsFollow.crt_dt.desc()).offset(skip).limit(limit).all()

    return followers


@router.get(
    "/follow/following/{user_id}",
    response_model=List[FollowResponse],
    summary="팔로잉 목록 조회",
    description="특정 사용자가 팔로우하는 목록을 조회합니다."
)
async def get_following(
    user_id: str = Path(..., description="사용자 ID"),
    follow_type: Optional[FollowType] = Query(None, description="팔로우 유형 필터"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=200, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db)
):
    """팔로잉 목록 조회"""
    query = db.query(BbsFollow).filter(
        BbsFollow.follower_id == user_id
    )

    if follow_type:
        query = query.filter(BbsFollow.typ == follow_type)

    following = query.order_by(BbsFollow.crt_dt.desc()).offset(skip).limit(limit).all()
    return following


@router.get(
    "/follow/status/board/{board_id}",
    summary="게시판 팔로우 상태 조회",
    description="현재 사용자가 특정 게시판을 팔로우하고 있는지 확인합니다."
)
async def check_board_follow_status(
    board_id: int = Path(..., description="게시판 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """게시판 팔로우 상태 조회"""
    follow = db.query(BbsFollow).filter(
        BbsFollow.follower_id == current_user.user_id,
        BbsFollow.following_id == str(board_id),
        BbsFollow.typ == FollowType.BOARD
    ).first()

    return {"is_following": follow is not None}


@router.get(
    "/follow/count/board/{board_id}",
    summary="게시판 팔로워 수 조회",
    description="특정 게시판의 팔로워 수를 조회합니다."
)
async def get_board_follower_count(
    board_id: int = Path(..., description="게시판 ID"),
    db: Session = Depends(get_db)
):
    """게시판 팔로워 수 조회"""
    follower_count = db.query(BbsFollow).filter(
        BbsFollow.following_id == str(board_id),
        BbsFollow.typ == FollowType.BOARD
    ).count()

    return {"follower_count": follower_count}


# 알림 기능 엔드포인트
@router.get(
    "/notifications",
    response_model=List[NotificationResponse],
    summary="알림 목록 조회",
    description="현재 사용자의 알림 목록을 조회합니다."
)
async def get_notifications(
    is_read: Optional[bool] = Query(None, description="읽음 상태 필터"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(50, ge=1, le=200, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """알림 목록 조회"""
    query = db.query(BbsNotification).filter(
        BbsNotification.user_id == current_user.user_id,
        BbsNotification.del_yn == False
    )

    if is_read is not None:
        query = query.filter(BbsNotification.is_read == is_read)

    notifications = query.order_by(BbsNotification.crt_dt.desc()).offset(skip).limit(limit).all()
    return notifications


@router.put(
    "/notifications/{notification_id}/read",
    summary="알림 읽음 처리",
    description="특정 알림을 읽음으로 표시합니다."
)
async def mark_notification_read(
    notification_id: int = Path(..., description="알림 ID"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """알림 읽음 처리"""
    notification = db.query(BbsNotification).filter(
        BbsNotification.id == notification_id,
        BbsNotification.user_id == current_user.user_id,
        BbsNotification.del_yn == False
    ).first()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="알림을 찾을 수 없습니다"
        )

    notification.is_read = True
    db.commit()

    return {"message": "알림이 읽음 처리되었습니다"}


@router.put(
    "/notifications/read-all",
    summary="모든 알림 읽음 처리",
    description="현재 사용자의 모든 알림을 읽음으로 표시합니다."
)
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """모든 알림 읽음 처리"""
    db.query(BbsNotification).filter(
        BbsNotification.user_id == current_user.user_id,
        BbsNotification.is_read == False,
        BbsNotification.del_yn == False
    ).update({"is_read": True})

    db.commit()

    return {"message": "모든 알림이 읽음 처리되었습니다"}


# 태그 기능 엔드포인트
@router.get(
    "/tags",
    response_model=List[TagResponse],
    summary="태그 목록 조회",
    description="사용 가능한 태그 목록을 조회합니다."
)
async def get_tags(
    search: Optional[str] = Query(None, description="태그 검색어"),
    limit: int = Query(50, ge=1, le=200, description="반환할 최대 태그 수"),
    db: Session = Depends(get_db)
):
    """태그 목록 조회"""
    query = db.query(BbsTag).filter(BbsTag.del_yn == False)

    if search:
        query = query.filter(BbsTag.nm.ilike(f'%{search}%'))

    tags = query.order_by(BbsTag.usage_cnt.desc(), BbsTag.crt_dt.desc()).limit(limit).all()
    return tags


@router.get(
    "/tags/popular",
    response_model=List[TagResponse],
    summary="인기 태그 조회",
    description="사용 빈도가 높은 태그들을 조회합니다."
)
async def get_popular_tags(
    limit: int = Query(20, ge=1, le=100, description="반환할 태그 수"),
    db: Session = Depends(get_db)
):
    """인기 태그 조회"""
    tags = db.query(BbsTag).filter(
        BbsTag.del_yn == False
    ).order_by(BbsTag.usage_cnt.desc()).limit(limit).all()

    return tags


@router.get(
    "/posts/{post_id}/tags",
    response_model=List[TagResponse],
    summary="게시글 태그 조회",
    description="특정 게시글의 태그들을 조회합니다."
)
async def get_post_tags(
    post_id: int = Path(..., description="게시글 ID"),
    db: Session = Depends(get_db)
):
    """게시글 태그 조회"""
    # 게시글 존재 확인
    post = db.query(BbsPost).filter(
        BbsPost.id == post_id,
        BbsPost.stts != PostStatus.DELETED
    ).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )

    # 태그 조회
    tags = db.query(BbsTag).join(
        BbsPostTag, BbsTag.id == BbsPostTag.tag_id
    ).filter(
        BbsPostTag.post_id == post_id,
        BbsTag.del_yn == False
    ).all()

    return tags


# 사용자 설정 엔드포인트
@router.get(
    "/user/preferences",
    response_model=List[UserPreferenceResponse],
    summary="사용자 설정 조회",
    description="현재 사용자의 개인 설정들을 조회합니다."
)
async def get_user_preferences(
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 설정 조회"""
    preferences = db.query(BbsUserPreference).filter(
        BbsUserPreference.user_id == current_user.user_id,
        BbsUserPreference.del_yn == False
    ).all()

    return preferences


@router.post(
    "/user/preferences",
    response_model=UserPreferenceResponse,
    summary="사용자 설정 저장",
    description="사용자 개인 설정을 저장합니다."
)
async def set_user_preference(
    preference: UserPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 설정 저장"""
    # 기존 설정 확인
    existing_pref = db.query(BbsUserPreference).filter(
        BbsUserPreference.user_id == current_user.user_id,
        BbsUserPreference.pref_key == preference.pref_key,
        BbsUserPreference.del_yn == False
    ).first()

    if existing_pref:
        # 기존 설정 업데이트
        existing_pref.pref_val = preference.pref_val
        db.commit()
        db.refresh(existing_pref)
        return existing_pref
    else:
        # 새 설정 생성
        new_pref = BbsUserPreference(
            user_id=current_user.user_id,
            pref_key=preference.pref_key,
            pref_val=preference.pref_val
        )
        db.add(new_pref)
        db.commit()
        db.refresh(new_pref)
        return new_pref


@router.delete(
    "/user/preferences/{pref_key}",
    summary="사용자 설정 삭제",
    description="특정 사용자 설정을 삭제합니다."
)
async def delete_user_preference(
    pref_key: str = Path(..., description="설정 키"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 설정 삭제"""
    preference = db.query(BbsUserPreference).filter(
        BbsUserPreference.user_id == current_user.user_id,
        BbsUserPreference.pref_key == pref_key,
        BbsUserPreference.del_yn == False
    ).first()

    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="설정을 찾을 수 없습니다"
        )

    preference.del_yn = True
    db.commit()

    return {"message": "설정이 삭제되었습니다"}


# 사용자 북마크 조회
@router.get(
    "/user/bookmarks",
    summary="사용자 북마크 목록 조회",
    description="현재 사용자의 북마크한 게시글들을 조회합니다."
)
async def get_user_bookmarks(
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(20, ge=1, le=100, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 북마크 목록 조회"""
    from app.schemas.board import PostResponse

    bookmarks = db.query(
        BbsPost,
        CommonUser.nickname.label('author_nickname'),
        BbsCategory.nm.label('category_nm'),
        BbsBookmark.crt_dt.label('bookmarked_at')
    ).join(
        BbsBookmark, BbsPost.id == BbsBookmark.post_id
    ).join(
        CommonUser, BbsPost.user_id == CommonUser.user_id
    ).outerjoin(
        BbsCategory, BbsPost.category_id == BbsCategory.id
    ).filter(
        BbsBookmark.user_id == current_user.user_id,
        BbsPost.stts != PostStatus.DELETED,
        BbsPost.stts == PostStatus.PUBLISHED
    ).order_by(BbsBookmark.crt_dt.desc()).offset(skip).limit(limit).all()

    result = []
    for post, author_nickname, category_nm, bookmarked_at in bookmarks:
        post_dict = PostResponse.from_orm(post).dict()
        post_dict.update({
            'author_nickname': author_nickname,
            'category_nm': category_nm,
            'bookmarked_at': bookmarked_at
        })
        result.append(post_dict)

    return result


# 사용자 작성 댓글 조회
@router.get(
    "/user/comments",
    summary="사용자 작성 댓글 조회",
    description="특정 사용자가 작성한 댓글들을 조회합니다."
)
async def get_user_comments(
    user_id: Optional[str] = Query(None, description="조회할 사용자 ID (기본값: 현재 사용자)"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(20, ge=1, le=100, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 작성 댓글 조회"""
    from app.schemas.board import CommentResponse

    target_user_id = user_id or current_user.user_id

    # 사용자 존재 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == target_user_id,
        CommonUser.del_yn == False
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )

    query = db.query(
        BbsComment,
        BbsPost.ttl.label('post_title'),
        BbsPost.id.label('post_id'),
        BbsBoard.nm.label('board_nm'),
        BbsBoard.id.label('board_id')
    ).join(
        BbsPost, BbsComment.post_id == BbsPost.id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsComment.user_id == target_user_id,
        BbsComment.stts != CommentStatus.DELETED
    )

    comments = query.order_by(BbsComment.crt_dt.desc()).offset(skip).limit(limit).all()

    result = []
    for comment, post_title, post_id, board_nm, board_id in comments:
        # 좋아요 수: bbs_comment_likes 테이블에서 실제 카운트
        like_count = db.query(func.count()).filter(
            BbsCommentLike.comment_id == comment.id
        ).scalar() or 0
        
        comment_dict = {
            'id': comment.id,
            'post_id': post_id,
            'user_id': comment.user_id,
            'cn': comment.cn,
            'parent_id': comment.parent_id,
            'scr_yn': comment.scr_yn,
            'stts': comment.stts,
            'lk_cnt': int(like_count),
            'depth': comment.depth,
            'sort_order': comment.sort_order,
            'crt_dt': comment.crt_dt,
            'upd_dt': comment.upd_dt,
            'post_title': post_title,
            'board_nm': board_nm,
            'board_id': board_id
        }
        result.append(comment_dict)

    return result


# 사용자 작성 게시글 조회
@router.get(
    "/user/posts",
    summary="사용자 작성 게시글 조회",
    description="특정 사용자가 작성한 게시글들을 조회합니다."
)
async def get_user_posts(
    user_id: Optional[str] = Query(None, description="조회할 사용자 ID (기본값: 현재 사용자)"),
    status: Optional[str] = Query(None, description="게시글 상태 필터"),
    skip: int = Query(0, ge=0, description="건너뛸 레코드 수"),
    limit: int = Query(20, ge=1, le=100, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """사용자 작성 게시글 조회"""
    from app.schemas.board import PostResponse

    target_user_id = user_id or current_user.user_id

    # 사용자 존재 확인
    user = db.query(CommonUser).filter(
        CommonUser.user_id == target_user_id,
        CommonUser.del_yn == False
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )

    query = db.query(
        BbsPost,
        BbsCategory.nm.label('category_nm'),
        BbsBoard.nm.label('board_nm')
    ).outerjoin(
        BbsCategory, BbsPost.category_id == BbsCategory.id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsPost.user_id == target_user_id,
        BbsPost.stts != PostStatus.DELETED
    )

    if status:
        query = query.filter(BbsPost.stts == status)

    posts = query.order_by(BbsPost.crt_dt.desc()).offset(skip).limit(limit).all()

    result = []
    for post, category_nm, board_nm in posts:
        post_dict = PostResponse.from_orm(post).dict()
        
        # 조회수: bbs_post_views 테이블에서 실제 카운트
        view_count = db.query(func.count(BbsPostView.id)).filter(
            BbsPostView.post_id == post.id
        ).scalar() or 0
        post_dict['vw_cnt'] = int(view_count)
        
        # 댓글수: bbs_comments 테이블에서 실제 카운트 (삭제되지 않은 댓글만)
        comment_count = db.query(func.count(BbsComment.id)).filter(
            BbsComment.post_id == post.id,
            BbsComment.stts != CommentStatus.DELETED
        ).scalar() or 0
        post_dict['cmt_cnt'] = int(comment_count)
        
        # 좋아요수: bbs_post_likes 테이블에서 실제 카운트
        like_count = db.query(func.count(BbsPostLike.id)).filter(
            BbsPostLike.post_id == post.id
        ).scalar() or 0
        post_dict['lk_cnt'] = int(like_count)
        
        post_dict.update({
            'category_nm': category_nm,
            'board_nm': board_nm
        })
        result.append(post_dict)

    return result
