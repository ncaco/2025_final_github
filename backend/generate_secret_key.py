"""SECRET_KEY 생성 스크립트"""
import secrets

if __name__ == "__main__":
    secret_key = secrets.token_urlsafe(64)
    print("\n" + "=" * 60)
    print("생성된 SECRET_KEY:")
    print("=" * 60)
    print(secret_key)
    print("=" * 60)
    print("\n.env 파일에 다음과 같이 추가하세요:")
    print(f"SECRET_KEY={secret_key}")
    print()

