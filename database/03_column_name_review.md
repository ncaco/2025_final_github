# 컬럼명 표준용어 검토

공공데이터 공통표준7차 제·개정(2024.11월)의 표준용어사전에 따라 컬럼명을 검토합니다.

## 검토 기준

- 공공데이터 공통표준7차 제·개정(2024.11월) 표준용어사전의 "공통표준용어영문약어명" 참조
- 표준 용어가 있는 경우 표준 용어 사용
- 표준 용어가 없는 경우 일반적으로 사용되는 약어 사용

## 표준 용어 매핑 (공공데이터 공통표준7차 제·개정 기준)

### PDF에서 확인된 표준 용어

PDF 파일에서 확인된 실제 표준 용어를 기반으로 매핑합니다.

| 의미 | 표준 약어 (PDF 확인) | 현재 사용 | 검토 결과 |
|------|-------------------|----------|----------|
| 일련번호 | SN | SN | ✅ 적합 |
| 식별자 | ID | ID | ✅ 적합 |
| 명칭/이름 | NM | NAME | ⚠️ NM으로 변경 필요 |
| 코드 | CD | CODE | ⚠️ CD로 변경 필요 |
| 일시 | DT | AT | ⚠️ DT로 변경 필요 (예: EAI_TRSM_DT, MTG_DT) |
| 일자 | YMD | - | - |
| 여부 | YN | IS_ | ⚠️ YN으로 변경 필요 (예: API_USE_YN, SMS_CERT_YN) |
| 번호 | NO | - | - |
| 전화번호 | TELNO | PHONE | ⚠️ TELNO로 변경 필요 (예: SMS_TRSM_TELNO) |
| 내용 | CN | - | - (예: HTML_CN, SNS_CN) |
| 설명 | DSC | DESCRIPTION | ⚠️ DSC로 변경 필요 |
| 주소 | ADDR | ADDRESS | ⚠️ ADDR로 변경 필요 |
| 이메일 | EML | EMAIL | ⚠️ EML로 변경 필요 |
| 비밀번호 | PWD | PASSWORD | ⚠️ PWD로 변경 필요 |
| 해시 | HASH | HASH | ✅ 적합 |
| 크기 | SZ | SIZE | ⚠️ SZ로 변경 필요 |
| 경로 | PATH | PATH | ✅ 적합 (예: PDF_FILE_PATH_NM) |
| 타입 | TYP | TYPE | ⚠️ TYP로 변경 필요 |
| 상태 | STTS | STATUS | ⚠️ STTS로 변경 필요 |
| 메시지 | MSG | MESSAGE | ⚠️ MSG로 변경 필요 |
| 에러 | ERR | ERROR | ⚠️ ERR로 변경 필요 |
| 액션 | ACT | ACTION | ⚠️ ACT로 변경 필요 |
| 리소스 | RSRC | RESOURCE | ⚠️ RSRC로 변경 필요 |
| 값 | VAL | VALUE | ⚠️ VAL로 변경 필요 |
| 언어 | LANG | LANGUAGE | ⚠️ LANG로 변경 필요 |
| 키 | KEY | KEY | ✅ 적합 |
| 확장자 | EXT | EXTENSION | ⚠️ EXT로 변경 필요 |
| 공개 | PUB | PUBLIC | ⚠️ PUB로 변경 필요 |
| 저장소 | STG | STORAGE | ⚠️ STG로 변경 필요 |
| 디바이스 | DVC | DEVICE | ⚠️ DVC로 변경 필요 |
| 만료 | EXPR | EXPIRES | ⚠️ EXPR로 변경 필요 |
| 취소 | RVK | REVOKED | ⚠️ RVK로 변경 필요 |
| 할당 | ASGN | ASSIGNED | ⚠️ ASGN로 변경 필요 |
| 생성 | CRT | CREATED | ⚠️ CRT로 변경 필요 |
| 수정 | UPD | UPDATED | ⚠️ UPD로 변경 필요 |
| 삭제 | DEL | DELETED | ⚠️ DEL로 변경 필요 |
| 사용 | USE | USED | ⚠️ USE로 변경 필요 |
| 활성 | ACTV | ACTIVE | ⚠️ ACTV로 변경 필요 |
| 인증 | VRF | VERIFIED | ⚠️ VRF로 변경 필요 |

