from fastapi.testclient import TestClient
from app.main import app

# FastAPI TestClient를 사용해서 API 테스트
client = TestClient(app)

print("게시판 API 테스트...")
try:
    response = client.get("/api/v1/boards/boards")
    print(f"응답 상태 코드: {response.status_code}")
    print(f"응답 내용: {response.text}")
except Exception as e:
    print(f"API 호출 실패: {e}")
    import traceback
    traceback.print_exc()
