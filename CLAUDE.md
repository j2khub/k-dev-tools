# AlphaK Tools (k-dev-tools)

온라인 도구 모음 사이트. 금융 시세, 도서 베스트셀러, 날씨, 공휴일 달력 + 70개 이상의 유틸리티 도구 제공.

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
│   │   ├── layout.tsx     # 루트 레이아웃 (메타데이터, JSON-LD, Header, Footer)
│   │   ├── page.tsx       # 홈 대시보드 (use client, API 병렬 fetch)
│   │   ├── finance/       # 금융 시장 (Yahoo Finance)
│   │   ├── books/         # 베스트셀러 도서 (알라딘)
│   │   ├── weather/       # 날씨 (Open-Meteo, 클라이언트 직접 호출)
│   │   ├── calendar/      # 공휴일 달력 (holidays-kr)
│   │   └── tools/         # 67개+ 유틸리티 도구
│   ├── api/           # Worker용 API 핸들러 모듈
│   │   ├── finance.ts     # Yahoo Finance 프록시
│   │   ├── aladin.ts      # 알라딘 API 프록시
│   │   └── weather.ts     # Open-Meteo 프록시 + KV 캐시 + Cron 갱신
│   ├── worker.ts      # Cloudflare Worker 진입점 (API 라우팅 + 보안 헤더 + ASSETS 폴백)
│   ├── components/    # 공유 UI 컴포넌트
│   ├── hooks/         # 커스텀 훅 (useFavorites, useCopyToClipboard)
│   └── lib/           # 유틸리티 (tools-list.ts, weather-client.ts)
├── scripts/
│   ├── generate-tool-layouts.ts  # 도구별 layout.tsx 자동 생성 (prebuild)
│   └── generate-sitemap.ts       # sitemap.xml 생성 (postbuild)
├── wrangler.jsonc     # Cloudflare Workers 설정 (KV, Cron)
├── next.config.ts     # output: 'export', distDir: 'out', trailingSlash: true
└── tsconfig.json      # src/worker.ts, src/api 는 Next.js 빌드에서 제외
```

## 빌드 & 배포

```bash
npm run build          # prebuild(layout 생성) → build(정적 export) → postbuild(sitemap)
wrangler deploy        # Worker + 정적 자산 배포
```

- 배포 URL: `https://tools.alphak.workers.dev/`
- **배포(`wrangler deploy`)는 반드시 사용자 확인을 받은 후 진행할 것**

## 아키텍처 핵심 포인트

### Workers
- `wrangler deploy`는 Workers 배포 — `functions/` 디렉토리 자동 라우팅 안 됨
- API 라우팅: `src/worker.ts`에서 수동 처리 (`/api/*` → 핸들러, 나머지 → `env.ASSETS`)
- Worker 응답에 보안 헤더 자동 추가
- 날씨 데이터: KV 캐시 + 30분 Cron 갱신, 클라이언트는 Open-Meteo 직접 호출

### 보안
- `ALADIN_API_KEY`: Cloudflare secret으로 관리 (wrangler.jsonc에 평문 저장 금지)
- Markdown/SVG 렌더링: `isomorphic-dompurify`로 XSS 방지 (동적 import — Turbopack jsdom 이슈 회피)

### 빌드 주의사항
- `isomorphic-dompurify`는 반드시 동적 import 사용 (정적 import 시 Turbopack prerender에서 jsdom 에러)
- Windows에서 `out` 디렉토리 잠금 시: node 프로세스 종료 후 빌드 재시도

## 커밋 컨벤션
- 영어 커밋 메시지
- `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` 포함