## 테이블별 컬럼명 검토

### 1. COMMON_USER (사용자)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_USER_SN | SN | ✅ 유지 | 표준 용어 |
| USER_ID | ID | ✅ 유지 | 표준 용어 |
| EMAIL | EML | EMAIL → EML | 표준 용어 권장 |
| USERNAME | - | ✅ 유지 | 표준 용어 없음 |
| PASSWORD_HASH | PWD_HASH | PASSWORD_HASH → PWD_HASH | 표준 용어 권장 |
| NAME | NM | NAME → NM | 표준 용어 권장 |
| NICKNAME | - | ✅ 유지 | 표준 용어 없음 |
| PHONE | TELNO | PHONE → TELNO | 표준 용어 권장 |
| IS_ACTIVE | ACTV_YN | IS_ACTIVE → ACTV_YN | 표준 용어 권장 |
| IS_EMAIL_VERIFIED | EML_VRF_YN | IS_EMAIL_VERIFIED → EML_VRF_YN | 표준 용어 권장 |
| IS_PHONE_VERIFIED | TELNO_VRF_YN | IS_PHONE_VERIFIED → TELNO_VRF_YN | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| UPDATED_AT | UPD_DT | UPDATED_AT → UPD_DT | 표준 용어 권장 |
| UPDATED_BY | UPD_BY | ✅ 유지 | 표준 용어 없음 |
| UPDATED_BY_NAME | UPD_BY_NM | UPDATED_BY_NAME → UPD_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 2. COMMON_OAUTH_ACCOUNT (OAuth 계정)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_OAUTH_ACCOUNT_SN | SN | ✅ 유지 | 표준 용어 |
| OAUTH_ACCOUNT_ID | ID | ✅ 유지 | 표준 용어 |
| USER_ID | ID | ✅ 유지 | 표준 용어 |
| PROVIDER | - | ✅ 유지 | 표준 용어 없음 |
| PROVIDER_USER_ID | ID | ✅ 유지 | 표준 용어 |
| PROVIDER_EMAIL | EML | PROVIDER_EMAIL → PROVIDER_EML | 표준 용어 권장 |
| PROVIDER_USERNAME | - | ✅ 유지 | 표준 용어 없음 |
| ACCESS_TOKEN | - | ✅ 유지 | 표준 용어 없음 |
| REFRESH_TOKEN | - | ✅ 유지 | 표준 용어 없음 |
| TOKEN_EXPIRES_AT | EXPR_DT | TOKEN_EXPIRES_AT → TOKEN_EXPR_DT | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| UPDATED_AT | UPD_DT | UPDATED_AT → UPD_DT | 표준 용어 권장 |
| UPDATED_BY | UPD_BY | ✅ 유지 | 표준 용어 없음 |
| UPDATED_BY_NAME | UPD_BY_NM | UPDATED_BY_NAME → UPD_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 3. COMMON_ROLE (역할)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_ROLE_SN | SN | ✅ 유지 | 표준 용어 |
| ROLE_ID | ID | ✅ 유지 | 표준 용어 |
| ROLE_CODE | CD | ROLE_CODE → ROLE_CD | 표준 용어 권장 |
| ROLE_NAME | NM | ROLE_NAME → ROLE_NM | 표준 용어 권장 |
| DESCRIPTION | DSC | DESCRIPTION → DSC | 표준 용어 권장 |
| IS_ACTIVE | ACTV_YN | IS_ACTIVE → ACTV_YN | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| UPDATED_AT | UPD_DT | UPDATED_AT → UPD_DT | 표준 용어 권장 |
| UPDATED_BY | UPD_BY | ✅ 유지 | 표준 용어 없음 |
| UPDATED_BY_NAME | UPD_BY_NM | UPDATED_BY_NAME → UPD_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 4. COMMON_PERMISSION (권한)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_PERMISSION_SN | SN | ✅ 유지 | 표준 용어 |
| PERMISSION_ID | ID | ✅ 유지 | 표준 용어 |
| PERMISSION_CODE | CD | PERMISSION_CODE → PERMISSION_CD | 표준 용어 권장 |
| PERMISSION_NAME | NM | PERMISSION_NAME → PERMISSION_NM | 표준 용어 권장 |
| DESCRIPTION | DSC | DESCRIPTION → DSC | 표준 용어 권장 |
| RESOURCE | RSRC | RESOURCE → RSRC | 표준 용어 권장 |
| ACTION | ACT | ACTION → ACT | 표준 용어 권장 |
| IS_ACTIVE | ACTV_YN | IS_ACTIVE → ACTV_YN | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| UPDATED_AT | UPD_DT | UPDATED_AT → UPD_DT | 표준 용어 권장 |
| UPDATED_BY | UPD_BY | ✅ 유지 | 표준 용어 없음 |
| UPDATED_BY_NAME | UPD_BY_NM | UPDATED_BY_NAME → UPD_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 5. COMMON_ROLE_PERMISSION (역할-권한 매핑)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_ROLE_PERMISSION_SN | SN | ✅ 유지 | 표준 용어 |
| ROLE_PERMISSION_ID | ID | ✅ 유지 | 표준 용어 |
| ROLE_ID | ID | ✅ 유지 | 표준 용어 |
| PERMISSION_ID | ID | ✅ 유지 | 표준 용어 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 6. COMMON_USER_ROLE (사용자-역할 매핑)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_USER_ROLE_SN | SN | ✅ 유지 | 표준 용어 |
| USER_ROLE_ID | ID | ✅ 유지 | 표준 용어 |
| USER_ID | ID | ✅ 유지 | 표준 용어 |
| ROLE_ID | ID | ✅ 유지 | 표준 용어 |
| ASSIGNED_BY | ASGN_BY | ASSIGNED_BY → ASGN_BY | 표준 용어 권장 |
| ASSIGNED_AT | ASGN_DT | ASSIGNED_AT → ASGN_DT | 표준 용어 권장 |
| EXPIRES_AT | EXPR_DT | EXPIRES_AT → EXPR_DT | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| UPDATED_AT | UPD_DT | UPDATED_AT → UPD_DT | 표준 용어 권장 |
| UPDATED_BY | UPD_BY | ✅ 유지 | 표준 용어 없음 |
| UPDATED_BY_NAME | UPD_BY_NM | UPDATED_BY_NAME → UPD_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 7. COMMON_REFRESH_TOKEN (리프레시 토큰)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_REFRESH_TOKEN_SN | SN | ✅ 유지 | 표준 용어 |
| REFRESH_TOKEN_ID | ID | ✅ 유지 | 표준 용어 |
| USER_ID | ID | ✅ 유지 | 표준 용어 |
| TOKEN_HASH | HASH | ✅ 유지 | 표준 용어 |
| DEVICE_INFO | DVC_INFO | DEVICE_INFO → DVC_INFO | 표준 용어 권장 |
| IP_ADDRESS | IP_ADDR | IP_ADDRESS → IP_ADDR | 표준 용어 권장 |
| EXPIRES_AT | EXPR_DT | EXPIRES_AT → EXPR_DT | 표준 용어 권장 |
| IS_REVOKED | RVK_YN | IS_REVOKED → RVK_YN | 표준 용어 권장 |
| REVOKED_AT | RVK_DT | REVOKED_AT → RVK_DT | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| LAST_USED_AT | LAST_USE_DT | LAST_USED_AT → LAST_USE_DT | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 8. COMMON_AUDIT_LOG (감사 로그)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_AUDIT_LOG_SN | SN | ✅ 유지 | 표준 용어 |
| AUDIT_LOG_ID | ID | ✅ 유지 | 표준 용어 |
| USER_ID | ID | ✅ 유지 | 표준 용어 |
| ACTION_TYPE | ACT_TYP | ACTION_TYPE → ACT_TYP | 표준 용어 권장 |
| RESOURCE_TYPE | RSRC_TYP | RESOURCE_TYPE → RSRC_TYP | 표준 용어 권장 |
| RESOURCE_ID | ID | ✅ 유지 | 표준 용어 |
| OLD_VALUE | OLD_VAL | OLD_VALUE → OLD_VAL | 표준 용어 권장 |
| NEW_VALUE | NEW_VAL | NEW_VALUE → NEW_VAL | 표준 용어 권장 |
| IP_ADDRESS | IP_ADDR | IP_ADDRESS → IP_ADDR | 표준 용어 권장 |
| USER_AGENT | - | ✅ 유지 | 표준 용어 없음 |
| REQUEST_METHOD | REQ_MTHD | REQUEST_METHOD → REQ_MTHD | 표준 용어 권장 |
| REQUEST_PATH | REQ_PATH | REQUEST_PATH → REQ_PATH | 표준 용어 권장 |
| STATUS_CODE | STTS_CD | STATUS_CODE → STTS_CD | 표준 용어 권장 |
| ERROR_MESSAGE | ERR_MSG | ERROR_MESSAGE → ERR_MSG | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 9. COMMON_FILE (파일)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_FILE_SN | SN | ✅ 유지 | 표준 용어 |
| FILE_ID | ID | ✅ 유지 | 표준 용어 |
| USER_ID | ID | ✅ 유지 | 표준 용어 |
| FILE_NAME | FILE_NM | FILE_NAME → FILE_NM | 표준 용어 권장 |
| FILE_PATH | PATH | ✅ 유지 | 표준 용어 |
| FILE_SIZE | FILE_SZ | FILE_SIZE → FILE_SZ | 표준 용어 권장 |
| MIME_TYPE | MIME_TYP | MIME_TYPE → MIME_TYP | 표준 용어 권장 |
| FILE_EXTENSION | FILE_EXT | FILE_EXTENSION → FILE_EXT | 표준 용어 권장 |
| STORAGE_TYPE | STG_TYP | STORAGE_TYPE → STG_TYP | 표준 용어 권장 |
| IS_PUBLIC | PUB_YN | IS_PUBLIC → PUB_YN | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| UPDATED_AT | UPD_DT | UPDATED_AT → UPD_DT | 표준 용어 권장 |
| UPDATED_BY | UPD_BY | ✅ 유지 | 표준 용어 없음 |
| UPDATED_BY_NAME | UPD_BY_NM | UPDATED_BY_NAME → UPD_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

