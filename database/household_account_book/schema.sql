-- 가계부 시스템 데이터베이스 스키마
-- PostgreSQL 기준으로 작성

-- ENUM 타입 정의
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE payment_method_type AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'ETC');
CREATE TYPE account_type AS ENUM ('BANK', 'CREDIT_CARD', 'CASH', 'INVESTMENT');

-- 사용자 테이블
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 사용자 테이블 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 카테고리 테이블
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type transaction_type NOT NULL,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    color VARCHAR(7), -- #RRGGBB 형식
    icon VARCHAR(50),
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 제약조건
    CONSTRAINT chk_color_format CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT chk_circular_reference CHECK (id != parent_id)
);

-- 카테고리 테이블 인덱스
CREATE INDEX idx_categories_user_type ON categories(user_id, type);
CREATE INDEX idx_categories_user_parent ON categories(user_id, parent_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- 사용자별 카테고리명 중복 방지
CREATE UNIQUE INDEX idx_categories_user_name ON categories(user_id, name);

-- 계좌 테이블 (선택사항)
CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type account_type NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'KRW',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 계좌 테이블 인덱스
CREATE INDEX idx_accounts_user_active ON accounts(user_id, is_active);

-- 거래 테이블
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    account_id BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(500),
    transaction_date DATE NOT NULL,
    transaction_time TIME,
    payment_method payment_method_type,
    location VARCHAR(255),
    tags JSONB, -- PostgreSQL JSONB 타입 사용
    receipt_image_url VARCHAR(500),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- 제약조건
    CONSTRAINT chk_amount_not_zero CHECK (amount != 0),
    CONSTRAINT chk_amount_range CHECK (amount >= -100000000 AND amount <= 100000000),
    CONSTRAINT chk_future_date CHECK (transaction_date <= CURRENT_DATE),
    CONSTRAINT chk_tags_format CHECK (tags IS NULL OR jsonb_typeof(tags) = 'array')
);

-- 거래 테이블 인덱스
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_account ON transactions(account_id);

-- 복합 인덱스 (성능 최적화)
CREATE INDEX idx_transactions_user_date_category ON transactions(user_id, transaction_date, category_id);
CREATE INDEX idx_transactions_user_amount ON transactions(user_id, amount);

-- 트리거 함수: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 설정
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 카테고리 데이터 삽입
INSERT INTO categories (user_id, name, type, color, icon, description, is_default) VALUES
-- 시스템 기본 카테고리들 (user_id = 0은 시스템용)
(0, '식비', 'EXPENSE', '#FF6B6B', 'utensils', '식사 및 음료 관련 지출', TRUE),
(0, '교통비', 'EXPENSE', '#4ECDC4', 'car', '대중교통, 주유, 택시 등 교통 관련 지출', TRUE),
(0, '생활비', 'EXPENSE', '#45B7D1', 'home', '생활용품, 공과금, 가정용품 등', TRUE),
(0, '의료비', 'EXPENSE', '#96CEB4', 'stethoscope', '병원비, 약값, 건강보험 등', TRUE),
(0, '교육비', 'EXPENSE', '#FFEAA7', 'book', '학원비, 책값, 교육 관련 지출', TRUE),
(0, '문화생활비', 'EXPENSE', '#DDA0DD', 'film', '영화, 공연, 취미 활동 등', TRUE),
(0, '패션/미용', 'EXPENSE', '#98D8C8', 'scissors', '의류, 미용, 패션 관련 지출', TRUE),
(0, '기타지출', 'EXPENSE', '#F7DC6F', 'ellipsis-h', '기타 분류되지 않은 지출', TRUE),

-- 수입 카테고리
(0, '급여', 'INCOME', '#2ECC71', 'briefcase', '월급, 상여금 등 근로 소득', TRUE),
(0, '사업소득', 'INCOME', '#3498DB', 'building', '사업 활동으로 인한 소득', TRUE),
(0, '투자소득', 'INCOME', '#9B59B6', 'chart-line', '주식, 부동산 등 투자 수익', TRUE),
(0, '기타수입', 'INCOME', '#E74C3C', 'plus-circle', '기타 수입', TRUE);

-- 뷰: 거래 요약 정보
CREATE VIEW transaction_summary AS
SELECT
    t.user_id,
    DATE_TRUNC('month', t.transaction_date) as month,
    c.type,
    c.name as category_name,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount,
    MIN(t.amount) as min_amount,
    MAX(t.amount) as max_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, DATE_TRUNC('month', t.transaction_date), c.type, c.name;

-- 뷰: 월별 수입/지출 합계
CREATE VIEW monthly_balance AS
SELECT
    user_id,
    DATE_TRUNC('month', transaction_date) as month,
    SUM(CASE WHEN c.type = 'INCOME' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN c.type = 'EXPENSE' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN c.type = 'INCOME' THEN amount ELSE -amount END) as net_balance
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY user_id, DATE_TRUNC('month', t.transaction_date)
ORDER BY user_id, month;

-- 함수: 사용자별 카테고리 계층 조회
CREATE OR REPLACE FUNCTION get_category_hierarchy(user_id_param BIGINT)
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(100),
    type transaction_type,
    parent_id BIGINT,
    level INTEGER,
    path VARCHAR(1000)
) AS $$
WITH RECURSIVE category_tree AS (
    -- 루트 카테고리
    SELECT
        c.id,
        c.name,
        c.type,
        c.parent_id,
        1 as level,
        c.name as path
    FROM categories c
    WHERE c.user_id = user_id_param AND c.parent_id IS NULL

    UNION ALL

    -- 하위 카테고리
    SELECT
        c.id,
        c.name,
        c.type,
        c.parent_id,
        ct.level + 1,
        ct.path || ' > ' || c.name
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
    WHERE c.user_id = user_id_param
)
SELECT * FROM category_tree
ORDER BY path;
$$ LANGUAGE SQL;

-- Row Level Security (RLS) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 데이터만 접근 가능
CREATE POLICY users_policy ON users FOR ALL USING (id = current_user_id());
CREATE POLICY categories_policy ON categories FOR ALL USING (user_id = current_user_id());
CREATE POLICY accounts_policy ON accounts FOR ALL USING (user_id = current_user_id());
CREATE POLICY transactions_policy ON transactions FOR ALL USING (user_id = current_user_id());

-- current_user_id() 함수 (실제 구현에서는 JWT나 세션에서 사용자 ID를 가져와야 함)
CREATE OR REPLACE FUNCTION current_user_id() RETURNS BIGINT AS $$
BEGIN
    -- 실제 구현에서는 JWT 토큰이나 세션에서 사용자 ID를 추출
    -- 여기서는 임시로 1을 반환
    RETURN 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 주석
COMMENT ON TABLE users IS '가계부 사용자 정보';
COMMENT ON TABLE categories IS '거래 분류를 위한 카테고리';
COMMENT ON TABLE accounts IS '사용자의 금융 계좌 정보';
COMMENT ON TABLE transactions IS '개별 수입/지출 거래 내역';
COMMENT ON VIEW transaction_summary IS '거래 요약 정보 뷰';
COMMENT ON VIEW monthly_balance IS '월별 수입/지출 합계 뷰';
COMMENT ON FUNCTION get_category_hierarchy IS '사용자별 카테고리 계층 구조 조회 함수';
