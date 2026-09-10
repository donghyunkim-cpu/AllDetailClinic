// 비포앤애프터 갤러리 데이터 — 새 사진 추가 시 이 배열에만 항목 추가
// cat: 시그니처 키 / b·a: 이미지 / d: [before, after] 촬영 년.월 / best: 상단 BEST 노출 / pos: object-position
export const CATS = [
  { key: 'all', ko: '전체', en: 'All' },
  { key: 'nasolabial', ko: '팔자지우개', en: 'Nasolabial Eraser', full: '올디테일 팔자지우개', no: '01' },
  { key: 'peanut', ko: '땅콩필러', en: 'Peanut Filler', full: '올디테일 땅콩필러', no: '02' },
  { key: 'body', ko: '바디지우개', en: 'Body Eraser', full: '올디테일 바디지우개', no: '03' },
  { key: 'lifting', ko: '리프팅', en: 'Lifting', full: '올디테일 리프팅', no: '04' },
  { key: 'stem', ko: '줄기세포 수액', en: 'Stem Cell Infusion', full: '올디테일 줄기세포 수액', no: '05' },
  { key: 'booster', ko: '스킨부스터', en: 'Comfort Skinbooster', full: '컴포트 스킨부스터', no: '06' },
  { key: 'pigment', ko: '색소지우개', en: 'Pigment Eraser', full: '커스텀 색소지우개', no: '07' }
];

const C = (cat, title, b, a, d, note, opt) => Object.assign({ cat, title, b, a, d, note, best: false, pos: '50% 40%' }, opt || {});

export const CASES = [
  // 팔자지우개
  C('nasolabial', '팔자지우개 — 맞춤 디자인 조합', 'ba-naso-before.jpg', 'ba-naso-after.jpg', ['2026.09', '2026.09'], '꺼짐 · 볼살 · 처짐 비중을 나눠 필러 + 울쎄라 조합', { best: true, pos: '50% 42%' }),
  C('nasolabial', '팔자지우개 — 꺼짐형 CASE', 'case-sunken-before.jpg', 'case-sunken-after.jpg', ['2026.09', '2026.09'], 'Ristow space에 고정 주입, 인중 길이 변화 없음'),
  C('nasolabial', '팔자지우개 — 볼살형 CASE', 'case-cheek-before.jpg', 'case-cheek-after.jpg', ['2026.09', '2026.09'], '울쎄라 + 온다로 팔자 위 볼살 부피 감소'),
  C('nasolabial', '팔자지우개 — 처짐형 CASE', 'case-sag-before.jpg', 'case-sag-after.jpg', ['2026.09', '2026.09'], '리버스 디자인 실리프팅으로 딤플 없이 고정'),
  // 땅콩필러
  C('peanut', '땅콩필러 — 관자 + 옆볼 동시 설계', 'ba-peanut-before.png', 'ba-peanut-after.png', ['2026.09', '2026.09'], '관자와 옆볼을 하나의 옆선으로 이어 계란형 윤곽', { best: true }),
  C('peanut', '땅콩필러 — 관자필러', 'case-temple-before.png', 'case-temple-after.png', ['2026.09', '2026.09'], '골막 위 층에 넓게 펴서 굴곡 없이 채움', { pos: '50% 45%' }),
  C('peanut', '땅콩필러 — 옆볼필러', 'case-lcheek-before.png', 'case-lcheek-after.png', ['2026.09', '2026.09'], '지지 구조 위 소량 배분, 웃을 때도 형태 유지', { pos: '50% 45%' }),
  // 바디지우개
  C('body', '바디지우개 — 복부 라인', 'ba-bodyline-before.jpg', 'ba-bodyline-after.jpg', ['2026.09', '2026.09'], '지방분해 5회 + 바디온다 4회 + 2:1 식단관리', { best: true, pos: '50% 30%' }),
  C('body', '바디지우개 — 팔뚝', 'case-arm-before.jpg', 'case-arm-after.jpg', ['2026.09', '2026.09'], '지방분해 4회 + 바디 리프팅 3회', { pos: '50% 40%' }),
  // 리프팅
  C('lifting', '올디테일 리프팅 — 전체 윤곽', 'ba-lift-before.jpg', 'ba-lift-after.jpg', ['2026.09', '2026.09'], '펜 디자인 후 구역별 깊이 배분, 4단계 마취', { best: false, pos: '50% 42%' }),
  C('lifting', '올디테일 리프팅 — 턱선 · 이중턱', 'case-jaw-before.jpg', 'case-jaw-after.jpg', ['2026.09', '2026.09'], '울쎄라 근막층 + 온다 지방층 조합'),
  C('lifting', '올디테일 리프팅 — 중안면 · 심부볼', 'case-midface-before.jpg', 'case-midface-after.jpg', ['2026.09', '2026.09'], '지방 두께에 맞춰 깊이 배분, 옆볼 패임 없음'),
  // 줄기세포 수액
  C('stem', '줄기세포 수액 — 흉터 주사', 'stem-scar-before.png', 'stem-scar-after.png', ['2026.09', '2026.09'], '패인 흉터 바닥 재생 신호 전달, 4회', { pos: '50% 45%' }),
  C('stem', '줄기세포 수액 — 두피 주사', 'stem-hair-before.png', 'stem-hair-after.png', ['2026.09', '2026.09'], '모낭 주변 직접 전달, 6회 · 4주 간격', { pos: '50% 50%' }),
  C('stem', '줄기세포 수액 — 피부 주사 (눈가)', 'stem-wrinkle-before.png', 'stem-wrinkle-after.png', ['2026.09', '2026.09'], '진피 미세 주입, 3회', { pos: '50% 45%' }),
  C('stem', '줄기세포 수액 — 정맥 · 피부 톤', 'stem-tone-before.png', 'stem-tone-after.png', ['2026.09', '2026.09'], '정맥 수액 6회 + 피부 주사 2회', { pos: '50% 42%' }),
  // 스킨부스터
  C('booster', '컴포트 스킨부스터 — 결 · 광채', 'ba-boost-before.jpg', 'ba-boost-after.jpg', ['2026.09', '2026.09'], '리쥬란 + 스킨바이브, 3회 · 4주 간격', { pos: '50% 42%' }),
  // 색소지우개
  C('pigment', '커스텀 색소지우개 — 기미 · 잡티 복합', 'ba-pig-before.jpg', 'ba-pig-after.jpg', ['2026.09', '2026.09'], '피코 토닝 8회 + 기미 복합 레이저 2회', { pos: '50% 42%' }),
  C('pigment', '커스텀 색소지우개 — 잡티 · 흑자', 'case-spot-before.jpg', 'case-spot-after.jpg', ['2026.09', '2026.09'], '표피 색소 타겟 레이저 2회'),
  C('pigment', '커스텀 색소지우개 — 기미', 'case-melasma-before.jpg', 'case-melasma-after.jpg', ['2026.09', '2026.09'], '저출력 토닝 10회, 회차마다 세팅 재조정')
];
