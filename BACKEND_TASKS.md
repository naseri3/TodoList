# TodoList 백엔드 작업 명세

TodoList 프론트엔드와 연동할 백엔드 구현 범위와 권장 API 계약입니다.

## 1. 현재 상태

- Google: Firebase Authentication으로 로그인 동작
- Kakao/Naver: 인가 코드와 `state` 수신까지만 구현
- 폴더·할 일: LocalStorage 저장
- 프로필 이미지: IndexedDB 저장
- 회원탈퇴: 경고 모달 UI만 구현
- 비로그인 제한: 폴더 3개, 폴더별 할 일 3개를 프론트에서 검사

## 2. 먼저 협의할 사항

- API 기본 URL과 버전 (`/api/v1` 등)
- 인증 방식: HttpOnly 세션 쿠키 또는 Access/Refresh JWT
- OAuth 콜백을 프론트 또는 백엔드 중 어디서 받을지
- 운영 프론트·백엔드 도메인과 CORS Origin
- Google Firebase 인증을 백엔드 회원 체계에 통합하는 방법
- 비로그인 데이터의 로그인 후 이전 여부
- 프로필 이미지 저장 방식

## 3. 백엔드 환경변수

```env
KAKAO_REST_API_KEY=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=
FRONTEND_ORIGIN=
DATABASE_URL=
SESSION_SECRET=
```

Client Secret은 브라우저 번들, 프론트 저장소, `VITE_` 환경변수에 포함하면 안 됩니다.

## 4. 소셜 로그인

### Kakao

1. 프론트 콜백에서 받은 `code`를 백엔드로 전달
2. 카카오 토큰 API에서 Access/Refresh Token 발급
3. `/v2/user/me` 사용자정보 조회
4. 카카오 사용자 ID 기준 회원 조회 또는 생성
5. 닉네임·이메일·프로필 이미지 정규화
6. 서비스 세션/JWT 발급

```http
POST /api/v1/auth/kakao
Content-Type: application/json

{
  "code": "인가 코드",
  "redirectUri": "https://frontend.example.com/oauth/kakao/callback"
}
```

### Naver

1. 프론트 콜백에서 받은 `code`, `state` 전달
2. 일회성 `state` 검증
3. 네이버 Access/Refresh Token 발급
4. 회원 프로필 API 호출
5. 네이버 사용자 ID 기준 회원 조회 또는 생성
6. 서비스 세션/JWT 발급

```http
POST /api/v1/auth/naver
Content-Type: application/json

{
  "code": "인가 코드",
  "state": "CSRF 검증 값",
  "redirectUri": "https://frontend.example.com/oauth/naver/callback"
}
```

### Google

현재 Firebase 로그인을 유지한다면 프론트가 Firebase ID Token을 전달하고 백엔드는 Firebase Admin SDK로 검증합니다.

```http
POST /api/v1/auth/google
Authorization: Bearer <firebase-id-token>
```

### 공통 응답

```json
{
  "user": {
    "id": "service-user-id",
    "name": "홍길동",
    "email": "user@example.com",
    "profileImage": "https://example.com/profile.jpg",
    "provider": "kakao"
  }
}
```

이메일은 nullable 필드로 처리합니다.

## 5. 인증·회원 API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| POST | `/api/v1/auth/google` | Firebase ID Token 로그인 |
| POST | `/api/v1/auth/kakao` | 카카오 인가 코드 로그인 |
| POST | `/api/v1/auth/naver` | 네이버 인가 코드 로그인 |
| POST | `/api/v1/auth/refresh` | 인증 갱신 |
| POST | `/api/v1/auth/logout` | 세션·토큰 폐기 |
| GET | `/api/v1/me` | 현재 사용자 조회 |
| PATCH | `/api/v1/me` | 사용자 이름·프로필 수정 |
| DELETE | `/api/v1/me` | 회원탈퇴 |

## 6. 회원탈퇴

- 본인 재확인 또는 최근 로그인 여부 검사
- 폴더·할 일·프로필 이미지 삭제
- Refresh Token과 세션 폐기
- 제공자별 연결 해제 또는 토큰 폐기
- 사용자 삭제 또는 개인정보 비식별 처리
- 성공 시 `204 No Content` 권장

## 7. 데이터 모델

### User

```text
id, provider, provider_user_id, name, email(nullable),
profile_image_url(nullable), created_at, updated_at
```

`provider + provider_user_id` unique constraint를 권장합니다.

### Folder

```text
id, user_id, name, color, created_at, updated_at
```

### Todo

```text
id, folder_id, title, importance(HIGH|MEDIUM|LOW),
completed, created_at, updated_at
```