### 10. COMMON_LOCALE (다국어)

| 현재 컬럼명 | 표준 용어 | 변경 제안 | 비고 |
|------------|----------|----------|------|
| COMMON_LOCALE_SN | SN | ✅ 유지 | 표준 용어 |
| LOCALE_ID | ID | ✅ 유지 | 표준 용어 |
| LANGUAGE_CODE | LANG_CD | LANGUAGE_CODE → LANG_CD | 표준 용어 권장 |
| RESOURCE_TYPE | RSRC_TYP | RESOURCE_TYPE → RSRC_TYP | 표준 용어 권장 |
| RESOURCE_KEY | KEY | ✅ 유지 | 표준 용어 |
| RESOURCE_VALUE | RSRC_VAL | RESOURCE_VALUE → RSRC_VAL | 표준 용어 권장 |
| DELETED_AT | DEL_DT | DELETED_AT → DEL_DT | 표준 용어 권장 |
| DELETED_BY | DEL_BY | ✅ 유지 | 표준 용어 없음 |
| DELETED_BY_NAME | DEL_BY_NM | DELETED_BY_NAME → DEL_BY_NM | 표준 용어 권장 |
| IS_DELETED | DEL_YN | IS_DELETED → DEL_YN | 표준 용어 권장 |
| CREATED_AT | CRT_DT | CREATED_AT → CRT_DT | 표준 용어 권장 |
| CREATED_BY | CRT_BY | ✅ 유지 | 표준 용어 없음 |
| CREATED_BY_NAME | CRT_BY_NM | CREATED_BY_NAME → CRT_BY_NM | 표준 용어 권장 |
| UPDATED_AT | UPD_DT | UPDATED_AT → UPD_DT | 표준 용어 권장 |
| UPDATED_BY | UPD_BY | ✅ 유지 | 표준 용어 없음 |
| UPDATED_BY_NAME | UPD_BY_NM | UPDATED_BY_NAME → UPD_BY_NM | 표준 용어 권장 |
| IS_USED | USE_YN | IS_USED → USE_YN | 표준 용어 권장 |

