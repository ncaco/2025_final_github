"""대시보드 엔드포인트"""
from typing import List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, String, case, cast
from app.database import get_db
from app.models.board import (
    BbsPost, BbsComment, BbsBookmark, BbsFollow, BbsReport,
    BbsBoard, BbsCategory, PostStatus, CommentStatus, FollowType,
    BbsPostView, BbsPostLike, ReportStatus, ReportReason, ReportTargetType
)
from app.models.inquiry import CommonInquiry, InquiryStatus, InquiryCategory
from app.models.user import CommonUser
from app.dependencies import is_admin_user
from app.dependencies import get_current_active_user
from app.schemas.dashboard import (
    DashboardStatsResponse, RecentActivityResponse, ActivityType,
    MyPostResponse, MyCommentResponse, MyBookmarkResponse,
    MyFollowResponse, MyReportResponse, DashboardListResponse,
    DashboardReportStatus
)

router = APIRouter()


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="대시보드 통계 조회",
    description="현재 사용자의 대시보드 통계 정보를 조회합니다."
)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """대시보드 통계 조회"""
    user_id = current_user.user_id
    today = date.today()

    # 전체 게시글 수
    total_posts = db.query(func.count(BbsPost.id)).filter(
        BbsPost.user_id == user_id,
        BbsPost.stts != PostStatus.DELETED
    ).scalar() or 0

    # 전체 댓글 수
    total_comments = db.query(func.count(BbsComment.id)).filter(
        BbsComment.user_id == user_id,
        BbsComment.stts != CommentStatus.DELETED
    ).scalar() or 0

    # 전체 북마크 수
    total_bookmarks = db.query(func.count(BbsBookmark.id)).filter(
        BbsBookmark.user_id == user_id
    ).scalar() or 0

    # 전체 팔로우 수 (게시판만)
    total_follows = db.query(func.count(BbsFollow.id)).filter(
        BbsFollow.follower_id == user_id,
        BbsFollow.typ == FollowType.BOARD
    ).scalar() or 0

    # 오늘 작성한 게시글 수
    posts_today = db.query(func.count(BbsPost.id)).filter(
        BbsPost.user_id == user_id,
        func.date(BbsPost.crt_dt) == today,
        BbsPost.stts != PostStatus.DELETED
    ).scalar() or 0

    # 오늘 작성한 댓글 수
    comments_today = db.query(func.count(BbsComment.id)).filter(
        BbsComment.user_id == user_id,
        func.date(BbsComment.crt_dt) == today,
        BbsComment.stts != CommentStatus.DELETED
    ).scalar() or 0

    return DashboardStatsResponse(
        total_posts=int(total_posts),
        total_comments=int(total_comments),
        total_bookmarks=int(total_bookmarks),
        total_follows=int(total_follows),
        posts_today=int(posts_today),
        comments_today=int(comments_today)
    )


