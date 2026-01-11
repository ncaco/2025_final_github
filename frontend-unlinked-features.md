# 프론트엔드 미연동 기능 목록

## 📋 개요
프론트엔드에서 백엔드 API 엔드포인트나 DB 테이블에 연동되지 않은 기능들을 정리한 문서입니다.

---

## 🔴 백엔드 엔드포인트가 없는 프론트엔드 기능

### 1. Dashboard API (`/api/v1/dashboard/*`)
- ✅ **구현 완료**: 대시보드 통계, 최근 활동, 내 게시글/댓글/북마크/팔로우/신고 목록 조회 엔드포인트 모두 구현됨
- ✅ **프론트엔드 연동 완료**: `frontend/app/dashboard/page.tsx` 및 하위 페이지들이 실제 API를 호출하도록 업데이트됨

---

## 🟡 백엔드 엔드포인트는 있지만 프론트엔드에서 미사용

### 2. Contact/Inquiry 기능
- ✅ **구현 완료**: 문의(Inquiry) 기능이 완전히 구현됨
  - ✅ DB 모델: `backend/app/models/inquiry.py` (CommonInquiry 모델)
  - ✅ DB 테이블 생성 SQL: `database/sql/create_inquiry_table.sql`
  - ✅ 백엔드 스키마: `backend/app/schemas/inquiry.py`
  - ✅ 백엔드 엔드포인트: `backend/app/api/v1/endpoints/inquiries.py` (CRUD + 답변)
  - ✅ Dashboard 엔드포인트: `backend/app/api/v1/endpoints/dashboard.py`에 inquiries 엔드포인트 추가
  - ✅ 프론트엔드 API 클라이언트: `frontend/lib/api/inquiries.ts`
  - ✅ 프론트엔드 폼 제출: `frontend/app/contact/page.tsx`에 실제 API 호출 연동
  - ✅ 프론트엔드 문의 목록: `frontend/app/dashboard/inquiries/page.tsx`에 실제 API 호출 연동

---

### 3. 정적 페이지들 (API 연동 불필요하지만 DB 연동 가능)
**프론트엔드 페이지**:
- `frontend/app/about/page.tsx` - 정적 페이지 (연동 불필요)
- `frontend/app/services/page.tsx` - 정적 페이지 (연동 불필요)
- `frontend/app/docs/page.tsx` - 정적 페이지 (연동 불필요)
- `frontend/app/privacy/page.tsx` - 정적 페이지 (연동 불필요)
- `frontend/app/terms/page.tsx` - 정적 페이지 (연동 불필요)

**참고**: 이 페이지들은 정적 콘텐츠이므로 API 연동이 필요하지 않습니다.

---

## 🟢 백엔드 모델은 있지만 프론트엔드에서 미사용

### 4. 알림(Notifications) 기능
- ✅ **구현 완료**: 알림 기능이 완전히 구현됨
  - ✅ 백엔드 엔드포인트: `board_extra.py`에 있음
  - ✅ 프론트엔드 UI 컴포넌트: `frontend/components/common/NotificationDropdown.tsx`
  - ✅ 프론트엔드 페이지: `frontend/app/notifications/page.tsx`
  - ✅ API 클라이언트: `frontend/lib/api/reports.ts`에 `notificationApi` 사용 중

---

### 5. 사용자 설정(User Preferences) 기능
- ✅ **구현 완료**: 사용자 설정 기능이 완전히 구현됨
  - ✅ 백엔드 엔드포인트: `board_extra.py`에 있음
  - ✅ 프론트엔드 페이지: `frontend/app/settings/page.tsx`
  - ✅ API 클라이언트: `frontend/lib/api/reports.ts`에 `userPreferenceApi` 사용 중

---

### 6. 통계(Statistics) 기능
- ✅ **구현 완료**: 통계 기능이 완전히 구현됨
  - ✅ 백엔드 엔드포인트: `boards.py`에 있음
  - ✅ 프론트엔드 페이지: `frontend/app/statistics/page.tsx`
  - ✅ API 클라이언트: `frontend/lib/api/reports.ts`에 `statisticsApi` 사용 중

---

### 7. 활동 로그(Activity Logs) 기능
**백엔드 모델**: `bbs_activity_logs` 테이블
- ✅ **백엔드 엔드포인트 구현 완료**: `GET /api/v1/logs/activity` - 활동 로그 조회
- ✅ **백엔드 스키마**: `backend/app/schemas/logs.py`에 `ActivityLogResponse` 정의
- ✅ **백엔드 엔드포인트**: `backend/app/api/v1/endpoints/logs.py`에 구현

