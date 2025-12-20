# 프론트엔드

Next.js 기반 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Next.js**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안정성을 위한 언어

## 사전 요구사항

- **Node.js** (v18 이상 권장)
- **npm** 또는 **yarn** 또는 **pnpm**

## 설치 및 실행

### 1. 의존성 설치

```powershell
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

프로젝트 루트 또는 `frontend` 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 개발 서버 실행

```powershell
# 개발 서버 실행
npm run dev
```

또는 별도 터미널에서:

```powershell
cd ./frontend; npm run dev
```

### 4. 접속

개발 서버가 실행되면 다음 URL에서 접속할 수 있습니다:

- **프론트엔드**: http://localhost:3000

## 프로젝트 구조

```
frontend/
├── app/                 # Next.js App Router (app 디렉토리)
│   ├── layout.tsx      # 루트 레이아웃
│   ├── page.tsx        # 홈 페이지
│   └── api/            # API 라우트 (선택사항)
├── components/         # 재사용 가능한 컴포넌트
├── lib/                # 유틸리티 함수 및 설정
├── public/             # 정적 파일
├── styles/             # 스타일 파일
├── types/              # TypeScript 타입 정의
├── .env.local          # 환경 변수 (로컬)
├── next.config.js      # Next.js 설정
├── package.json        # 의존성 및 스크립트
└── tsconfig.json       # TypeScript 설정
```

## 코딩 컨벤션

### TypeScript/JavaScript 명명 규칙

- **변수/함수명**: 카멜 케이스 (예: `userName`, `getUserData`)
- **컴포넌트명**: 파스칼 케이스 (예: `UserProfile`, `StockCalculator`)
- **상수**: 대문자 스네이크 케이스 (예: `API_BASE_URL`, `MAX_RETRY_COUNT`)
- **인터페이스/타입**: 파스칼 케이스 (예: `UserData`, `ApiResponse`)

### 파일 및 폴더 명명 규칙

- **컴포넌트 파일**: 파스칼 케이스 (예: `UserProfile.tsx`)
- **유틸리티 파일**: 카멜 케이스 (예: `formatDate.ts`, `apiClient.ts`)
- **폴더명**: 소문자 스네이크 케이스 또는 카멜 케이스 (예: `user-profile`, `apiClient`)

### 코드 스타일 예시

```typescript
// 컴포넌트 예시
import React from 'react';

interface UserProfileProps {
  userName: string;
  email: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userName, email }) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleClick = () => {
    // 이벤트 핸들러
  };

  return (
    <div>
      <h1>{userName}</h1>
      <p>{email}</p>
    </div>
  );
};
```

## 주요 스크립트

```json
{
  "dev": "next dev",           // 개발 서버 실행
  "build": "next build",        // 프로덕션 빌드
  "start": "next start",        // 프로덕션 서버 실행
  "lint": "next lint"          // ESLint 실행
}
```

## API 연동

백엔드 API와 연동하는 예시:

```typescript
// lib/apiClient.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

// 사용 예시
const userData = await fetchData<UserData>('/api/users/1');
```

## 환경 변수

Next.js에서 환경 변수는 `NEXT_PUBLIC_` 접두사를 사용해야 클라이언트 사이드에서 접근할 수 있습니다.

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=2026 Challenge
```

서버 사이드 전용 환경 변수는 접두사 없이 사용할 수 있습니다:

```env
# .env.local (서버 전용)
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
```

## 빌드 및 배포

### 프로덕션 빌드

```powershell
# 빌드 생성
npm run build

# 프로덕션 서버 실행
npm run start
```

### 배포 옵션

- **Vercel**: Next.js 공식 호스팅 플랫폼 (권장)
- **Netlify**: 정적 사이트 호스팅
- **Docker**: 컨테이너 기반 배포

## 개발 팁

### Hot Reload

Next.js는 기본적으로 Hot Module Replacement (HMR)를 지원합니다. 파일을 저장하면 자동으로 변경사항이 반영됩니다.

### 디버깅

브라우저 개발자 도구를 사용하여 클라이언트 사이드 디버깅을 수행할 수 있습니다.

```typescript
// 콘솔 로그
console.log('Debug info:', data);

// React DevTools를 사용하여 컴포넌트 상태 확인
```

### 성능 최적화

- **이미지 최적화**: `next/image` 컴포넌트 사용
- **코드 스플리팅**: 동적 import 사용
- **캐싱**: 적절한 캐싱 전략 적용

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [React 공식 문서](https://react.dev/)

