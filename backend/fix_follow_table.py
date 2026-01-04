#!/usr/bin/env python3
"""
팔로우 테이블 외래키 제약조건 수정 스크립트
"""

import sys
import os
sys.path.append('.')

from app.database import engine
from sqlalchemy import text

def fix_follow_table():
    try:
        with engine.connect() as conn:
            print('데이터베이스 연결 성공')

            # 기존 팔로우 테이블의 외래키 제약조건 제거
            print('팔로우 테이블 외래키 제약조건 제거 중...')

            # following_id에 대한 외래키 제약조건 찾기 및 제거
            result = conn.execute(text("""
                SELECT conname
                FROM pg_constraint
                WHERE conrelid = 'bbs_follows'::regclass
                AND conname LIKE '%following_id%'
            """))

            constraints = result.fetchall()
            for constraint in constraints:
                constraint_name = constraint[0]
                print(f'제약조건 제거: {constraint_name}')
                conn.execute(text(f'ALTER TABLE bbs_follows DROP CONSTRAINT IF EXISTS {constraint_name}'))

            conn.commit()
            print('✅ 팔로우 테이블 외래키 제약조건 제거 완료')

            # follower_id의 외래키는 유지 (사용자 팔로우용)
            print('✅ follower_id 외래키 제약조건 유지 (사용자 팔로우용)')

    except Exception as e:
        print(f'❌ 데이터베이스 작업 실패: {e}')
        return False

    return True

if __name__ == "__main__":
    success = fix_follow_table()
    if success:
        print('\n🎉 팔로우 테이블 수정 완료!')
        print('이제 게시판 팔로우 기능이 정상 작동합니다.')
    else:
        print('\n❌ 팔로우 테이블 수정 실패')
        sys.exit(1)
