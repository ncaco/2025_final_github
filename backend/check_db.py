from app.main import app
from app.database import engine
from app.models import board
from sqlalchemy import text

print('데이터베이스 연결 테스트...')
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('데이터베이스 연결 성공')
except Exception as e:
    print(f'데이터베이스 연결 실패: {e}')

print('게시판 테이블 확인...')
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT COUNT(*) FROM bbs_boards'))
        count = result.fetchone()[0]
        print(f'게시판 테이블에 {count}개의 레코드가 있습니다.')
except Exception as e:
    print(f'게시판 테이블 확인 실패: {e}')

print('게시판 테이블 구조 확인...')
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'bbs_boards' ORDER BY ordinal_position"))
        columns = [row[0] for row in result.fetchall()]
        print(f'게시판 테이블 칼럼들: {columns}')
except Exception as e:
    print(f'게시판 테이블 구조 확인 실패: {e}')
