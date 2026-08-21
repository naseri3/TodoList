# TodoList

폴더별로 할 일을 관리하는 React 기반 웹 애플리케이션입니다. 비로그인 상태에서도 기본 기능을 사용할 수 있으며 Google·카카오·네이버 소셜 로그인을 지원하는 구조로 작성되었습니다.

> 현재 Google 로그인은 동작하지만, 카카오·네이버 로그인은 인가 코드 수신까지만 구현되어 있습니다. 실제 인증과 회원정보 조회에는 백엔드 연동이 필요합니다.

## 기술 스택

- React 19, Vite 8, React Router
- Firebase Authentication (Google 로그인)
- LocalStorage (현재 폴더·할 일 데이터)
- IndexedDB (사용자가 등록한 프로필 이미지)
- 반응형 CSS 및 다크모드

## 실행 및 검사

```bash
npm install
npm run dev
```

```bash
npm run lint
npm run build
```

## 환경변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_CLIENT_ID=
VITE_KAKAO_REST_API_KEY=
VITE_KAKAO_REDIRECT_URI=
VITE_NAVER_CLIENT_ID=
VITE_NAVER_CALLBACK_URL=
VITE_API_BASE_URL=
```

`.env`는 저장소에 커밋하지 않습니다. 카카오·네이버 Client Secret은 절대 `VITE_` 환경변수나 프론트엔드 코드에 넣지 않고 백엔드에서만 관리해야 합니다.

## 화면 경로

| 경로 | 화면 |
| --- | --- |
| `/` | 시작 화면 |
| `/home` | 폴더 목록 홈 |
| `/folder/:folderId` | 폴더별 할 일 목록 |
| `/login` | 소셜 로그인 |
| `/oauth/kakao/callback` | 카카오 OAuth 콜백 |
| `/oauth/naver/callback` | 네이버 OAuth 콜백 |
| `/mypage` | 마이페이지 |

## 프론트엔드 구현 완료

### 폴더와 할 일

- 폴더 생성·수정·삭제, 색상 선택, 검색
- 폴더별 전체·완료 개수 및 수정 날짜 표시
- 할 일 생성·수정·삭제, 완료 체크, 검색
- 전체·진행 중·완료 필터
- 중요도(높음·중간·낮음) 설정
- 폴더 제목 수정
- 삭제 확인 및 생성 제한 경고 모달

### 생성 제한

- 비로그인: 폴더 최대 3개
- 비로그인: 각 폴더의 할 일 최대 3개
- 로그인: 프론트엔드에서 개수 제한 없음

> 프론트엔드 제한은 우회할 수 있으므로 서비스 정책으로 보장하려면 백엔드에서도 검사해야 합니다.

### 로그인과 마이페이지

- Firebase Google 로그인 및 로그아웃
- 카카오·네이버 OAuth 시작 및 `state` 검증
- 로그인 사용자 이름·이메일·프로필 표시 구조
- 로컬 프로필 이미지 선택 및 IndexedDB 저장
- 마이페이지 닫기, 회원탈퇴 경고 모달 UI

### 디자인

- 모바일 중심 반응형 레이아웃
- 라이트·다크모드 전환 및 설정 유지
- 홈·할 일·마이페이지·모달 다크모드
- 다크모드 전용 로고
- 주요 버튼과 모달 접근성 속성

## 현재 저장 구조

| 데이터 | 저장 위치 |
| --- | --- |
| 폴더와 할 일 | LocalStorage `todoListFolders` |
| 테마 | LocalStorage `todoListTheme` |
| 임시 소셜 사용자 | LocalStorage `socialLoginUser` |
| 사용자 프로필 이미지 | IndexedDB `todoListProfileDB` |

현재 데이터는 브라우저 로컬 데이터이므로 다른 기기와 동기화되지 않고 브라우저 데이터 삭제 시 사라질 수 있습니다. 백엔드 연동 후 로그인 사용자 데이터는 서버 DB로 이전해야 합니다.

## 소셜 로그인 상태

### Google

Firebase Authentication을 사용하며 실제 이름·이메일을 표시할 수 있습니다.

### Kakao

인증 화면 이동, 콜백 인가 코드 수신, `state` 확인까지만 구현되어 있습니다. 토큰 교환과 사용자정보 조회는 백엔드 작업입니다.

### Naver

인증 화면 이동, 콜백 인가 코드 수신, `state` 확인까지만 구현되어 있습니다. 현재 사용자 데이터는 임시 값입니다.

## 공통 사용자 응답 권장 형식

```json
{
  "id": "service-user-id",
  "name": "홍길동",
  "email": "user@example.com",
  "profileImage": "https://example.com/profile.jpg",
  "provider": "kakao"
}
```

카카오·네이버 이메일은 동의항목과 사용자 동의 여부에 따라 없을 수 있으므로 `null`을 허용해야 합니다.

## 백엔드 연동 필요 작업

- 카카오·네이버 인가 코드 토큰 교환 및 사용자정보 조회
- 회원 가입·조회와 서비스 세션/JWT 발급
- 토큰 갱신, 로그아웃 및 실제 회원탈퇴
- 폴더·할 일 CRUD API와 DB 저장
- 사용자별 데이터 권한 검사
- 서버 측 생성 제한 및 rate limit
- 프로필 이미지 업로드 저장소
- CORS, 쿠키, 환경변수와 오류 응답 규격

상세 명세는 [BACKEND_TASKS.md](./BACKEND_TASKS.md)를 참고하세요.

## 배포 전 체크리스트

- [ ] `.env`가 Git에 포함되지 않는지 확인
- [ ] 개발·운영 환경변수 분리
- [ ] 운영 도메인과 OAuth Callback URL 등록
- [ ] Firebase 승인 도메인 등록
- [ ] 카카오 로그인·동의항목 설정
- [ ] 네이버 서비스 URL·Callback URL·제공 정보 설정
- [ ] 백엔드 API 주소와 인증 방식 연결
- [ ] 카카오·네이버 실제 계정 로그인 테스트
- [ ] 세션 만료·로그아웃·회원탈퇴 테스트
- [ ] 사용자별 폴더·할 일 저장 및 권한 테스트
- [ ] 모바일·데스크톱·다크모드 확인

## 공식 문서

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/ko/kakaologin/rest-api)
- [네이버 로그인 API](https://developers.naver.com/docs/login/api/api.md)

