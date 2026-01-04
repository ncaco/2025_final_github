#!/usr/bin/env python3
"""
팔로우 테이블 외래키 제약조건 제거 스크립트
"""

import sys
import os
sys.path.append('.')

from app.database import engine
from sqlalchemy import text

def drop_follow_constraints():
    try:
        with engine.connect() as conn:
            print('데이터베이스 연결 성공')

            # 현재 제약조건 확인
            print('현재 팔로우 테이블 제약조건 확인...')
            result = conn.execute(text("""
                SELECT conname, contype, conrelid::regclass, confrelid::regclass
                FROM pg_constraint
                WHERE conrelid = 'bbs_follows'::regclass
                ORDER BY conname
            """))

            constraints = result.fetchall()
            print(f'발견된 제약조건: {len(constraints)}개')
            for constraint in constraints:
                print(f'  - {constraint[0]} ({constraint[1]})')

            # following_id에 대한 외래키 제약조건 제거
            print('following_id 외래키 제약조건 제거 중...')
            result = conn.execute(text("""
                SELECT conname
                FROM pg_constraint
                WHERE conrelid = 'bbs_follows'::regclass
                AND conname LIKE '%following_id%'
                AND contype = 'f'
            """))

            fk_constraints = result.fetchall()
            for constraint in fk_constraints:
                constraint_name = constraint[0]
                print(f'제약조건 제거: {constraint_name}')
                conn.execute(text(f'ALTER TABLE bbs_follows DROP CONSTRAINT IF EXISTS {constraint_name}'))

            # UNIQUE 제약조건도 확인 (follower_id, following_id, typ)
            print('UNIQUE 제약조건 확인...')
            result = conn.execute(text("""
                SELECT conname
                FROM pg_constraint
                WHERE conrelid = 'bbs_follows'::regclass
                AND contype = 'u'
            """))

            unique_constraints = result.fetchall()
            for constraint in unique_constraints:
                constraint_name = constraint[0]
                print(f'UNIQUE 제약조건: {constraint_name}')

            conn.commit()
            print('✅ 팔로우 테이블 제약조건 정리 완료')

            # 최종 확인
            result = conn.execute(text("""
                SELECT conname, contype
                FROM pg_constraint
                WHERE conrelid = 'bbs_follows'::regclass
            """))

            remaining = result.fetchall()
            print(f'남은 제약조건: {len(remaining)}개')
            for constraint in remaining:
                print(f'  - {constraint[0]} ({constraint[1]})')

    except Exception as e:
        print(f'❌ 데이터베이스 작업 실패: {e}')
        return False

    return True

if __name__ == "__main__":
    success = drop_follow_constraints()
    if success:
        print('\n🎉 팔로우 테이블 제약조건 제거 완료!')
        print('이제 게시판 팔로우 기능이 정상 작동합니다.')
    else:
        print('\n❌ 팔로우 테이블 제약조건 제거 실패')
        sys.exit(1)
