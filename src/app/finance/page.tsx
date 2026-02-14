"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Clock } from "lucide-react";

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
}

// ── 심볼 → 한글 매핑 ──
const LABELS: Record<string, { name: string; flag?: string }> = {
  "^KS11": { name: "KOSPI", flag: "KR" },
  "^KQ11": { name: "KOSDAQ", flag: "KR" },
  "^GSPC": { name: "S&P 500", flag: "US" },
  "^IXIC": { name: "NASDAQ", flag: "US" },
  "^DJI": { name: "다우존스", flag: "US" },
  "^SOX": { name: "필라델피아 반도체", flag: "US" },
  "USDKRW=X": { name: "달러/원" },
  "EURKRW=X": { name: "유로/원" },
  "JPYKRW=X": { name: "엔/원 (100엔)" },
  "CNYKRW=X": { name: "위안/원" },
  "GC=F": { name: "금 (Gold)" },
  "CL=F": { name: "WTI 원유" },
  "SI=F": { name: "은 (Silver)" },
  "BTC-USD": { name: "비트코인" },
  "ETH-USD": { name: "이더리움" },
  "^TNX": { name: "미국 10년물" },
  "^TYX": { name: "미국 30년물" },
  "^FVX": { name: "미국 5년물" },
  "^VIX": { name: "VIX (공포지수)" },
};

const SECTIONS: { title: string; symbols: string[] }[] = [
  {
    title: "주요 지수",
    symbols: ["^KS11", "^KQ11", "^SOX", "^GSPC", "^IXIC", "^DJI"],
  },
  {
    title: "환율",
    symbols: ["USDKRW=X", "EURKRW=X", "JPYKRW=X", "CNYKRW=X"],
  },
  { title: "원자재", symbols: ["GC=F", "CL=F", "SI=F"] },
  { title: "암호화폐", symbols: ["BTC-USD", "ETH-USD"] },
  { title: "채권 금리", symbols: ["^TNX", "^TYX", "^FVX"] },
];

// ── 숫자 포맷 ──
function formatPrice(symbol: string, price: number): string {
  if (["^TNX", "^TYX", "^FVX"].includes(symbol)) {
    return price.toFixed(3) + "%";
  }
  if (symbol === "^VIX") {
    return price.toFixed(2);
  }
  if (["BTC-USD", "ETH-USD"].includes(symbol)) {
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (symbol.includes("KRW")) {
    if (symbol === "JPYKRW=X") {
      return (price * 100).toLocaleString("ko-KR", { maximumFractionDigits: 2 }) + "원";
    }
    return price.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) + "원";
  }
  if (symbol.startsWith("^") || symbol === "GC=F" || symbol === "CL=F" || symbol === "SI=F") {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatChange(symbol: string, change: number): string {
  const sign = change > 0 ? "+" : "";
  if (["^TNX", "^TYX", "^FVX"].includes(symbol)) {
    return sign + change.toFixed(3);
  }
  if (symbol === "JPYKRW=X") {
    return sign + (change * 100).toFixed(2);
  }
  return sign + change.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── VIX 레벨 판단 ──
function getVixLevel(vix: number) {
  if (vix <= 12) return { label: "극도 낙관", color: "text-green-500", bg: "bg-green-500", pct: 10 };
  if (vix <= 16) return { label: "낙관", color: "text-green-400", bg: "bg-green-400", pct: 25 };
  if (vix <= 20) return { label: "보통", color: "text-yellow-400", bg: "bg-yellow-400", pct: 45 };
  if (vix <= 25) return { label: "불안", color: "text-orange-400", bg: "bg-orange-400", pct: 65 };
  if (vix <= 30) return { label: "공포", color: "text-red-400", bg: "bg-red-400", pct: 80 };
  return { label: "극도 공포", color: "text-red-600", bg: "bg-red-600", pct: 95 };
}

// ── 개별 Quote 카드 ──
function QuoteCard({ symbol, data }: { symbol: string; data?: QuoteData }) {
  const label = LABELS[symbol] ?? { name: symbol };

  if (!data) {
    return (
      <div className="p-4 rounded-lg border bg-card animate-pulse">
        <div className="h-4 bg-muted rounded w-20 mb-3" />
        <div className="h-6 bg-muted rounded w-28 mb-2" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    );
  }

  const isUp = data.changePercent > 0;
  const isDown = data.changePercent < 0;
  const colorClass = isUp
    ? "text-red-500 dark:text-red-400"
    : isDown
      ? "text-blue-500 dark:text-blue-400"
      : "text-muted-foreground";

  return (
    <div className="p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-medium">
          {label.name}
        </span>
        <span className="sr-only">{isUp ? "상승" : isDown ? "하락" : "보합"}</span>
        {isUp ? (
          <ArrowUpRight className={`h-4 w-4 ${colorClass}`} />
        ) : isDown ? (
          <ArrowDownRight className={`h-4 w-4 ${colorClass}`} />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="text-lg font-bold tabular-nums">
        {formatPrice(symbol, data.price)}
      </div>
      <div className={`text-sm tabular-nums mt-1 ${colorClass}`}>
        {formatChange(symbol, data.change)} ({data.changePercent > 0 ? "+" : ""}
        {data.changePercent.toFixed(2)}%)
      </div>
    </div>
  );
}

// ── 메인 페이지 ──
export default function FinancePage() {
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/finance/quotes");
      if (!res.ok) throw new Error("데이터를 불러올 수 없습니다");
      const json = await res.json();
      setQuotes(json.quotes);
      setLastUpdated(json.timestamp);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 300_000); // 5분 자동 갱신

    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchData]);

  const vixData = quotes["^VIX"];
  const vixLevel = vixData ? getVixLevel(vixData.price) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6" />
          <h1 className="text-2xl font-bold">금융 시장</h1>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(lastUpdated).toLocaleTimeString("ko-KR")} 기준
          </span>
        )}
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* VIX 공포/탐욕 게이지 */}
      {(vixData || loading) && (
        <div className="mb-8 p-5 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">시장 심리 (VIX 기반)</span>
            {vixData && (
              <span className={`text-sm font-bold ${vixLevel?.color}`}>
                {vixLevel?.label}
              </span>
            )}
          </div>
          {vixData && vixLevel ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold tabular-nums">
                  {vixData.price.toFixed(2)}
                </span>
                <span
                  className={`text-sm tabular-nums ${
                    vixData.changePercent > 0
                      ? "text-red-500"
                      : vixData.changePercent < 0
                        ? "text-blue-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {vixData.changePercent > 0 ? "+" : ""}
                  {vixData.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${vixLevel.bg}`}
                  style={{ width: `${vixLevel.pct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                <span>극도 낙관</span>
                <span>보통</span>
                <span>극도 공포</span>
              </div>
            </>
          ) : (
            <div className="h-16 animate-pulse bg-muted rounded" />
          )}
        </div>
      )}

      {/* 섹션별 Quote 카드 그리드 */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {section.symbols.map((symbol) => (
              <QuoteCard
                key={symbol}
                symbol={symbol}
                data={loading ? undefined : quotes[symbol]}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 안내 */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        데이터 출처: Yahoo Finance | 실시간이 아닌 지연 시세입니다 | 투자 참고용으로만 활용하세요
      </p>
    </div>
  );
}