**프론트엔드**:
- ✅ **구현 완료**: 활동 로그 페이지 구현됨
  - ✅ API 클라이언트: `frontend/lib/api/logs.ts`에 `logsApi.getActivityLogs` 정의
  - ✅ 프론트엔드 페이지: `frontend/app/dashboard/activity-logs/page.tsx`

---

### 8. 게시글 히스토리(Post History) 기능
**백엔드 모델**: `bbs_post_history` 테이블
- ✅ **백엔드 엔드포인트 구현 완료**: `GET /api/v1/logs/post-history/{post_id}` - 게시글 히스토리 조회
- ✅ **백엔드 스키마**: `backend/app/schemas/logs.py`에 `PostHistoryResponse` 정의
- ✅ **백엔드 엔드포인트**: `backend/app/api/v1/endpoints/logs.py`에 구현

**프론트엔드**:
- ✅ **구현 완료**: 게시글 히스토리 페이지 구현됨
  - ✅ API 클라이언트: `frontend/lib/api/logs.ts`에 `logsApi.getPostHistory` 정의
  - ✅ 프론트엔드 페이지: `frontend/app/dashboard/post-history/[postId]/page.tsx`

---

### 9. 검색 로그(Search Logs) 기능
**백엔드 모델**: `bbs_search_logs` 테이블
- ✅ **백엔드 엔드포인트 구현 완료**: `GET /api/v1/logs/search` - 검색 로그 조회 (관리자는 전체, 일반 사용자는 자신의 로그만)
- ✅ **백엔드 스키마**: `backend/app/schemas/logs.py`에 `SearchLogResponse` 정의
- ✅ **백엔드 엔드포인트**: `backend/app/api/v1/endpoints/logs.py`에 구현

**프론트엔드**:
- ✅ **구현 완료**: 검색 로그 페이지 구현됨
  - ✅ API 클라이언트: `frontend/lib/api/logs.ts`에 `logsApi.getSearchLogs` 정의
  - ✅ 프론트엔드 페이지: `frontend/app/dashboard/search-logs/page.tsx`

---

### 10. 관리자 로그(Admin Logs) 기능
**백엔드 모델**: `bbs_admin_logs` 테이블
- ✅ **백엔드 엔드포인트 구현 완료**: `GET /api/v1/logs/admin` - 관리자 로그 조회 (관리자만)
- ✅ **백엔드 스키마**: `backend/app/schemas/logs.py`에 `AdminLogResponse` 정의
- ✅ **백엔드 엔드포인트**: `backend/app/api/v1/endpoints/logs.py`에 구현

**프론트엔드**:
- ✅ **구현 완료**: 관리자 로그 페이지 구현됨
  - ✅ API 클라이언트: `frontend/lib/api/logs.ts`에 `logsApi.getAdminLogs` 정의
  - ✅ 프론트엔드 페이지: `frontend/app/admin/logs/page.tsx`

---

## 📊 요약

### ✅ 구현 완료된 기능
1. ✅ **Dashboard API 엔드포인트** - 백엔드 및 프론트엔드 모두 구현 완료
2. ✅ **Contact/Inquiry 기능** - 백엔드 및 프론트엔드 모두 구현 완료
3. ✅ **알림(Notifications) UI** - 백엔드 및 프론트엔드 모두 구현 완료
4. ✅ **사용자 설정(User Preferences) UI** - 백엔드 및 프론트엔드 모두 구현 완료
5. ✅ **통계(Statistics) 페이지** - 백엔드 및 프론트엔드 모두 구현 완료
6. ✅ **활동 로그(Activity Logs)** - 백엔드 및 프론트엔드 모두 구현 완료
7. ✅ **게시글 히스토리(Post History)** - 백엔드 및 프론트엔드 모두 구현 완료
8. ✅ **검색 로그(Search Logs)** - 백엔드 및 프론트엔드 모두 구현 완료
9. ✅ **관리자 로그(Admin Logs)** - 백엔드 및 프론트엔드 모두 구현 완료

### 🔧 개선 가능한 사항 (선택사항)
1. **대시보드 네비게이션 개선** - 활동 로그, 검색 로그 페이지로 가는 링크 추가
2. **게시글 상세 페이지** - 게시글 히스토리 보기 버튼 추가
3. **사이드바/메뉴 통합** - 로그 관련 페이지들을 쉽게 접근할 수 있는 메뉴 구성

---

## 📝 참고사항

- 프론트엔드의 `dashboard.ts`, `reports.ts` 파일에 API 함수들이 정의되어 있지만, 실제로 사용되지 않는 경우가 많습니다.
- 일부 페이지는 TODO 주석으로 "API 호출로 실제 데이터 로드"라고 표시되어 있습니다.
- `board-extra` 엔드포인트에 일부 기능이 있지만, dashboard 전용 엔드포인트가 없어 프론트엔드에서 사용하기 어려울 수 있습니다.
