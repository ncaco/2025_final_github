# 보안 체크리스트

이 문서는 Git에 커밋하기 전에 확인해야 할 보안 사항을 정리합니다.

## ⚠️ 절대 Git에 포함되면 안 되는 정보

### 1. 비밀번호 및 인증 정보
- ❌ 데이터베이스 비밀번호 (`POSTGRES_PASSWORD`)
- ❌ JWT 시크릿 키 (`SECRET_KEY`)
- ❌ API 키 및 토큰
- ❌ OAuth 클라이언트 시크릿
- ❌ 암호화 키

### 2. 개인 정보
- ❌ 실제 이메일 주소 (예제 파일 제외)
- ❌ 실제 도메인 정보 (예제 파일 제외)
- ❌ 개인 식별 정보

### 3. 인증서 및 키 파일
- ❌ SSL 인증서 (`*.pem`, `*.key`, `*.crt`)
- ❌ SSH 키
- ❌ 개인 키 파일

### 4. 환경 변수 파일 (실제 값 포함)
- ❌ `.env`, `.env.local`, `.env.dev`, `.env.production`
- ❌ `backend/env.local`, `backend/.env.*`
- ❌ `frontend/.env.local`, `frontend/.env.*`
- ❌ `server/.env.*`, `server/env.*`

## ✅ Git에 포함되어야 하는 파일

### 예제 파일 (안전한 플레이스홀더만 포함)
- ✅ `*.example` 파일들
- ✅ `env.*.example` 파일들
- ✅ `.env.*.example` 파일들

**예제 파일은 다음을 포함해야 합니다:**
- 플레이스홀더 값 (`CHANGE_THIS_TO_...`, `your_...`)
- 경고 메시지 (`⚠️ 반드시 변경하세요!`)
- 설명 주석

## Git 커밋 전 체크리스트

### 1. 환경 변수 파일 확인
```powershell
# Git에 추적되고 있는 환경 파일 확인
git ls-files | Select-String -Pattern "\.env$|env\.local$|env\.production$|env\.dev$"

# 결과가 비어있어야 합니다 (예제 파일 제외)
```

### 2. 비밀번호 및 키 확인
```powershell
# 실제 비밀번호나 키가 포함된 파일 검색
git diff --cached | Select-String -Pattern "password|PASSWORD|secret|SECRET|token|TOKEN|key|KEY" -CaseSensitive:$false

# 예제 파일이 아닌 실제 값이 포함되어 있으면 안 됩니다
```

### 3. 실제 도메인/이메일 확인
```powershell
# 예제 파일이 아닌 파일에서 실제 도메인/이메일 검색
git diff --cached | Select-String -Pattern "@.*\.(com|net|org)|\.duckdns\.net|\.ddns\.net"

# 예제 파일이 아닌 경우 실제 정보가 포함되어 있으면 안 됩니다
```

### 4. .gitignore 확인
```powershell
# 중요 파일이 .gitignore에 포함되어 있는지 확인
git check-ignore -v .env.production
git check-ignore -v backend/env.local
git check-ignore -v server/.env.production

# 모두 "ignored"로 표시되어야 합니다
```

## 예제 파일 작성 가이드

### 올바른 예제 파일 예시

```env
# ✅ 좋은 예시
POSTGRES_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD
SECRET_KEY=CHANGE_THIS_TO_STRONG_RANDOM_SECRET_KEY_MIN_64_CHARS
CERTBOT_EMAIL=your-email@example.com
FRONTEND_DOMAIN=yourdomain.ddns.net
```

### 잘못된 예제 파일 예시

```env
# ❌ 나쁜 예시 - 실제 값 포함
POSTGRES_PASSWORD=app_password_123
SECRET_KEY=Uwl28t30Ak_XW8OyQnpnRBWMb1Xg__cW3DBJ706SdiU2BGLD4J8eaOOt9mngqfQ1SuPwzZIf3B8HPU0Lbk0lzw
CERTBOT_EMAIL=ncaco97@gmail.com
FRONTEND_DOMAIN=ncaco.duckdns.net
```

## 실수로 커밋한 경우 대응 방법

### 1. Git에서 제거 (로컬 파일은 유지)
```powershell
# Git 추적에서 제거
git rm --cached <파일경로>

# 예시
git rm --cached backend/env.local
git rm --cached server/.env.production
```

### 2. .gitignore 확인 및 업데이트
```powershell
# .gitignore에 파일이 포함되어 있는지 확인
git check-ignore -v <파일경로>

# 포함되어 있지 않으면 .gitignore에 추가
```

### 3. 커밋 히스토리에서 제거 (필요한 경우)
```powershell
# ⚠️ 주의: 이미 푸시된 경우 팀원과 협의 필요
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch <파일경로>" \
  --prune-empty --tag-name-filter cat -- --all

# 또는 BFG Repo-Cleaner 사용 (더 빠름)
```

### 4. 변경사항 커밋
```powershell
git add .gitignore
git commit -m "Remove sensitive files from git tracking"
```

## 자동화된 보안 검사

### PowerShell 스크립트로 검사

```powershell
# 보안 검사 스크립트
$errors = @()

# 환경 변수 파일 확인
$envFiles = git ls-files | Select-String -Pattern "\.env$|env\.local$|env\.production$|env\.dev$" | Where-Object { $_ -notmatch "\.example$" }
if ($envFiles) {
    $errors += "환경 변수 파일이 Git에 포함되어 있습니다: $envFiles"
}

# 실제 비밀번호 확인 (예제 파일 제외)
$secretFiles = git diff --cached --name-only | Where-Object { 
    $_ -notmatch "\.example$" -and 
    (Get-Content $_ -ErrorAction SilentlyContinue | Select-String -Pattern "password.*=|SECRET_KEY.*=|PASSWORD.*=" | Where-Object { $_.Line -notmatch "CHANGE_THIS|your_|example" })
}
if ($secretFiles) {
    $errors += "실제 비밀번호가 포함된 파일: $secretFiles"
}

if ($errors.Count -gt 0) {
    Write-Host "보안 문제 발견:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    exit 1
} else {
    Write-Host "보안 검사 통과!" -ForegroundColor Green
}
```

## 추가 보안 권장사항

### 1. Git Hooks 사용
`.git/hooks/pre-commit` 파일을 생성하여 커밋 전 자동 검사:

```bash
#!/bin/sh
# 보안 검사 스크립트 실행
powershell -File ./scripts/security-check.ps1
```

### 2. GitHub Secrets 사용
GitHub Actions나 CI/CD에서 환경 변수는 Secrets로 관리

### 3. 환경 변수 관리 도구 사용
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

## 관련 문서

- [환경 설정 가이드](./ENVIRONMENT-SETUP.md)
- [빌드 및 배포 가이드](./BUILD-DEPLOY.md)
