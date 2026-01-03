import requests

# API 테스트
try:
    response = requests.get("http://localhost:8000/")
    print(f"루트 엔드포인트 응답: {response.status_code}")
    print(f"응답 내용: {response.json()}")
except Exception as e:
    print(f"API 호출 실패: {e}")

# 게시판 API 테스트 (인증 없이)
try:
    response = requests.get("http://localhost:8000/api/v1/boards/boards")
    print(f"게시판 API 응답: {response.status_code}")
    if response.status_code == 200:
        print(f"응답 내용: {response.json()}")
    else:
        print(f"응답 텍스트: {response.text}")
except Exception as e:
    print(f"게시판 API 호출 실패: {e}")
