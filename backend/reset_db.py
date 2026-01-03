import psycopg2
from psycopg2 import sql

# 데이터베이스 연결 정보
db_config = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'app_password_123!@#',  # env.local에서 확인한 비밀번호
    'database': 'postgres'  # 기본 데이터베이스에 연결
}

try:
    # postgres 데이터베이스에 연결
    conn = psycopg2.connect(**db_config)
    conn.autocommit = True
    cursor = conn.cursor()

    # common_db 데이터베이스 삭제
    cursor.execute("DROP DATABASE IF EXISTS common_db;")
    print("common_db 데이터베이스 삭제 완료")

    # common_db 데이터베이스 생성
    cursor.execute("CREATE DATABASE common_db WITH ENCODING 'UTF8';")
    print("common_db 데이터베이스 생성 완료")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"데이터베이스 초기화 실패: {e}")

print("데이터베이스 초기화 완료")
