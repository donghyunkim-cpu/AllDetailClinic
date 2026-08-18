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

## 배포

Vercel: Framework Preset을 **Other**, Build Command와 Output Directory는 비워둡니다.
그 외 정적 호스팅도 이 폴더를 루트로 올리면 됩니다.

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
