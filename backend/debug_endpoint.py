import asyncio
from app.api.v1.endpoints.boards import get_boards
from app.database import get_db

async def test_endpoint():
    print("게시판 엔드포인트 직접 호출 테스트...")
    try:
        # 데이터베이스 세션 생성
        db = next(get_db())

        # 엔드포인트 함수 직접 호출
        result = await get_boards(db=db, skip=0, limit=100)
        print(f"성공: {result}")

    except Exception as e:
        print(f"엔드포인트 호출 실패: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
            db.close()
        except:
            pass

# 비동기 함수 실행
asyncio.run(test_endpoint())
