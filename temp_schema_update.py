import os
from app.database import engine
from app.models import board
from sqlalchemy import text

# schema.sql 파일 읽기
schema_path = '../database/board_system/schema.sql'
with open(schema_path, 'r', encoding='utf-8') as f:
    schema_sql = f.read()

# SQL 실행
with engine.connect() as conn:
    # 기존 테이블들 삭제
    conn.execute(text('DROP TABLE IF EXISTS bbs_file_thumbnails CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_admin_logs CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_search_logs CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_user_preferences CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_post_history CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_activity_logs CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_follows CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_post_tags CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_tags CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_reports CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_notifications CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_bookmarks CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_comment_likes CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_post_likes CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_attachments CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_comments CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_posts CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_categories CASCADE;'))
    conn.execute(text('DROP TABLE IF EXISTS bbs_boards CASCADE;'))

    # ENUM 타입 삭제
    conn.execute(text('DROP TYPE IF EXISTS board_type CASCADE;'))
    conn.execute(text('DROP TYPE IF EXISTS permission_level CASCADE;'))
    conn.execute(text('DROP TYPE IF EXISTS post_status CASCADE;'))
    conn.execute(text('DROP TYPE IF EXISTS comment_status CASCADE;'))
    conn.execute(text('DROP TYPE IF EXISTS attachment_file_type CASCADE;'))
    conn.execute(text('DROP TYPE IF EXISTS like_type CASCADE;'))

    conn.commit()

    # 새로운 스키마 실행
    for statement in schema_sql.split(';'):
        statement = statement.strip()
        if statement and not statement.startswith('--'):
            conn.execute(text(statement))

    conn.commit()

print('데이터베이스 스키마 재생성 완료')
