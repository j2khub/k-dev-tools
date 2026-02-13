// Cloudflare Pages Function — Yahoo Finance 프록시
// URL: /api/finance/quotes

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
}

const ALL_SYMBOLS = [
  // 주요 지수
  "^KS11", "^KQ11", "^SOX", "^GSPC", "^IXIC", "^DJI",
  // 환율
  "USDKRW=X", "EURKRW=X", "JPYKRW=X", "CNYKRW=X",
  // 원자재
  "GC=F", "CL=F", "SI=F",
  // 암호화폐
  "BTC-USD", "ETH-USD",
  // 채권
  "^TNX", "^TYX", "^FVX",
  // 변동성
  "^VIX",
];

async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d&includePrePost=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const json: Record<string, unknown> = await res.json();
    const chart = json?.chart as Record<string, unknown> | undefined;
    const results = chart?.result as Record<string, unknown>[] | undefined;
    const meta = results?.[0]?.meta as Record<string, unknown> | undefined;
    if (!meta) return null;

    const price = (meta.regularMarketPrice as number) ?? 0;
    const previousClose =
      (meta.chartPreviousClose as number) ??
      (meta.previousClose as number) ??
      price;
    const change = price - previousClose;
    const changePercent = previousClose
      ? (change / previousClose) * 100
      : 0;

    return {
      symbol,
      name: (meta.shortName as string) ?? (meta.symbol as string) ?? symbol,
      price,
      previousClose,
      change,
      changePercent,
      currency: (meta.currency as string) ?? "",
    };
  } catch {
    return null;
  }
}

export const onRequest: PagesFunction = async () => {
  const results = await Promise.allSettled(ALL_SYMBOLS.map(fetchQuote));

  const quotes: Record<string, QuoteData> = {};
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      quotes[ALL_SYMBOLS[i]] = r.value;
    }
  });

  return new Response(
    JSON.stringify({ quotes, timestamp: Date.now() }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
};
