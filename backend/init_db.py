from app.database import engine, Base
from app.models import board
import os

# 데이터베이스 초기화
try:
    # 기존 테이블 삭제
    Base.metadata.drop_all(bind=engine)
    print("기존 테이블 삭제 완료")

    # 새로운 스키마 생성
    Base.metadata.create_all(bind=engine)
    print("새로운 스키마 생성 완료")

    print("데이터베이스 초기화 성공")

except Exception as e:
    print(f"데이터베이스 초기화 실패: {e}")
    print("수동으로 데이터베이스를 초기화해야 할 수 있습니다.")
