# All Detail Clinic — 올디테일의원 홈페이지

정적 사이트입니다. 빌드 과정이 없습니다.

## 페이지

| 파일 | 내용 |
| --- | --- |
| `index.html` | 홈 |
| `about.html` | 올디테일 소개 (브랜드 스토리 · 철학 · 의료진 · 진료시간 · 오시는 길) |
| `signature.html` | 올디테일 시그니처 5종 |
| `treatments.html` | 시술 (12분류 · FAQ) |
| `column.html` | 메디컬 칼럼 |
| `reserve.html` | 예약하기 |

## 공용 컴포넌트

한 곳만 고치면 전체 페이지에 반영됩니다.

- `Site Header.dc.html` — 헤더, 모바일 서랍, 언어 드롭다운
- `Site Footer.dc.html` — 푸터
- `Consult Dock.dc.html` — 플로팅 상담 버튼
- `Signature Detail.dc.html` — 시그니처 5종 상세 모달 (홈·시그니처 페이지 공용)
- `support.js` — 런타임
- `map.html` — 오시는 길 지도
- `images/` — 이미지 78개

## 로컬 개발

Node.js만 있으면 됩니다. 설치할 패키지는 없습니다(`npm install` 불필요).

| 명령 | 내용 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 → http://localhost:3000 (사용 중이면 다음 포트로 자동 이동, 종료 `Ctrl + C`) |
| `npm run dev -- --host` | 같은 네트워크의 휴대폰 등에서 접속 허용 |
| `npm run dev -- --port 4000` | 포트 지정 |
| `npm run check` | 커밋 · push 전 점검 (JS 문법, 파일 경로 · 대소문자, 칼럼 페이지, `vercel.json` · `sitemap.xml`). 파일은 고치지 않습니다 |
| `npm run columns` | 칼럼 글 페이지 다시 만들기 (아래 메디컬 칼럼 참고) |

개발 서버는 `vercel.json`처럼 `/about` → `about.html`로 연결하고, 없는 주소는 `404.html`을 보여줍니다.

## 배포

Vercel: Framework Preset을 **Other**, Build Command와 Output Directory는 비워둡니다.
그 외 정적 호스팅도 이 폴더를 루트로 올리면 됩니다.

`package.json`에 `build` 스크립트를 추가하지 않습니다. Vercel이 배포할 때 자동으로 실행합니다.

## 메디컬 칼럼

칼럼 원본은 `columns-data.js` 한 곳입니다. 칼럼 목록, 글 페이지, 피부고민 · 시술 페이지의 칼럼 링크가 모두 여기서 읽습니다.

1. `columns-data.js` 배열 **맨 뒤**에 글을 추가하거나 기존 글을 고칩니다. 순서를 바꾸면 피부고민 · 시술 페이지의 칼럼 연결이 어긋납니다.
2. `slug`는 글 주소(`/column-<slug>`)가 됩니다. 영문 소문자 · 숫자 · 하이픈만 쓰고, 한 번 정하면 바꾸지 않습니다.
3. 아래 명령으로 글 페이지를 다시 만들고, 바뀐 파일을 모두 커밋합니다. Node.js가 필요합니다.

```bash
npm run columns
```

(`node tools/build-columns.mjs`와 같습니다.) 커밋 전에 `npm run check`로 빠진 글 페이지가 없는지 확인합니다.

생성기가 고치는 파일: `column-*.html`(글 페이지), `sitemap.xml`의 칼럼 항목, `index.html`의 홈 칼럼 미리보기(최신 3편), `column.html`의 크롤러용 링크 목록. `column-*.html`은 직접 고치지 않습니다. 다시 생성하면 덮어써집니다.

## 다국어

`Site Header.dc.html` 상단 `LANGS` 배열에서 관리합니다.

```js
const LANGS = [
  { code: 'KO', native: '한국어',  href: '/',    ready: true  },
  { code: 'EN', native: 'English', href: '/en/', ready: false },
  { code: 'CN', native: '中文',    href: '/zh/', ready: false },
  { code: 'AR', native: 'العربية', href: '/ar/', ready: false }
];
```

- 번역 페이지를 해당 경로에 올린 뒤 `ready: true`로 바꾸면 활성화됩니다.
- 언어 추가는 배열에 한 줄 추가하면 됩니다.
- 번역 페이지 게시 시 `hreflang` 태그를 함께 넣어야 검색엔진이 언어별로 색인합니다.
- 아랍어는 RTL 레이아웃 작업이 별도로 필요합니다.

## 확정 대기 항목

교체가 필요한 자리입니다.

**연락 채널** — 대표 전화, 카카오톡 채널, WhatsApp 번호, LINE ID, 인스타그램 계정, 네이버 플레이스

**의료 정보** — 보유 장비 확정 (리프팅 · 색소 레이저 · 3D 진단기 모델명), 가격 공개 범위

**이미지** — 대표원장 프로필 사진, 실제 전후사진(환자 동의서 필수), 장비 공식 제품 사진, 특허 서류

현재 전후사진과 시술 이미지는 톤 확인용으로 생성한 것입니다. 실제 사례로 교체해야 합니다.

**법적 문서** — 개인정보처리방침, 이용약관, 사업자등록번호, 의료광고 심의

예약 폼이 개인정보를 수집하므로 개인정보처리방침은 필수입니다.

**운영** — 휴진일, 주차 안내, 도메인 및 호스팅 계정

## 참고

- 예약 폼은 홈(간략형)과 예약 페이지(프로그램·채널 선택형) 두 곳에 있습니다. 실제 연동 시 두 폼을 같은 엔드포인트로 연결해야 합니다.
- 의료광고 심의를 감안해 최상급 표현, 효과 보장, 구체적 수치, 학력 강조를 순화했습니다. 심의 통과 후 조정 가능합니다.
- 서체는 SUIT(국문)와 Newsreader(영문)를 CDN에서 불러옵니다.