@router.get(
    "/recent-activities",
    response_model=List[RecentActivityResponse],
    summary="최근 활동 조회",
    description="현재 사용자의 최근 활동 목록을 조회합니다."
)
async def get_recent_activities(
    limit: int = Query(20, ge=1, le=100, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """최근 활동 조회"""
    user_id = current_user.user_id
    activities = []

    # 최근 게시글 (최근 10개)
    recent_posts = db.query(
        BbsPost.id,
        BbsPost.ttl.label('title'),
        BbsPost.crt_dt
    ).filter(
        BbsPost.user_id == user_id,
        BbsPost.stts != PostStatus.DELETED
    ).order_by(BbsPost.crt_dt.desc()).limit(10).all()

    for post in recent_posts:
        activities.append({
            'id': post.id,
            'type': ActivityType.POST,
            'title': post.title,
            'created_at': post.crt_dt
        })

    # 최근 댓글 (최근 10개)
    recent_comments = db.query(
        BbsComment.id,
        BbsPost.ttl.label('title'),
        BbsComment.crt_dt
    ).join(
        BbsPost, BbsComment.post_id == BbsPost.id
    ).filter(
        BbsComment.user_id == user_id,
        BbsComment.stts != CommentStatus.DELETED
    ).order_by(BbsComment.crt_dt.desc()).limit(10).all()

    for comment in recent_comments:
        activities.append({
            'id': comment.id,
            'type': ActivityType.COMMENT,
            'title': f"댓글: {comment.title}",
            'created_at': comment.crt_dt
        })

    # 최근 북마크 (최근 10개)
    recent_bookmarks = db.query(
        BbsBookmark.id,
        BbsPost.ttl.label('title'),
        BbsBookmark.crt_dt
    ).join(
        BbsPost, BbsBookmark.post_id == BbsPost.id
    ).filter(
        BbsBookmark.user_id == user_id,
        BbsPost.stts != PostStatus.DELETED
    ).order_by(BbsBookmark.crt_dt.desc()).limit(10).all()

    for bookmark in recent_bookmarks:
        activities.append({
            'id': bookmark.id,
            'type': ActivityType.BOOKMARK,
            'title': f"북마크: {bookmark.title}",
            'created_at': bookmark.crt_dt
        })

    # 최근 팔로우 (최근 10개)
    recent_follows = db.query(
        BbsFollow.id,
        BbsBoard.nm.label('title'),
        BbsFollow.crt_dt
    ).join(
        BbsBoard, cast(BbsBoard.id, String) == BbsFollow.following_id
    ).filter(
        BbsFollow.follower_id == user_id,
        BbsFollow.typ == FollowType.BOARD
    ).order_by(BbsFollow.crt_dt.desc()).limit(10).all()

    for follow in recent_follows:
        activities.append({
            'id': follow.id,
            'type': ActivityType.FOLLOW,
            'title': f"팔로우: {follow.title}",
            'created_at': follow.crt_dt
        })

    # 생성일시 기준으로 정렬하고 limit만큼 반환
    activities.sort(key=lambda x: x['created_at'], reverse=True)
    activities = activities[:limit]

    return [RecentActivityResponse(**activity) for activity in activities]


@router.get(
    "/my-posts",
    response_model=DashboardListResponse[MyPostResponse],
    summary="내 게시글 목록 조회",
    description="현재 사용자가 작성한 게시글 목록을 조회합니다."
)
async def get_my_posts(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """내 게시글 목록 조회"""
    user_id = current_user.user_id
    skip = (page - 1) * limit

    # 전체 개수 조회
    total = db.query(func.count(BbsPost.id)).filter(
        BbsPost.user_id == user_id,
        BbsPost.stts != PostStatus.DELETED
    ).scalar() or 0

    # 게시글 목록 조회
    posts = db.query(
        BbsPost,
        BbsBoard.id.label('board_id'),
        BbsBoard.nm.label('board_name')
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsPost.user_id == user_id,
        BbsPost.stts != PostStatus.DELETED
    ).order_by(BbsPost.crt_dt.desc()).offset(skip).limit(limit).all()

    items = []
    for post, board_id, board_name in posts:
        # 조회수
        view_count = db.query(func.count(BbsPostView.id)).filter(
            BbsPostView.post_id == post.id
        ).scalar() or 0

        # 댓글수
        comment_count = db.query(func.count(BbsComment.id)).filter(
            BbsComment.post_id == post.id,
            BbsComment.stts != CommentStatus.DELETED
        ).scalar() or 0

        # 좋아요수
        like_count = db.query(func.count(BbsPostLike.id)).filter(
            BbsPostLike.post_id == post.id
        ).scalar() or 0

        items.append(MyPostResponse(
            id=str(post.id),
            title=post.ttl,
            content=post.cn[:200] if post.cn else "",  # 내용 일부만
            board_id=str(board_id),
            board_name=board_name,
            created_at=post.crt_dt,
            updated_at=post.upd_dt,
            view_count=int(view_count),
            like_count=int(like_count),
            comment_count=int(comment_count)
        ))

    return DashboardListResponse(items=items, total=int(total))


@router.get(
    "/my-comments",
    response_model=DashboardListResponse[MyCommentResponse],
    summary="내 댓글 목록 조회",
    description="현재 사용자가 작성한 댓글 목록을 조회합니다."
)
async def get_my_comments(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """내 댓글 목록 조회"""
    user_id = current_user.user_id
    skip = (page - 1) * limit

    # 전체 개수 조회
    total = db.query(func.count(BbsComment.id)).filter(
        BbsComment.user_id == user_id,
        BbsComment.stts != CommentStatus.DELETED
    ).scalar() or 0

    # 댓글 목록 조회
    comments = db.query(
        BbsComment,
        BbsPost.id.label('post_id'),
        BbsPost.ttl.label('post_title'),
        BbsBoard.id.label('board_id'),
        BbsBoard.nm.label('board_name')
    ).join(
        BbsPost, BbsComment.post_id == BbsPost.id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsComment.user_id == user_id,
        BbsComment.stts != CommentStatus.DELETED
    ).order_by(BbsComment.crt_dt.desc()).offset(skip).limit(limit).all()

    items = []
    for comment, post_id, post_title, board_id, board_name in comments:
        items.append(MyCommentResponse(
            id=str(comment.id),
            content=comment.cn[:200] if comment.cn else "",  # 내용 일부만
            post_id=str(post_id),
            post_title=post_title,
            board_id=str(board_id),
            board_name=board_name,
            created_at=comment.crt_dt,
            updated_at=comment.upd_dt
        ))

    return DashboardListResponse(items=items, total=int(total))


@router.get(
    "/my-bookmarks",
    response_model=DashboardListResponse[MyBookmarkResponse],
    summary="내 북마크 목록 조회",
    description="현재 사용자의 북마크 목록을 조회합니다."
)
async def get_my_bookmarks(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """내 북마크 목록 조회"""
    user_id = current_user.user_id
    skip = (page - 1) * limit

    # 전체 개수 조회
    total = db.query(func.count(BbsBookmark.id)).filter(
        BbsBookmark.user_id == user_id
    ).scalar() or 0

    # 북마크 목록 조회
    bookmarks = db.query(
        BbsBookmark,
        BbsPost.id.label('post_id'),
        BbsPost.ttl.label('post_title'),
        BbsBoard.id.label('board_id'),
        BbsBoard.nm.label('board_name')
    ).join(
        BbsPost, BbsBookmark.post_id == BbsPost.id
    ).join(
        BbsBoard, BbsPost.board_id == BbsBoard.id
    ).filter(
        BbsBookmark.user_id == user_id,
        BbsPost.stts != PostStatus.DELETED
    ).order_by(BbsBookmark.crt_dt.desc()).offset(skip).limit(limit).all()

    items = []
    for bookmark, post_id, post_title, board_id, board_name in bookmarks:
        items.append(MyBookmarkResponse(
            id=str(bookmark.id),
            post_id=str(post_id),
            post_title=post_title,
            board_id=str(board_id),
            board_name=board_name,
            created_at=bookmark.crt_dt
        ))

    return DashboardListResponse(items=items, total=int(total))


@router.get(
    "/my-follows",
    response_model=DashboardListResponse[MyFollowResponse],
    summary="내 팔로우 목록 조회",
    description="현재 사용자가 팔로우한 게시판 목록을 조회합니다."
)
async def get_my_follows(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """내 팔로우 목록 조회"""
    user_id = current_user.user_id
    skip = (page - 1) * limit

    # 전체 개수 조회
    total = db.query(func.count(BbsFollow.id)).filter(
        BbsFollow.follower_id == user_id,
        BbsFollow.typ == FollowType.BOARD
    ).scalar() or 0

    # 팔로우 목록 조회
    follows = db.query(
        BbsFollow,
        BbsBoard.id.label('board_id'),
        BbsBoard.nm.label('board_name'),
        BbsBoard.dsc.label('board_description')
    ).join(
        BbsBoard, cast(BbsBoard.id, String) == BbsFollow.following_id
    ).filter(
        BbsFollow.follower_id == user_id,
        BbsFollow.typ == FollowType.BOARD,
        BbsBoard.actv_yn == True,
        BbsBoard.del_yn == False
    ).order_by(BbsFollow.crt_dt.desc()).offset(skip).limit(limit).all()

    items = []
    for follow, board_id, board_name, board_description in follows:
        items.append(MyFollowResponse(
            id=str(follow.id),
            board_id=str(board_id),
            board_name=board_name,
            board_description=board_description,
            created_at=follow.crt_dt
        ))

    return DashboardListResponse(items=items, total=int(total))


@router.get(
    "/my-reports",
    response_model=DashboardListResponse[MyReportResponse],
    summary="내 신고 목록 조회",
    description="현재 사용자가 작성한 신고 목록을 조회합니다."
)
async def get_my_reports(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """내 신고 목록 조회"""
    user_id = current_user.user_id
    skip = (page - 1) * limit

    # 전체 개수 조회
    total = db.query(func.count(BbsReport.id)).filter(
        BbsReport.reporter_id == user_id
    ).scalar() or 0

    # 신고 목록 조회
    reports = db.query(BbsReport).filter(
        BbsReport.reporter_id == user_id
    ).order_by(BbsReport.crt_dt.desc()).offset(skip).limit(limit).all()

    items = []
    for report in reports:
        # 신고 제목 생성 (대상 타입과 ID로)
        target_author_id = None
        target_author_nickname = None
        
        if report.target_type == ReportTargetType.POST:
            target = db.query(BbsPost).filter(BbsPost.id == report.target_id).first()
            if target:
                title = f"게시글 신고: {target.ttl}"
                target_author_id = target.user_id
                # 작성자 닉네임 조회
                author = db.query(CommonUser).filter(CommonUser.user_id == target.user_id).first()
                target_author_nickname = author.nickname if author else None
            else:
                title = f"게시글 신고: ID {report.target_id}"
        elif report.target_type == ReportTargetType.COMMENT:
            target = db.query(BbsComment).filter(BbsComment.id == report.target_id).first()
            if target:
                title = f"댓글 신고: {target.cn[:50] if target.cn else '내용 없음'}"
                target_author_id = target.user_id
                # 작성자 닉네임 조회
                author = db.query(CommonUser).filter(CommonUser.user_id == target.user_id).first()
                target_author_nickname = author.nickname if author else None
            else:
                title = f"댓글 신고: ID {report.target_id}"
        else:
            # 사용자 신고의 경우 target_id가 사용자 ID
            title = f"사용자 신고: ID {report.target_id}"
            target_author_id = str(report.target_id)
            author = db.query(CommonUser).filter(CommonUser.user_id == str(report.target_id)).first()
            target_author_nickname = author.nickname if author else None

        # 신고 상태 매핑 (프론트엔드 형식에 맞춤)
        status_mapping = {
            ReportStatus.PENDING: DashboardReportStatus.PENDING,
            ReportStatus.REVIEWED: DashboardReportStatus.PROCESSING,
            ReportStatus.RESOLVED: DashboardReportStatus.RESOLVED,
            ReportStatus.DISMISSED: DashboardReportStatus.REJECTED
        }
        report_status = status_mapping.get(report.stts, DashboardReportStatus.PENDING)

        items.append(MyReportResponse(
            id=str(report.id),
            title=title,
            reason=report.rsn.value,
            status=report_status,
            created_at=report.crt_dt,
            updated_at=report.prcs_dt,
            target_type=report.target_type.value if hasattr(report.target_type, 'value') else str(report.target_type),
            target_id=report.target_id,
            target_author_id=target_author_id,
            target_author_nickname=target_author_nickname,
            description=report.dsc,
            processed_by=report.processed_by,
            processed_at=report.prcs_dt
        ))

    return DashboardListResponse(items=items, total=int(total))


@router.get(
    "/inquiries",
    response_model=DashboardListResponse[MyReportResponse],  # 임시로 MyReportResponse 사용
    summary="내 문의 목록 조회",
    description="현재 사용자의 문의 목록을 조회합니다."
)
async def get_my_inquiries_dashboard(
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지당 항목 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """내 문의 목록 조회 (Dashboard용)"""
    user_id = current_user.user_id
    skip = (page - 1) * limit

    # 전체 개수 조회
    total = db.query(func.count(CommonInquiry.id)).filter(
        CommonInquiry.user_id == user_id,
        CommonInquiry.del_yn == False
    ).scalar() or 0

    # 문의 목록 조회
    inquiries = db.query(CommonInquiry).filter(
        CommonInquiry.user_id == user_id,
        CommonInquiry.del_yn == False
    ).order_by(CommonInquiry.crt_dt.desc()).offset(skip).limit(limit).all()

    items = []
    for inquiry in inquiries:
        # 상태 매핑
        status_mapping = {
            InquiryStatus.PENDING: "PENDING",
            InquiryStatus.ANSWERED: "ANSWERED",
            InquiryStatus.CLOSED: "CLOSED"
        }
        
        items.append(MyReportResponse(
            id=str(inquiry.id),
            title=inquiry.title,
            reason=inquiry.category.value if hasattr(inquiry.category, 'value') else str(inquiry.category),
            status=status_mapping.get(inquiry.status, "PENDING"),
            created_at=inquiry.crt_dt,
            updated_at=inquiry.upd_dt or inquiry.answered_at
        ))

    return DashboardListResponse(items=items, total=int(total))


@router.post(
    "/inquiries",
    response_model=MyReportResponse,  # 임시로 MyReportResponse 사용
    summary="새 문의 생성",
    description="새로운 문의를 생성합니다."
)
async def create_inquiry_dashboard(
    data: dict,
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """새 문의 생성 (Dashboard용)"""
    db_inquiry = CommonInquiry(
        user_id=current_user.user_id,
        title=data.get('title', ''),
        content=data.get('content', ''),
        category=InquiryCategory.GENERAL if not data.get('category') else InquiryCategory[data.get('category')],
        status=InquiryStatus.PENDING,
        crt_by=current_user.user_id,
        crt_by_nm=current_user.nickname or current_user.username
    )
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    
    return MyReportResponse(
        id=str(db_inquiry.id),
        title=db_inquiry.title,
        reason=db_inquiry.category.value if hasattr(db_inquiry.category, 'value') else str(db_inquiry.category),
        status="PENDING",
        created_at=db_inquiry.crt_dt,
        updated_at=db_inquiry.upd_dt
    )


# 관리자 대시보드 엔드포인트
@router.get(
    "/admin/stats",
    response_model=dict,
    summary="관리자 대시보드 통계",
    description="시스템 전체 통계를 조회합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """관리자 대시보드 통계"""
    from datetime import date
    
    today = date.today()

    # 총 게시글 수
    total_posts = db.query(func.count(BbsPost.id)).filter(
        BbsPost.stts != PostStatus.DELETED
    ).scalar() or 0

    # 총 사용자 수
    total_users = db.query(func.count(CommonUser.common_user_sn)).filter(
        CommonUser.del_yn == False
    ).scalar() or 0

    # 총 댓글 수
    total_comments = db.query(func.count(BbsComment.id)).filter(
        BbsComment.stts != CommentStatus.DELETED
    ).scalar() or 0

    # 대기 중인 신고 수
    pending_reports = db.query(func.count(BbsReport.id)).filter(
        BbsReport.stts == ReportStatus.PENDING,
        BbsReport.del_yn == False
    ).scalar() or 0

    # 오늘 작성된 게시글 수
    posts_today = db.query(func.count(BbsPost.id)).filter(
        func.date(BbsPost.crt_dt) == today,
        BbsPost.stts != PostStatus.DELETED
    ).scalar() or 0

    # 오늘 작성된 댓글 수
    comments_today = db.query(func.count(BbsComment.id)).filter(
        func.date(BbsComment.crt_dt) == today,
        BbsComment.stts != CommentStatus.DELETED
    ).scalar() or 0

    # 오늘 가입한 사용자 수
    users_today = db.query(func.count(CommonUser.common_user_sn)).filter(
        func.date(CommonUser.crt_dt) == today,
        CommonUser.del_yn == False
    ).scalar() or 0

    return {
        "total_posts": int(total_posts),
        "total_users": int(total_users),
        "total_comments": int(total_comments),
        "pending_reports": int(pending_reports),
        "posts_today": int(posts_today),
        "comments_today": int(comments_today),
        "users_today": int(users_today)
    }


@router.get(
    "/admin/recent-activities",
    response_model=List[RecentActivityResponse],
    summary="최근 시스템 활동 (관리자용)",
    description="최근 시스템 활동 목록을 조회합니다. 관리자 권한이 필요합니다.",
    dependencies=[Depends(is_admin_user)]
)
async def get_admin_recent_activities(
    limit: int = Query(20, ge=1, le=100, description="반환할 최대 레코드 수"),
    db: Session = Depends(get_db),
    current_user: CommonUser = Depends(get_current_active_user)
):
    """최근 시스템 활동 (관리자용)"""
    activities = []

    # 최근 게시글 (최근 10개)
    recent_posts = db.query(
        BbsPost.id,
        BbsPost.ttl.label('title'),
        BbsPost.crt_dt
    ).filter(
        BbsPost.stts != PostStatus.DELETED
    ).order_by(BbsPost.crt_dt.desc()).limit(10).all()

    for post in recent_posts:
        activities.append(RecentActivityResponse(
            id=post.id,
            type=ActivityType.POST,
            title=post.title,
            created_at=post.crt_dt
        ))

    # 최근 댓글 (최근 10개)
    recent_comments = db.query(
        BbsComment.id,
        BbsPost.ttl.label('title'),
        BbsComment.crt_dt
    ).join(
        BbsPost, BbsComment.post_id == BbsPost.id
    ).filter(
        BbsComment.stts != CommentStatus.DELETED
    ).order_by(BbsComment.crt_dt.desc()).limit(10).all()

    for comment in recent_comments:
        activities.append(RecentActivityResponse(
            id=comment.id,
            type=ActivityType.COMMENT,
            title=f"댓글: {comment.title}",
            created_at=comment.crt_dt
        ))

    # 최근 신고 (최근 5개)
    recent_reports = db.query(
        BbsReport.id,
        func.concat("신고: ", cast(BbsReport.target_id, String)).label('title'),
        BbsReport.crt_dt
    ).filter(
        BbsReport.del_yn == False
    ).order_by(BbsReport.crt_dt.desc()).limit(5).all()

    for report in recent_reports:
        activities.append(RecentActivityResponse(
            id=report.id,
            type=ActivityType.REPORT,
            title=report.title,
            created_at=report.crt_dt
        ))

    # 생성일시 기준으로 정렬하고 limit만큼 반환
    activities.sort(key=lambda x: x.created_at, reverse=True)
    return activities[:limit]
