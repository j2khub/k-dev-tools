// rhwp WASM 로더. 반드시 클라이언트에서만 사용 (use client + dynamic import).
// 3.5MB wasm이므로 사용자가 렌더링 기능을 실제로 쓸 때만 로드되도록 호출 지점에서 lazy import 권장.

type RhwpModule = typeof import("@rhwp/core");

let loader: Promise<RhwpModule> | null = null;

declare global {
  // rhwp가 WASM 내부에서 텍스트 폭 측정용으로 호출하는 전역 콜백.
  // init 호출 전에 반드시 등록되어야 함.
  // eslint-disable-next-line no-var
  var measureTextWidth: ((font: string, text: string) => number) | undefined;
}

// SVG가 사용할 폴백 체인을 측정 시에도 강제로 적용해야 폭이 일치한다.
// wasm이 단일 폰트명("한컴바탕")만 보내고 시스템에 그 폰트가 없으면
// Canvas는 브라우저 default로 fallback 측정 → SVG 렌더 폰트와 폭이 어긋남.
const FALLBACK_STACK =
  '"Noto Sans KR", "Noto Serif KR", "Pretendard", "Nanum Gothic", "Nanum Myeongjo", sans-serif';

function patchFontFallback(font: string): string {
  // 이미 sans-serif/serif/monospace 같은 generic family가 있으면 그대로 사용
  if (/\b(sans-serif|serif|monospace|cursive|fantasy)\b/.test(font)) return font;
  return `${font}, ${FALLBACK_STACK}`;
}

function registerMeasureTextWidth() {
  if (typeof window === "undefined") return;
  if (globalThis.measureTextWidth) return;

  let ctx: CanvasRenderingContext2D | null = null;
  let lastFont = "";

  globalThis.measureTextWidth = (font, text) => {
    if (!ctx) {
      const canvas = document.createElement("canvas");
      ctx = canvas.getContext("2d");
      if (!ctx) return 0;
    }
    const patched = patchFontFallback(font);
    if (patched !== lastFont) {
      ctx.font = patched;
      lastFont = patched;
    }
    return ctx.measureText(text).width;
  };
}

export async function loadRhwp(): Promise<RhwpModule> {
  if (typeof window === "undefined") {
    throw new Error("rhwp은 브라우저 환경에서만 사용할 수 있습니다.");
  }
  if (loader) return loader;

  loader = (async () => {
    registerMeasureTextWidth();
    const mod = await import("@rhwp/core");
    await mod.default({ module_or_path: "/rhwp_bg.wasm" });
    return mod;
  })();

  return loader;
}

// 한컴/한국어 폰트명을 웹 폰트(Noto Sans/Serif KR, Pretendard 등)에 alias.
// wasm이 보내는 font stack의 첫 번째가 한국어 이름이라
// 시스템에 그 폰트가 없으면 measure와 SVG가 서로 다른 fallback으로 빠질 수 있음.
// @font-face로 같은 폰트명을 등록하면 양쪽이 동일한 글리프를 쓰게 됨.
const FONT_ALIAS_CSS = `
@font-face { font-family: "한컴바탕"; src: local("Noto Serif KR"), local("Batang"); }
@font-face { font-family: "함초롬바탕"; src: local("Noto Serif KR"), local("Batang"); }
@font-face { font-family: "HY명조"; src: local("Noto Serif KR"), local("Batang"); }
@font-face { font-family: "명조"; src: local("Noto Serif KR"), local("Batang"); }
@font-face { font-family: "바탕"; src: local("Noto Serif KR"), local("Batang"); }
@font-face { font-family: "궁서"; src: local("Noto Serif KR"); }
@font-face { font-family: "나눔명조"; src: local("Nanum Myeongjo"), local("Noto Serif KR"); }
@font-face { font-family: "한컴돋움"; src: local("Noto Sans KR"), local("Malgun Gothic"); }
@font-face { font-family: "함초롬돋움"; src: local("Pretendard"), local("Noto Sans KR"); }
@font-face { font-family: "HY고딕"; src: local("Noto Sans KR"), local("Malgun Gothic"); }
@font-face { font-family: "고딕"; src: local("Noto Sans KR"), local("Malgun Gothic"); }
@font-face { font-family: "돋움"; src: local("Noto Sans KR"), local("Malgun Gothic"); }
@font-face { font-family: "굴림"; src: local("Noto Sans KR"), local("Malgun Gothic"); }
@font-face { font-family: "맑은 고딕"; src: local("Pretendard"), local("Noto Sans KR"); }
@font-face { font-family: "나눔고딕"; src: local("Nanum Gothic"), local("Noto Sans KR"); }
`;

// rhwp가 SVG에 적용하는 폴백 체인 전체를 로드한다.
const FONT_SOURCES: { id: string; href: string }[] = [
  {
    id: "rhwp-google-fonts",
    href: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Noto+Serif+KR:wght@400;700&family=Nanum+Gothic:wght@400;700&family=Nanum+Myeongjo:wght@400;700&display=swap",
  },
  {
    id: "rhwp-pretendard",
    href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
  },
];

const FONT_FAMILIES = [
  "Noto Sans KR",
  "Noto Serif KR",
  "Nanum Gothic",
  "Nanum Myeongjo",
  "Pretendard",
];

let fontsReady: Promise<void> | null = null;

export async function ensureRhwpFonts(): Promise<void> {
  if (typeof window === "undefined") return;
  if (fontsReady) return fontsReady;

  fontsReady = (async () => {
    for (const { id, href } of FONT_SOURCES) {
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }

    if (!document.getElementById("rhwp-font-alias")) {
      const style = document.createElement("style");
      style.id = "rhwp-font-alias";
      style.textContent = FONT_ALIAS_CSS;
      document.head.appendChild(style);
    }

    if (document.fonts && typeof document.fonts.load === "function") {
      const loads: Promise<unknown>[] = [];
      for (const family of FONT_FAMILIES) {
        loads.push(document.fonts.load(`400 12px "${family}"`));
        loads.push(document.fonts.load(`700 12px "${family}"`));
      }
      await Promise.all(loads).catch(() => undefined);
      await document.fonts.ready;
    }
  })();

  return fontsReady;
}
