# DBeaver로 PostgreSQL 접속 가이드

## DBeaver 설치

1. **DBeaver 다운로드**: https://dbeaver.io/download/
   - Community Edition (무료) 다운로드
   - Windows Installer 선택

2. **설치**: 다운로드한 설치 파일 실행

## 연결 설정

### 1단계: 새 데이터베이스 연결 생성

1. DBeaver 실행
2. 상단 메뉴에서 **"데이터베이스" → "새 데이터베이스 연결"** 클릭
   - 또는 `Ctrl+Shift+N` 단축키 사용
   - 또는 왼쪽 상단의 **"새 연결"** 버튼 클릭

### 2단계: PostgreSQL 선택

1. 데이터베이스 목록에서 **"PostgreSQL"** 선택
2. **"다음"** 클릭

### 3단계: 연결 정보 입력

**Main 탭:**

```
호스트: localhost
포트: 5432
데이터베이스: common_db
사용자 이름: app_user
비밀번호: app_password_123
```

**설정 방법:**
- **호스트**: `localhost` (로컬 Docker 컨테이너)
- **포트**: `5432` (기본 PostgreSQL 포트)
- **데이터베이스**: `common_db`
- **사용자 이름**: `app_user`
- **비밀번호**: `app_password_123`
- ✅ **비밀번호 저장** 체크 (선택사항)

### 4단계: 드라이버 다운로드 (처음 사용 시)

1. **"다운로드"** 버튼 클릭
2. PostgreSQL 드라이버가 자동으로 다운로드됨
3. 다운로드 완료 후 **"다음"** 클릭

### 5단계: 연결 테스트

1. **"연결 테스트"** 버튼 클릭
2. 성공 메시지가 나타나면 **"완료"** 클릭

## 연결 문자열 방식 (대안)

**연결 문자열** 탭에서:
```
jdbc:postgresql://localhost:5432/common_db
```

또는 전체 URL:
```
postgresql://app_user:app_password_123@localhost:5432/common_db
```

## 외부에서 접속하는 경우

### 같은 네트워크의 다른 컴퓨터

**호스트**를 서버의 IP 주소로 변경:
```
호스트: [서버IP주소]  (예: 192.168.1.100)
포트: 5432
데이터베이스: common_db
사용자 이름: app_user
비밀번호: app_password_123
```

### ngrok을 통한 인터넷 접속

1. ngrok TCP 터널 시작:
   ```powershell
   cd server
   .\ngrok-postgres.ps1
   ```

2. ngrok에서 제공하는 URL 확인 (예: `0.tcp.ngrok.io:12345`)

3. DBeaver 연결 설정:
   ```
   호스트: 0.tcp.ngrok.io
   포트: 12345
   데이터베이스: common_db
   사용자 이름: app_user
   비밀번호: app_password_123
   ```

## 연결 후 사용 방법

### 1. 데이터베이스 탐색
- 왼쪽 트리에서 `common_db` → `스키마` → `public` → `테이블` 확인
- 테이블을 더블클릭하면 데이터 확인 가능

### 2. SQL 쿼리 실행
1. 상단 메뉴에서 **"SQL 편집기" → "새 SQL 스크립트"** 클릭
2. SQL 쿼리 작성:
   ```sql
   SELECT * FROM users LIMIT 10;
   ```
3. `Ctrl+Enter` 또는 실행 버튼 클릭

### 3. 테이블 데이터 확인
- 테이블을 우클릭 → **"데이터 보기"** 선택
- 또는 테이블 더블클릭

## 문제 해결

### 연결 실패 시

**1. PostgreSQL 컨테이너가 실행 중인지 확인:**
```powershell
cd server
docker compose --env-file .env.production ps postgres
```

**2. 포트가 열려있는지 확인:**
```powershell
netstat -an | Select-String "5432"
```

**3. 방화벽 설정 확인:**
- Windows 방화벽에서 포트 5432가 허용되어 있는지 확인

**4. 연결 정보 재확인:**
- 호스트: `localhost` (로컬) 또는 `[서버IP]` (원격)
- 포트: `5432`
- 데이터베이스: `common_db`
- 사용자: `app_user`
- 비밀번호: `app_password_123`

### 드라이버 오류

**PostgreSQL 드라이버 재설치:**
1. DBeaver 메뉴: **"데이터베이스" → "드라이버 관리자"**
2. PostgreSQL 선택 → **"편집"**
3. **"라이브러리"** 탭에서 드라이버 재다운로드

### 타임아웃 오류

**연결 설정에서 타임아웃 증가:**
1. 연결 설정 → **"연결 설정"** 탭
2. **"연결 타임아웃"** 값을 증가 (예: 30초)

## 유용한 팁

### 1. 연결 저장
- 연결 정보를 저장하면 다음에 빠르게 접속 가능
- 왼쪽 트리에서 연결을 우클릭 → **"편집"**으로 설정 변경 가능

### 2. 여러 연결 관리
- 여러 데이터베이스에 연결할 수 있음
- 각 연결은 왼쪽 트리에서 별도로 관리

### 3. 데이터 내보내기/가져오기
- 테이블 우클릭 → **"데이터 내보내기"** 또는 **"데이터 가져오기"**
- CSV, Excel, JSON 등 다양한 형식 지원

### 4. ER 다이어그램 생성
- 데이터베이스 우클릭 → **"ER 다이어그램" → "다이어그램 생성"**
- 테이블 간 관계 시각화

## 빠른 참조

**연결 정보 요약:**
```
호스트: localhost
포트: 5432
데이터베이스: common_db
사용자: app_user
비밀번호: app_password_123
```

**JDBC URL:**
```
jdbc:postgresql://localhost:5432/common_db
```

**연결 문자열:**
```
postgresql://app_user:app_password_123@localhost:5432/common_db
```