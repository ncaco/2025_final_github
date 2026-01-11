# 2026 챌린지

매월 하나의 주제를 정하여 MVP 서비스를 개발하는 개인 프로젝트입니다.  
이 프로젝트를 통해 다양한 기술 스택을 활용한 풀스택 개발 경험을 쌓고, 실용적인 서비스들을 빠르게 구현하는 능력을 향상시킵니다.

## 프로젝트 소개

2026년 한 해 동안 매월 하나씩 MVP 서비스를 개발하는 챌린지 프로젝트입니다. 각 서비스는 Next.js, FastAPI, PostgreSQL을 활용하여 풀스택으로 구현되며, 공공데이터 표준을 준수한 데이터베이스 설계와 RESTful API 설계 원칙을 따릅니다.

## 목표

- 매월 하나의 완성된 MVP 서비스 개발
- Next.js, FastAPI, PostgreSQL을 활용한 풀스택 개발 경험
- 공공데이터 표준을 준수한 데이터베이스 설계
- RESTful API 설계 및 구현
- 지속적인 학습과 성장

## 프로젝트 구조

```
2025_final_github/
├── frontend/          # Next.js 프론트엔드 애플리케이션
│   └── README.md      # 프론트엔드 상세 문서
├── backend/           # FastAPI 백엔드 애플리케이션
│   └── README.md      # 백엔드 상세 문서
├── database/          # 데이터베이스 스키마 및 마이그레이션 파일
│   ├── README.md      # 데이터베이스 상세 문서
│   └── 공공데이터 공통표준7차 제·개정(2024.11월).xlsx
├── README.md          # 프로젝트 소개 (현재 파일)
└── PLAN.md            # 프로젝트 계획 및 진행 상황
```

## 기술 스택

### 프론트엔드
- **Next.js**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안정성을 위한 언어

자세한 내용은 [frontend/README.md](frontend/README.md)를 참고하세요.

### 백엔드
- **FastAPI**: 고성능 Python 웹 프레임워크
- **Python**: 백엔드 개발 언어
- **uv**: 빠른 Python 패키지 관리자 (의존성 관리)
- **RESTful API**: 표준 REST API 설계 원칙 준수

자세한 내용은 [backend/README.md](backend/README.md)를 참고하세요.

### 데이터베이스
- **PostgreSQL**: 관계형 데이터베이스 관리 시스템
- **공공데이터 공통표준7차 제·개정(2024.11월)**: 데이터베이스 설계 표준 참고

자세한 내용은 [database/README.md](database/README.md)를 참고하세요.

## 빠른 시작

### 사전 요구사항

- **Node.js** (v18 이상 권장)
- **Python** (v3.11 이상 권장)
- **PostgreSQL** (v14 이상 권장)
- **uv** (Python 패키지 관리자)
- **Git**

### 설치 및 실행

1. **저장소 클론**
   ```powershell
   git clone <repository-url>
   cd 2025_final_github
   ```

2. **환경 변수 설정**
   
   환경별 설정 파일을 복사하여 실제 환경 변수 파일을 생성하세요.
   
   **로컬 개발 환경:**
   ```powershell
   # Backend
   cd backend
   Copy-Item env.local.example env.local
   
   # Frontend
   cd ../frontend
   Copy-Item env.local.example .env.local
   
   # Server (Docker)
   cd ../server
   Copy-Item env.local.example .env.local
   ```
   
   각 환경 변수 파일을 열어 실제 값으로 변경하세요.
   
   자세한 내용은 [ENVIRONMENT-SETUP.md](ENVIRONMENT-SETUP.md)를 참고하세요.

3. **백엔드 실행**
   ```powershell
   cd ./backend; uvicorn main:app --reload
   ```

4. **프론트엔드 실행**
   ```powershell
   cd ./frontend; npm run dev
   ```

5. **접속**
   - 프론트엔드: http://localhost:3000
   - 백엔드 API: http://localhost:8000
   - API 문서: http://localhost:8000/docs

자세한 설치 및 실행 방법은 각 디렉토리의 README.md를 참고하세요.

## 프로젝트 계획

프로젝트의 상세 계획 및 진행 상황은 [PLAN.md](PLAN.md)를 참고하세요.

## 문서

- [환경 설정 가이드](ENVIRONMENT-SETUP.md) - 로컬/개발/프로덕션 환경 설정
- [빌드 및 배포 가이드](BUILD-DEPLOY.md) - 환경별 빌드 및 배포 방법
- [프론트엔드 문서](frontend/README.md) - Next.js 개발 가이드
- [백엔드 문서](backend/README.md) - FastAPI 개발 가이드
- [데이터베이스 문서](database/README.md) - PostgreSQL 스키마 설계 가이드
- [프로젝트 계획](PLAN.md) - 월별 계획 및 진행 상황

## 라이선스

이 프로젝트는 개인 학습 목적으로 개발되었습니다.

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [uv 공식 문서](https://github.com/astral-sh/uv)
