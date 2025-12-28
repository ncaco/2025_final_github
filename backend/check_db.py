#!/usr/bin/env python3
"""데이터베이스 테이블 확인 스크립트"""

from app.database import engine
from sqlalchemy import text

def main():
    try:
        with engine.connect() as conn:
            # 테이블 목록 조회
            result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
            tables = result.fetchall()

            print("Database tables:")
            for table in tables:
                print(f"  - {table[0]}")

            # common_file 테이블 존재 여부 확인
            result = conn.execute(text("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'common_file')"))
            exists = result.fetchone()[0]

            if exists:
                print("\n✅ common_file table exists!")

                # 테이블 구조 확인
                result = conn.execute(text("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'common_file' ORDER BY ordinal_position"))
                columns = result.fetchall()

                print("\ncommon_file table columns:")
                for col in columns:
                    print(f"  - {col[0]}: {col[1]} ({'NULL' if col[2] == 'YES' else 'NOT NULL'})")
            else:
                print("\n❌ common_file table does NOT exist!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()