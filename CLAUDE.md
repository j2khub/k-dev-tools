# AlphaK Tools (k-dev-tools)

온라인 도구 모음 사이트. 금융 시세, Steam 게임, 도서 베스트셀러, 공휴일 달력 + 70개 이상의 유틸리티 도구 제공.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, React 19)
- **스타일링**: Tailwind CSS 4, shadcn/ui, Radix UI
- **아이콘**: lucide-react
- **배포**: Cloudflare Workers (`wrangler deploy`) + 정적 자산
- **언어**: TypeScript 5, 한국어 우선 UI

## 프로젝트 구조

```
k-dev-tools/
├── src/
│   ├── app/           # Next.js 페이지 (정적 export)
│   │   ├── layout.tsx     # 루트 레이아웃 (메타데이터, JSON-LD, Skip link)
│   │   ├── page.tsx       # 홈 대시보드 (use client, 3개 API 병렬 fetch)
│   │   ├── error.tsx      # 전역 에러 페이지
│   │   ├── not-found.tsx  # 커스텀 404 페이지
│   │   ├── finance/       # 금융 시장 (Yahoo Finance)
│   │   ├── steam/         # Steam 트렌드
│   │   ├── books/         # 베스트셀러 도서 (알라딘)
│   │   ├── calendar/      # 공휴일 달력 (holidays-kr)
│   │   └── tools/         # 67개+ 유틸리티 도구
│   ├── api/           # Worker용 API 핸들러 모듈
│   │   ├── finance.ts     # Yahoo Finance 프록시
│   │   ├── steam.ts       # Steam Store 프록시
│   │   └── aladin.ts      # 알라딘 API 프록시
│   ├── worker.ts      # Cloudflare Worker 진입점 (API 라우팅 + 보안 헤더 + ASSETS 폴백)
│   ├── components/    # 공유 UI 컴포넌트
│   │   ├── JsonLd.tsx     # JSON-LD 구조화 데이터 (WebSite, Tool, Breadcrumb)
│   │   ├── CopyButton.tsx # 복사 버튼 공통 컴포넌트
│   │   ├── ToolLayout.tsx # 도구 페이지 레이아웃 (JSON-LD 삽입)
│   │   └── ...
│   ├── hooks/         # 커스텀 훅 (useFavorites, useCopyToClipboard)
│   └── lib/           # 유틸리티 (tools-list.ts)
├── scripts/
│   ├── generate-tool-layouts.ts  # 도구별 layout.tsx 자동 생성 (prebuild)
│   └── generate-sitemap.ts       # sitemap.xml 생성 (postbuild)
├── public/
│   ├── robots.txt              # 크롤러 허용 규칙 + AI 봇 허용
│   ├── manifest.webmanifest    # PWA 매니페스트
│   └── llms.txt                # AI 검색엔진 최적화 (GEO)
├── functions/         # (레거시) Cloudflare Pages Functions — Workers에서 미사용
├── wrangler.jsonc     # Cloudflare Workers 설정
├── next.config.ts     # output: 'export', distDir: 'out', trailingSlash: true
└── tsconfig.json      # src/worker.ts, src/api 는 Next.js 빌드에서 제외
```

## 빌드 & 배포

```bash
npm run build          # prebuild(layout 생성) → build(정적 export) → postbuild(sitemap)
wrangler deploy        # Worker + 정적 자산 배포
```

- `prebuild`: `tsx scripts/generate-tool-layouts.ts` — 67개 도구의 layout.tsx 자동 생성
- `postbuild`: `tsx scripts/generate-sitemap.ts` — `out/sitemap.xml` 생성 (73 URL)
- Cloudflare 자동 배포: GitHub push → 빌드 → `npx wrangler deploy`
- 배포 URL: `https://k-dev-tools.alphak.workers.dev/`

## 아키텍처 핵심 포인트

### Workers vs Pages
- **`wrangler deploy`는 Workers 배포**이므로 `functions/` 디렉토리 자동 라우팅이 안 됨
- API 라우팅은 `src/worker.ts`에서 수동 처리 (`/api/*` → 핸들러, 나머지 → `env.ASSETS`)
- Worker 응답에 보안 헤더 자동 추가 (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- `functions/` 디렉토리는 레거시 — 실제 핸들러는 `src/api/`에 있음

### SEO
- 루트 layout: `metadataBase`, `title.template`, OG/Twitter 태그, robots, JSON-LD (WebSite)
- 각 도구 페이지: `scripts/generate-tool-layouts.ts`로 layout.tsx 자동 생성 (title, description, canonical)
- 특수 페이지 (finance, steam, books, calendar, tools): 수동 layout.tsx
- `ToolLayout.tsx`에 WebApplication JSON-LD + BreadcrumbList JSON-LD 삽입
- `trailingSlash: true` — 모든 URL에 trailing slash 적용, canonical URL도 일치
- 정적 파일: `robots.txt`, `manifest.webmanifest`, `llms.txt`, `sitemap.xml`

### 보안
- `ALADIN_API_KEY`: Cloudflare secret으로 관리 (`wrangler secret put ALADIN_API_KEY`)
- Markdown/SVG 렌더링: `isomorphic-dompurify`로 XSS 방지
- Regex 테스터: 패턴 길이 제한(500자) + 매칭 반복 제한(10,000회)으로 ReDoS 방지
- Worker 보안 헤더: X-Content-Type-Options, X-Frame-Options, Referrer-Policy

### 데이터 패턴
- **클라이언트 fetch**: `useCallback` + `useEffect` + `AbortController`, 독립적 로딩/에러 상태
- **서버 캐싱**: Finance 5분, Steam 10분, Books 24시간 (Cache-Control)
- **스켈레톤 로딩**: `animate-pulse` + `bg-muted` 박스
- **에러 표시**: `border-destructive/50 bg-destructive/10` 배너 + `role="alert"`
- **동적 import**: 무거운 라이브러리(pdf-lib, browser-image-compression, marked, js-yaml)는 사용 시점에 `await import()`

### UI 컨벤션
- 한국 주식 시장 색상: 상승=빨강(`text-red-500`), 하락=파랑(`text-blue-500`) + `sr-only` 텍스트
- 이미지: `loading="lazy"`, `group-hover:scale-105`, `overflow-hidden` 컨테이너
- 텍스트 잘림: `line-clamp-1` (1줄), `line-clamp-2` (2줄)
- 그리드: `grid-cols-2 sm:grid-cols-4` (홈), `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` (상세)

### 접근성
- Skip-to-main 링크 (루트 layout)
- 모든 아이콘 버튼에 `aria-label` (테마 토글, 즐겨찾기, 모바일 메뉴)
- CommandMenu: `role="dialog"` + `aria-modal`
- 모바일 메뉴: `aria-expanded`
- 에러 메시지: `role="alert"`
- 금융 상승/하락: `sr-only` 텍스트로 색상 외 정보 제공

### 환경변수
- `ALADIN_API_KEY`: 알라딘 OpenAPI 키 (`wrangler secret put`으로 설정, wrangler.jsonc에 평문 저장 금지)

## 커밋 컨벤션
- 한국어/영어 혼용 가능, 영어 커밋 메시지 선호
- `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` 포함