## 검토 요약

### 변경 권장 사항

1. **일시 관련**: `_AT` → `_DT` (예: CREATED_AT → CRT_DT)
2. **여부 관련**: `IS_` → `_YN` (예: IS_ACTIVE → ACTV_YN)
3. **명칭 관련**: `NAME` → `NM` (예: ROLE_NAME → ROLE_NM)
4. **코드 관련**: `CODE` → `CD` (예: ROLE_CODE → ROLE_CD)
5. **설명 관련**: `DESCRIPTION` → `DSC`
6. **타입 관련**: `TYPE` → `TYP`
7. **액션 관련**: `ACTION` → `ACT`
8. **리소스 관련**: `RESOURCE` → `RSRC`
9. **값 관련**: `VALUE` → `VAL`
10. **이메일 관련**: `EMAIL` → `EML`
11. **전화번호 관련**: `PHONE` → `TELNO`
12. **비밀번호 관련**: `PASSWORD` → `PWD`
13. **크기 관련**: `SIZE` → `SZ`
14. **확장자 관련**: `EXTENSION` → `EXT`
15. **주소 관련**: `ADDRESS` → `ADDR`

### 다음 단계

1. ✅ 엑셀 파일의 표준용어사전을 직접 확인하여 정확한 약어 확인 (PDF 확인 완료)
2. ✅ 변경 권장 사항 검토 및 승인
3. ✅ 승인된 변경사항을 논리적 설계 문서에 반영 (완료)

