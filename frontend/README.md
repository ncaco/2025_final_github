## 관리자/분석 대시보드 프론트엔드 (Next.js)

이 디렉터리는 Next.js(App Router) 기반의 **관리자/분석 대시보드** 프론트엔드 코드입니다.  
인증(NextAuth), Prisma 기반 PostgreSQL, Tailwind + shadcn/ui 조합을 사용합니다.

---

### 1. 개발 서버 실행 (Windows PowerShell 기준)

리포지토리 루트에서 다음과 같이 실행합니다.

```bash
cd ./frontend
npm install
npm run dev
```

기본 접속 주소는 `http://localhost:3000` 입니다.

---

### 2. 주요 스크립트 (ESLint / Prettier)

`package.json` 기준:

- `npm run dev` : 개발 서버 실행
- `npm run build` : 프로덕션 빌드
- `npm start` : 빌드 결과 실행
- `npm run lint` : Next.js + ESLint 기반 정적 검사
- `npm run lint:fix` : 가능한 ESLint 자동 수정
- `npm run format` : Prettier로 전체 포맷팅(`prettier . --write`)
- `npm run format:check` : 포맷 상태만 검사(`prettier . --check`)

권장 워크플로우:

1. 저장 시 에디터(예: VS Code)에서 Prettier 확장으로 자동 포맷
2. 커밋 전에 `npm run lint` 또는 `npm run format:check` 실행

> Prettier 설정 파일: `prettier.config.mjs`  
> Prettier 무시 설정: `.prettierignore`

---

### 3. ESLint 설정 개요

ESLint 설정은 `eslint.config.mjs` 에 정의되어 있으며, Next.js 공식 설정(`eslint-config-next`)을 기반으로 다음을 포함합니다.

- `core-web-vitals` 규칙 세트
- TypeScript 지원
- 빌드 산출물 및 타입 정의 파일(`.next/**`, `out/**`, `build/**`, `next-env.d.ts`) 무시

필요 시 이 파일에서 추가 규칙/무시 경로를 확장할 수 있습니다.

---

### 4. 데이터베이스 및 백엔드 연동

- **DB 스키마 단일 소스**: 리포지토리 루트의 `db_structure.md`
- **Prisma 스키마**: `prisma/schema.prisma`
- **Prisma 클라이언트**: `lib/prisma.ts`

실제 DB 마이그레이션/스키마 변경 시에는:

1. `prisma/schema.prisma` 수정
2. `npx prisma migrate dev` 실행
3. `db_structure.md` 를 같이 업데이트하여 문서와 실제 스키마를 동기화

---

### 5. 향후 확장 포인트 (요약)

자세한 내용은 루트의 설계 문서(`nextjs-admin-dashboard-project_*.plan.md`) 및 `db_structure.md` 를 참고하고, 여기서는 핵심 확장 포인트만 요약합니다.

- **도메인 확장**
  - `organizations / projects` 엔티티 추가를 통한 멀티테넌시/프로젝트 단위 관리
  - 대시보드 지표용 `metrics / events` 테이블 추가 (트래픽, 매출, 사용량 등)
- **권한/역할 고도화**
  - 현재 `role` 기반 (`ADMIN`, `MANAGER`, `VIEWER` 등)에서 세분화된 권한 매트릭스로 확장 가능
- **UI/UX 확장**
  - shadcn/ui 기반 공통 폼/테이블/모달 컴포넌트 라이브러리화
  - 다크 모드, 다국어(i18n), 사용자별 레이아웃 커스터마이징 등

이러한 변경이 실제로 적용될 때마다:

1. 관련 코드(`app/dashboard/*`, `app/api/*`, `components/*`, `prisma/schema.prisma`)를 수정하고
2. `db_structure.md` 와 이 `README.md` 의 관련 섹션을 함께 갱신하는 것을 권장합니다.

