-- ============================================
-- COMMON_PHONE_VERIFICATION 테이블 삭제 스크립트
-- ============================================
-- 
-- 전화번호 인증 기능 제거를 위한 테이블 삭제 스크립트
-- 실행 전 백업을 권장합니다.
-- ============================================

-- 외래키 제약조건이 있는 경우 먼저 제거
-- (COMMON_USER 테이블과의 관계)

-- 테이블이 존재하는 경우에만 삭제
DROP TABLE IF EXISTS COMMON_PHONE_VERIFICATION CASCADE;

-- 관련 인덱스도 자동으로 삭제됨 (CASCADE 옵션으로)
-- 하지만 명시적으로 확인할 수 있도록 주석으로 남김:
-- - idx_phone_verification_telno_expr
-- - idx_phone_verification_user_id
-- - idx_phone_verification_vrf_dt
-- - idx_phone_verification_phone_verification_id (UNIQUE 제약조건)

-- 삭제 완료 확인
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name = 'COMMON_PHONE_VERIFICATION';
-- 결과가 없으면 삭제 완료
