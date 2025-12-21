-- ============================================
-- DML (Data Manipulation Language)
-- 초기 데이터 삽입 (시드 데이터)
-- ============================================
-- 
-- 데이터베이스: PostgreSQL 12 이상
-- 작성일: 2024-12-21
-- ============================================

-- 스키마 설정
SET search_path TO public;

-- ============================================
-- 1. COMMON_ROLE (역할) 초기 데이터
-- ============================================
INSERT INTO COMMON_ROLE (
    ROLE_ID, ROLE_CD, ROLE_NM, DSC, ACTV_YN, 
    CRT_BY, CRT_BY_NM, USE_YN
) VALUES
('ROLE_ADMIN_001', 'ADMIN', '관리자', '시스템 관리자 역할', TRUE, 'SYSTEM', '시스템', TRUE),
('ROLE_USER_001', 'USER', '일반 사용자', '일반 사용자 역할', TRUE, 'SYSTEM', '시스템', TRUE),
('ROLE_MODERATOR_001', 'MODERATOR', '모더레이터', '컨텐츠 모더레이터 역할', TRUE, 'SYSTEM', '시스템', TRUE)
ON CONFLICT (ROLE_ID) DO UPDATE 
    SET ROLE_NM = EXCLUDED.ROLE_NM,
        DSC = EXCLUDED.DSC,
        UPD_DT = CURRENT_TIMESTAMP;