사용자가 본인 소유 리소스만 조회·수정·삭제할 수 있도록 모든 API에서 소유권을 검사합니다.

## 8. 폴더 API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/api/v1/folders` | 사용자 폴더 목록 |
| POST | `/api/v1/folders` | 폴더 생성 |
| GET | `/api/v1/folders/:folderId` | 폴더 상세 |
| PATCH | `/api/v1/folders/:folderId` | 이름·색상 수정 |
| DELETE | `/api/v1/folders/:folderId` | 폴더와 하위 할 일 삭제 |

```json
{
  "id": "folder-id",
  "name": "포트폴리오",
  "color": "#b7b7b7",
  "total": 2,
  "completed": 1,
  "updatedAt": "2026-08-21T12:00:00Z"
}
```

## 9. 할 일 API

| Method | Endpoint | 설명 |
| --- | --- | --- |
| GET | `/api/v1/folders/:folderId/todos` | 할 일 목록 |
| POST | `/api/v1/folders/:folderId/todos` | 할 일 생성 |
| PATCH | `/api/v1/todos/:todoId` | 제목·중요도·완료 수정 |
| DELETE | `/api/v1/todos/:todoId` | 할 일 삭제 |

```json
{
  "id": "todo-id",
  "folderId": "folder-id",
  "title": "360LAB",
  "importance": "LOW",
  "completed": false,
  "createdAt": "2026-08-21T12:00:00Z",
  "updatedAt": "2026-08-21T12:00:00Z"
}
```

## 10. 제한 정책

- 비로그인 폴더 최대 3개
- 비로그인 폴더별 할 일 최대 3개
- 로그인 사용자는 현재 정책상 제한 없음

서버가 비로그인 데이터도 관리한다면 서버에서 제한을 강제해야 합니다. 로그인 사용자에도 악용 방지를 위한 rate limit과 합리적인 기술적 상한을 권장합니다.

## 11. 프로필 이미지

현재 IndexedDB 저장을 서버 업로드로 변경할 경우 `multipart/form-data` 또는 Object Storage Presigned URL 방식을 권장합니다.

- MIME 및 실제 파일 형식 검사
- 파일 크기와 해상도 제한
- 썸네일 생성
- 임의 파일명 사용
- 기존 이미지 정리
- 최종 이미지 URL 반환

## 12. 오류 응답

```json
{
  "code": "FOLDER_NOT_FOUND",
  "message": "존재하지 않는 폴더입니다."
}
```

- `400`: 잘못된 입력
- `401`: 인증 필요 또는 만료
- `403`: 접근 권한 없음
- `404`: 리소스 없음
- `409`: 중복 또는 상태 충돌
- `429`: 요청 횟수 제한
- `500`: 서버 내부 오류

## 13. 보안 체크리스트

- [ ] Secret 서버 환경변수 관리
- [ ] OAuth `state` 일회성 저장·검증
- [ ] Redirect URI allowlist
- [ ] Firebase ID Token 서버 검증
- [ ] HttpOnly·Secure·SameSite 쿠키
- [ ] CORS Origin 제한
- [ ] 리소스 소유권 검사
- [ ] 입력값 검증과 rate limit
- [ ] 토큰·개인정보 로그 출력 금지
- [ ] HTTPS 적용

## 14. 완료 조건

- [ ] Google·카카오·네이버가 공통 사용자 형식으로 로그인됨
- [ ] 카카오·네이버 실제 이름과 동의된 이메일이 표시됨
- [ ] 새로고침 후 안전한 로그인 세션 유지
- [ ] 로그아웃 시 세션·토큰 폐기
- [ ] 회원탈퇴 시 계정과 관련 데이터 처리
- [ ] 사용자별 폴더·할 일이 DB에 저장됨
- [ ] 다른 사용자의 데이터 접근 차단
- [ ] 개발·운영 CORS와 OAuth URL 정상 동작
- [ ] 인증·권한 API 테스트 통과

## 15. 프론트 연동 수정 대상

- `src/page/KakaoCallback.jsx`: 임시 사용자 제거, 백엔드 로그인 호출
- `src/page/NaverCallback.jsx`: 임시 사용자 제거, 백엔드 로그인 호출
- `src/App.jsx`: 세션 조회·로그아웃·프로필·탈퇴 연결
- `src/page/Home.jsx`: LocalStorage 폴더 로직을 API로 교체
- `src/page/TodoList.jsx`: LocalStorage 할 일 로직을 API로 교체
- `src/page/MyPage.jsx`: 프로필 업로드·회원탈퇴 API 연결

## 공식 문서

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/ko/kakaologin/rest-api)
- [네이버 로그인 API](https://developers.naver.com/docs/login/api/api.md)
