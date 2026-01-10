-- ============================================
-- DCL (Data Control Language)
-- 데이터베이스 사용자 권한 관리
-- ============================================
-- 
-- 데이터베이스: PostgreSQL 12 이상
-- 작성일: 2024-12-21
-- ============================================
-- 
-- 주의사항:
-- 1. 실제 운영 환경에서는 강력한 비밀번호를 사용하세요.
-- 2. 최소 권한 원칙을 따르세요 (필요한 권한만 부여).
-- 3. 정기적으로 사용자 권한을 검토하세요.
-- ============================================

-- ============================================
-- 1. 애플리케이션 사용자 생성
-- ============================================
-- 애플리케이션이 사용할 데이터베이스 사용자
-- 모든 테이블에 대한 SELECT, INSERT, UPDATE, DELETE 권한 부여

-- 사용자 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'app_user') THEN
        CREATE USER app_user WITH PASSWORD 'app_password_123';
    END IF;
END
$$;

-- 데이터베이스 연결 권한 부여
GRANT CONNECT ON DATABASE common_db TO app_user;

-- 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA public TO app_user;

-- 모든 테이블에 대한 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- 시퀀스 사용 권한 부여 (SERIAL 컬럼 사용 시 필요)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- ============================================
-- 2. 읽기 전용 사용자 생성
-- ============================================
-- 리포트, 분석 등 읽기 전용 작업용 사용자
-- SELECT 권한만 부여

-- 사용자 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'readonly_user') THEN
        CREATE USER readonly_user WITH PASSWORD 'readonly_password_123';
    END IF;
END
$$;

-- 데이터베이스 연결 권한 부여
GRANT CONNECT ON DATABASE common_db TO readonly_user;

-- 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA public TO readonly_user;

-- 모든 테이블에 대한 읽기 권한 부여
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- 향후 생성될 테이블에 대한 기본 읽기 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT ON TABLES TO readonly_user;

-- ============================================
-- 3. 백업 사용자 생성
-- ============================================
-- 데이터베이스 백업 작업용 사용자
-- SELECT 권한 부여 (pg_dump 사용 시 필요)

-- 사용자 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'backup_user') THEN
        CREATE USER backup_user WITH PASSWORD 'backup_password_123';
    END IF;
END
$$;

-- 데이터베이스 연결 권한 부여
GRANT CONNECT ON DATABASE common_db TO backup_user;

-- 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA public TO backup_user;

-- 모든 테이블에 대한 읽기 권한 부여
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- 향후 생성될 테이블에 대한 기본 읽기 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT ON TABLES TO backup_user;

-- ============================================
-- 4. 개발자 사용자 생성 (선택사항)
-- ============================================
-- 개발 환경에서 사용할 사용자
-- 모든 권한 부여 (개발 환경 전용)

-- 사용자 생성
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'dev_user') THEN
        CREATE USER dev_user WITH PASSWORD 'dev_password_123';
    END IF;
END
$$;

-- 데이터베이스 연결 권한 부여
GRANT CONNECT ON DATABASE common_db TO dev_user;

-- 스키마 사용 권한 부여
GRANT USAGE ON SCHEMA public TO dev_user;

-- 모든 테이블에 대한 모든 권한 부여
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dev_user;

-- 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL PRIVILEGES ON TABLES TO dev_user;

-- 시퀀스 권한 부여
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dev_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT ALL PRIVILEGES ON SEQUENCES TO dev_user;

-- ============================================
-- 5. 사용자 권한 확인
-- ============================================
-- 생성된 사용자 및 권한 확인 쿼리

-- 모든 사용자 확인
-- SELECT usename FROM pg_user WHERE usename IN ('app_user', 'readonly_user', 'backup_user', 'dev_user');

-- 특정 사용자의 권한 확인
-- \du app_user
-- \du readonly_user
-- \du backup_user
-- \du dev_user

-- 테이블별 권한 확인
-- SELECT grantee, privilege_type 
-- FROM information_schema.role_table_grants 
-- WHERE table_schema = 'public' AND grantee = 'app_user';

-- ============================================
-- 6. 사용자 비밀번호 변경 (필요시)
-- ============================================
-- 비밀번호 변경 예시 (실제 사용 시 주석 해제)
-- ALTER USER app_user WITH PASSWORD 'new_password_123';
-- ALTER USER readonly_user WITH PASSWORD 'new_password_123';
-- ALTER USER backup_user WITH PASSWORD 'new_password_123';
-- ALTER USER dev_user WITH PASSWORD 'new_password_123';

-- ============================================
-- 7. 사용자 삭제 (필요시)
-- ============================================
-- 사용자 삭제 예시 (실제 사용 시 주석 해제)
-- DROP USER IF EXISTS app_user;
-- DROP USER IF EXISTS readonly_user;
-- DROP USER IF EXISTS backup_user;
-- DROP USER IF EXISTS dev_user;

-- ============================================
-- 8. 보안 권장사항
-- ============================================
-- 
-- 1. 비밀번호 정책
--    - 최소 12자 이상
--    - 대소문자, 숫자, 특수문자 포함
--    - 정기적인 비밀번호 변경
--
-- 2. 네트워크 접근 제어
--    - pg_hba.conf 파일에서 접근 제어 설정
--    - 필요한 호스트에서만 접근 허용
--    - 방화벽 규칙 설정
--    - VPN 또는 SSH 터널 사용 권장
--
-- 3. 권한 최소화
--    - 필요한 권한만 부여
--    - 읽기 전용 사용자는 SELECT만 부여
--    - 애플리케이션 사용자는 DDL 권한 제외
--
-- 4. 정기 점검
--    - 사용자 목록 정기 검토
--    - 사용하지 않는 사용자 삭제
--    - 권한 변경 이력 관리
--
-- 5. 감사 로그
--    - PostgreSQL 로그 설정 (log_statement 등)
--    - 데이터베이스 접근 로그 모니터링
--    - 비정상적인 접근 패턴 감지
--
-- 6. pg_hba.conf 설정 예시
--    # 애플리케이션 사용자 (로컬 연결)
--    host    common_db    app_user    127.0.0.1/32    md5
--    
--    # 읽기 전용 사용자 (특정 IP)
--    host    common_db    readonly_user    192.168.1.0/24    md5
--
-- ============================================
-- 사용자 권한 설정 완료
-- ============================================