-- ============================================
-- 2. COMMON_PERMISSION (권한) 초기 데이터
-- ============================================
INSERT INTO COMMON_PERMISSION (
    PERMISSION_ID, PERMISSION_CD, PERMISSION_NM, DSC, RSRC, ACT, ACTV_YN,
    CRT_BY, CRT_BY_NM, USE_YN
) VALUES
-- 사용자 관련 권한
('PERM_USER_CREATE_001', 'USER_CREATE', '사용자 생성', '사용자 생성 권한', 'USER', 'CREATE', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_USER_READ_001', 'USER_READ', '사용자 조회', '사용자 조회 권한', 'USER', 'READ', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_USER_UPDATE_001', 'USER_UPDATE', '사용자 수정', '사용자 수정 권한', 'USER', 'UPDATE', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_USER_DELETE_001', 'USER_DELETE', '사용자 삭제', '사용자 삭제 권한', 'USER', 'DELETE', TRUE, 'SYSTEM', '시스템', TRUE),
-- 파일 관련 권한
('PERM_FILE_CREATE_001', 'FILE_CREATE', '파일 업로드', '파일 업로드 권한', 'FILE', 'CREATE', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_FILE_READ_001', 'FILE_READ', '파일 조회', '파일 조회 권한', 'FILE', 'READ', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_FILE_UPDATE_001', 'FILE_UPDATE', '파일 수정', '파일 수정 권한', 'FILE', 'UPDATE', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_FILE_DELETE_001', 'FILE_DELETE', '파일 삭제', '파일 삭제 권한', 'FILE', 'DELETE', TRUE, 'SYSTEM', '시스템', TRUE),
-- 관리자 관련 권한
('PERM_ADMIN_READ_001', 'ADMIN_READ', '관리자 조회', '관리자 페이지 조회 권한', 'ADMIN', 'READ', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_ADMIN_UPDATE_001', 'ADMIN_UPDATE', '관리자 수정', '관리자 설정 수정 권한', 'ADMIN', 'UPDATE', TRUE, 'SYSTEM', '시스템', TRUE),
-- 역할 관련 권한
('PERM_ROLE_CREATE_001', 'ROLE_CREATE', '역할 생성', '역할 생성 권한', 'ROLE', 'CREATE', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_ROLE_READ_001', 'ROLE_READ', '역할 조회', '역할 조회 권한', 'ROLE', 'READ', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_ROLE_UPDATE_001', 'ROLE_UPDATE', '역할 수정', '역할 수정 권한', 'ROLE', 'UPDATE', TRUE, 'SYSTEM', '시스템', TRUE),
('PERM_ROLE_DELETE_001', 'ROLE_DELETE', '역할 삭제', '역할 삭제 권한', 'ROLE', 'DELETE', TRUE, 'SYSTEM', '시스템', TRUE)
ON CONFLICT (PERMISSION_ID) DO UPDATE 
    SET PERMISSION_NM = EXCLUDED.PERMISSION_NM,
        DSC = EXCLUDED.DSC,
        UPD_DT = CURRENT_TIMESTAMP;

-- ============================================
-- 3. COMMON_ROLE_PERMISSION (역할-권한 매핑) 초기 데이터
-- ============================================
-- 관리자: 모든 권한
INSERT INTO COMMON_ROLE_PERMISSION (
    ROLE_PERMISSION_ID, ROLE_ID, PERMISSION_ID,
    CRT_BY, CRT_BY_NM, USE_YN
) VALUES
('RP_ADMIN_USER_CREATE', 'ROLE_ADMIN_001', 'PERM_USER_CREATE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_USER_READ', 'ROLE_ADMIN_001', 'PERM_USER_READ_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_USER_UPDATE', 'ROLE_ADMIN_001', 'PERM_USER_UPDATE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_USER_DELETE', 'ROLE_ADMIN_001', 'PERM_USER_DELETE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_FILE_CREATE', 'ROLE_ADMIN_001', 'PERM_FILE_CREATE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_FILE_READ', 'ROLE_ADMIN_001', 'PERM_FILE_READ_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_FILE_UPDATE', 'ROLE_ADMIN_001', 'PERM_FILE_UPDATE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_FILE_DELETE', 'ROLE_ADMIN_001', 'PERM_FILE_DELETE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_ADMIN_READ', 'ROLE_ADMIN_001', 'PERM_ADMIN_READ_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_ADMIN_UPDATE', 'ROLE_ADMIN_001', 'PERM_ADMIN_UPDATE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_ROLE_CREATE', 'ROLE_ADMIN_001', 'PERM_ROLE_CREATE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_ROLE_READ', 'ROLE_ADMIN_001', 'PERM_ROLE_READ_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_ROLE_UPDATE', 'ROLE_ADMIN_001', 'PERM_ROLE_UPDATE_001', 'SYSTEM', '시스템', TRUE),
('RP_ADMIN_ROLE_DELETE', 'ROLE_ADMIN_001', 'PERM_ROLE_DELETE_001', 'SYSTEM', '시스템', TRUE),
-- 모더레이터: 사용자 조회, 파일 관리
('RP_MOD_USER_READ', 'ROLE_MODERATOR_001', 'PERM_USER_READ_001', 'SYSTEM', '시스템', TRUE),
('RP_MOD_FILE_CREATE', 'ROLE_MODERATOR_001', 'PERM_FILE_CREATE_001', 'SYSTEM', '시스템', TRUE),
('RP_MOD_FILE_READ', 'ROLE_MODERATOR_001', 'PERM_FILE_READ_001', 'SYSTEM', '시스템', TRUE),
('RP_MOD_FILE_UPDATE', 'ROLE_MODERATOR_001', 'PERM_FILE_UPDATE_001', 'SYSTEM', '시스템', TRUE),
('RP_MOD_FILE_DELETE', 'ROLE_MODERATOR_001', 'PERM_FILE_DELETE_001', 'SYSTEM', '시스템', TRUE),
-- 일반 사용자: 기본 권한
('RP_USER_FILE_CREATE', 'ROLE_USER_001', 'PERM_FILE_CREATE_001', 'SYSTEM', '시스템', TRUE),
('RP_USER_FILE_READ', 'ROLE_USER_001', 'PERM_FILE_READ_001', 'SYSTEM', '시스템', TRUE),
('RP_USER_FILE_UPDATE', 'ROLE_USER_001', 'PERM_FILE_UPDATE_001', 'SYSTEM', '시스템', TRUE),
('RP_USER_FILE_DELETE', 'ROLE_USER_001', 'PERM_FILE_DELETE_001', 'SYSTEM', '시스템', TRUE)
ON CONFLICT (ROLE_PERMISSION_ID) DO UPDATE 
    SET USE_YN = EXCLUDED.USE_YN,
        CRT_DT = CURRENT_TIMESTAMP;

-- ============================================
-- 4. COMMON_USER (사용자) 초기 데이터
-- ============================================
-- 주의: 실제 운영 환경에서는 비밀번호를 해시화하여 저장해야 합니다.
-- 예시: bcrypt, argon2 등을 사용하여 해시화
INSERT INTO COMMON_USER (
    USER_ID, EML, USERNAME, PWD_HASH, NM, NICKNAME,
    ACTV_YN, EML_VRF_YN, TELNO_VRF_YN,
    CRT_BY, CRT_BY_NM, USE_YN
) VALUES
-- 관리자 계정 (비밀번호: admin123! - 실제로는 해시화 필요)
('ADMIN_001', 'admin@example.com', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자', '관리자', TRUE, TRUE, TRUE, 'SYSTEM', '시스템', TRUE),
-- 테스트 사용자 계정 (비밀번호: user123! - 실제로는 해시화 필요)
('USER_001', 'user@example.com', 'user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '사용자', '사용자', TRUE, TRUE, FALSE, 'SYSTEM', '시스템', TRUE)
ON CONFLICT (USER_ID) DO UPDATE 
    SET EML = EXCLUDED.EML,
        USERNAME = EXCLUDED.USERNAME,
        UPD_DT = CURRENT_TIMESTAMP;

-- ============================================
-- 5. COMMON_USER_ROLE (사용자-역할 매핑) 초기 데이터
-- ============================================
INSERT INTO COMMON_USER_ROLE (
    USER_ROLE_ID, USER_ID, ROLE_ID, ASGN_BY, ASGN_DT,
    CRT_BY, CRT_BY_NM, USE_YN
) VALUES
('UR_ADMIN_001', 'ADMIN_001', 'ROLE_ADMIN_001', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM', '시스템', TRUE),
('UR_USER_001', 'USER_001', 'ROLE_USER_001', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM', '시스템', TRUE)
ON CONFLICT (USER_ROLE_ID) DO UPDATE 
    SET USE_YN = EXCLUDED.USE_YN,
        UPD_DT = CURRENT_TIMESTAMP;

-- ============================================
-- 6. COMMON_LOCALE (다국어) 초기 데이터
-- ============================================
-- 한국어 (ko)
INSERT INTO COMMON_LOCALE (
    LOCALE_ID, LANG_CD, RSRC_TYP, RSRC_KEY, RSRC_VAL,
    CRT_BY, CRT_BY_NM, USE_YN
) VALUES
-- 공통 라벨
('LOCALE_KO_COMMON_001', 'ko', 'LABEL', 'common.save', '저장', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_COMMON_002', 'ko', 'LABEL', 'common.cancel', '취소', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_COMMON_003', 'ko', 'LABEL', 'common.delete', '삭제', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_COMMON_004', 'ko', 'LABEL', 'common.edit', '수정', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_COMMON_005', 'ko', 'LABEL', 'common.search', '검색', 'SYSTEM', '시스템', TRUE),
-- 메시지
('LOCALE_KO_MSG_001', 'ko', 'MESSAGE', 'msg.login.success', '로그인에 성공했습니다.', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_MSG_002', 'ko', 'MESSAGE', 'msg.login.fail', '로그인에 실패했습니다.', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_MSG_003', 'ko', 'MESSAGE', 'msg.save.success', '저장되었습니다.', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_MSG_004', 'ko', 'MESSAGE', 'msg.delete.success', '삭제되었습니다.', 'SYSTEM', '시스템', TRUE),
-- 에러 메시지
('LOCALE_KO_ERR_001', 'ko', 'ERROR', 'err.required', '필수 입력 항목입니다.', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_ERR_002', 'ko', 'ERROR', 'err.invalid', '유효하지 않은 값입니다.', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_ERR_003', 'ko', 'ERROR', 'err.unauthorized', '인증이 필요합니다.', 'SYSTEM', '시스템', TRUE),
('LOCALE_KO_ERR_004', 'ko', 'ERROR', 'err.forbidden', '권한이 없습니다.', 'SYSTEM', '시스템', TRUE)
ON CONFLICT (LOCALE_ID) DO UPDATE 
    SET RSRC_VAL = EXCLUDED.RSRC_VAL,
        UPD_DT = CURRENT_TIMESTAMP;

-- 영어 (en)
INSERT INTO COMMON_LOCALE (
    LOCALE_ID, LANG_CD, RSRC_TYP, RSRC_KEY, RSRC_VAL,
    CRT_BY, CRT_BY_NM, USE_YN
) VALUES
-- 공통 라벨
('LOCALE_EN_COMMON_001', 'en', 'LABEL', 'common.save', 'Save', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_COMMON_002', 'en', 'LABEL', 'common.cancel', 'Cancel', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_COMMON_003', 'en', 'LABEL', 'common.delete', 'Delete', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_COMMON_004', 'en', 'LABEL', 'common.edit', 'Edit', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_COMMON_005', 'en', 'LABEL', 'common.search', 'Search', 'SYSTEM', '시스템', TRUE),
-- 메시지
('LOCALE_EN_MSG_001', 'en', 'MESSAGE', 'msg.login.success', 'Login successful.', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_MSG_002', 'en', 'MESSAGE', 'msg.login.fail', 'Login failed.', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_MSG_003', 'en', 'MESSAGE', 'msg.save.success', 'Saved successfully.', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_MSG_004', 'en', 'MESSAGE', 'msg.delete.success', 'Deleted successfully.', 'SYSTEM', '시스템', TRUE),
-- 에러 메시지
('LOCALE_EN_ERR_001', 'en', 'ERROR', 'err.required', 'This field is required.', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_ERR_002', 'en', 'ERROR', 'err.invalid', 'Invalid value.', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_ERR_003', 'en', 'ERROR', 'err.unauthorized', 'Authentication required.', 'SYSTEM', '시스템', TRUE),
('LOCALE_EN_ERR_004', 'en', 'ERROR', 'err.forbidden', 'Access forbidden.', 'SYSTEM', '시스템', TRUE)
ON CONFLICT (LOCALE_ID) DO UPDATE 
    SET RSRC_VAL = EXCLUDED.RSRC_VAL,
        UPD_DT = CURRENT_TIMESTAMP;

-- ============================================
-- 초기 데이터 삽입 완료
-- ============================================
-- 
-- 참고사항:
-- 1. 비밀번호는 실제 운영 환경에서 반드시 해시화하여 저장해야 합니다.
-- 2. 초기 관리자 계정의 비밀번호는 첫 로그인 시 변경하도록 권장합니다.
-- 3. 시드 데이터는 개발/테스트 환경에서만 사용하고, 운영 환경에서는 제거하거나 수정해야 합니다.
-- ============================================