### 적용 완료

논리적 설계 문서(`02_logical_design.md`)에 모든 표준 용어가 적용되었습니다.

**주요 변경 사항:**
- 일시: `_AT` → `_DT` (예: CREATED_AT → CRT_DT)
- 여부: `IS_` → `_YN` (예: IS_ACTIVE → ACTV_YN)
- 명칭: `NAME` → `NM` (예: ROLE_NAME → ROLE_NM)
- 코드: `CODE` → `CD` (예: ROLE_CODE → ROLE_CD)
- 설명: `DESCRIPTION` → `DSC`
- 타입: `TYPE` → `TYP`
- 액션: `ACTION` → `ACT`
- 리소스: `RESOURCE` → `RSRC`
- 값: `VALUE` → `VAL`
- 이메일: `EMAIL` → `EML`
- 전화번호: `PHONE` → `TELNO`
- 비밀번호: `PASSWORD` → `PWD`
- 크기: `SIZE` → `SZ`
- 확장자: `EXTENSION` → `EXT`
- 주소: `ADDRESS` → `ADDR`
- 생성: `CREATED` → `CRT`
- 수정: `UPDATED` → `UPD`
- 삭제: `DELETED` → `DEL`
- 사용: `USED` → `USE`
- 활성: `ACTIVE` → `ACTV`
- 인증: `VERIFIED` → `VRF`
- 만료: `EXPIRES` → `EXPR`
- 취소: `REVOKED` → `RVK`
- 할당: `ASSIGNED` → `ASGN`

## 참고

이 문서는 `공공데이터 공통표준7차 제·개정(2024.11월).pdf` 파일에서 확인된 표준 용어를 기반으로 작성되었습니다.

### PDF에서 확인된 표준 용어 예시

- **일시**: `DT` (예: EAI_TRSM_DT, MTG_DT, MTG_BGNG_DT, MTG_END_DT)
- **일자**: `YMD` (예: EAI_TRSM_YMD, MTG_BGNG_YMD, MTG_END_YMD)
- **여부**: `YN` (예: API_USE_YN, SMS_CERT_YN, SNS_USE_YN, SSL_USE_YN)
- **명**: `NM` (예: SMS_RCVR_NM, WBS_NM, CHRMN_NM)
- **번호**: `NO` (예: G2B_CTRT_NO, POS_NO, VOC_RCPT_NO, MTG_NO)
- **전화번호**: `TELNO` (예: SMS_TRSM_TELNO)
- **내용**: `CN` (예: HTML_CN, SNS_CN, TRNG_CN)
- **경로**: `PATH` (예: PDF_FILE_PATH_NM)

### 추가 확인 필요 사항

PDF 파일의 전체 표준용어사전을 확인하여 다음 용어들의 정확한 약어를 확인해야 합니다:
- 생성 (CREATED)
- 수정 (UPDATED)
- 삭제 (DELETED)
- 사용 (USED)
- 활성 (ACTIVE)
- 인증 (VERIFIED)
- 타입 (TYPE)
- 액션 (ACTION)
- 리소스 (RESOURCE)
- 값 (VALUE)
- 언어 (LANGUAGE)
- 확장자 (EXTENSION)
- 공개 (PUBLIC)
- 저장소 (STORAGE)
- 디바이스 (DEVICE)
- 만료 (EXPIRES)
- 취소 (REVOKED)
- 할당 (ASSIGNED)

