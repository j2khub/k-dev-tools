# Changelog

## [0.4.0] - 2026-02-14

### Added
- 날씨 페이지: 한국 주요 8개 도시 (서울, 부산, 인천, 대구, 대전, 광주, 울산, 제주)
  - Open-Meteo API (KMA 모델) 기반, API 키 불필요
  - 현재 날씨 히어로 카드 (기온, 체감온도, 습도, 풍속, 일출/일몰)
  - 시간별 기온 바 차트 (현재 시각/강수확률 50%+ 색상 구분)
  - 7일 예보 (최고/최저 기온, 강수량)
  - 전체 도시 한눈에 보기 그리드
  - 10분 자동 갱신 + visibilitychange 리스너
- 홈 페이지에 날씨 프리뷰 카드 (서울, 부산, 대구, 제주)
- API 프록시: `/api/weather/forecast` (30분 캐시)
- 커맨드 메뉴(Ctrl+K)에 날씨 페이지 검색 항목 추가

### Changed
- 네비게이션 메뉴 순서: 도구 → 금융 → 도서 → 날씨 → 달력 → 스팀
- "Steam" → "스팀" (한글화)

## [0.3.0] - 2026-02-14

### Added
- 홈 페이지 대시보드 리디자인: 라이브 데이터 미리보기 (금융, 도서, Steam, 공휴일)
- 홈 히어로에 날짜/인사말 표시 + 도구 검색바 (자동완성 드롭다운)
- 홈 도구 모음 배너 하단에 즐겨찾기 도구 최대 3개 표시
- 도구 페이지에 "AlphaK Tools" 타이틀 + 설명 문구 추가
- Worker 진입점(`src/worker.ts`)으로 API 라우팅 구현

### Changed
- 헤더 로고: "AlphaK Tools" → "AlphaK"
- 네비게이션 메뉴 순서: 도구 → 금융 → 도서 → 달력 → Steam
- 홈 섹션 순서: 도구 배너 → 금융 → 도서 → 달력 → Steam
- `distDir`를 `out`으로 통일 (wrangler `assets.directory`와 일치)

### Fixed
- Cloudflare Workers 배포 시 API 라우트 미작동 문제 해결
  - `functions/` 디렉토리는 Pages 전용 → `src/api/` + `src/worker.ts`로 전환

## [0.2.0] - 2026-02-13

### Added
- 금융 시장 페이지: 주요 지수, 환율, 원자재, 암호화폐, 채권 금리 (Yahoo Finance)
- Steam 트렌드 페이지: 할인 특가, 인기 판매 (Steam Store API)
- 베스트셀러 도서 페이지: 베스트셀러, 신간, 블로거 베스트 (알라딘 API)
- 공휴일 달력 페이지: 13개국 공휴일, D-day 표시 (holidays-kr)
- 헤더 네비게이션 링크
- API 프록시 함수: `/api/finance/quotes`, `/api/steam/featured`, `/api/aladin/bestsellers`
- 도구 즐겨찾기 기능 (localStorage 기반)
- Cloudflare Workers 배포 설정 (`wrangler.jsonc`)

## [0.1.0] - 2026-02-12

### Added
- 초기 프로젝트 생성 (Next.js 16, Tailwind CSS 4)
- 70개 이상의 온라인 도구 (PDF, 계산기, 변환, 텍스트, 이미지, 생성기, 개발도구)
- Cloudflare Pages 정적 export 설정
