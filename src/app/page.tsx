"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Wrench,
  TrendingUp,
  Gamepad2,
  BookOpen,
  CalendarDays,
  ArrowRight,
  Star,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { tools } from "@/lib/tools-list";
import {
  y2018, y2019, y2020, y2021, y2022, y2023, y2024, y2025, y2026,
} from "@hyunbinseo/holidays-kr";

// ── Types ──────────────────────────────────────────────

interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
}

interface SteamGame {
  id: number;
  name: string;
  discounted: boolean;
  discount_percent: number;
  original_price: number | null;
  final_price: number | null;
  currency: string;
  large_capsule_image: string;
  small_capsule_image: string;
}

interface BookItem {
  itemId: number;
  title: string;
  link: string;
  author: string;
  pubDate: string;
  isbn13: string;
  priceSales: number;
  priceStandard: number;
  cover: string;
  categoryName: string;
  publisher: string;
}

// ── Holiday helpers ────────────────────────────────────

const KR_DATA: Record<number, Readonly<Record<string, ReadonlyArray<string>>>> = {
  2018: y2018, 2019: y2019, 2020: y2020, 2021: y2021,
  2022: y2022, 2023: y2023, 2024: y2024, 2025: y2025, 2026: y2026,
};

function getNextKoreanHoliday(): { name: string; date: Date } | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  for (const y of [year, year + 1]) {
    const data = KR_DATA[y];
    if (!data) continue;
    const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    for (const [dateStr, names] of entries) {
      const [yy, mm, dd] = dateStr.split("-").map(Number);
      const d = new Date(yy, mm - 1, dd);
      d.setHours(0, 0, 0, 0);
      if (d >= today) {
        return { name: names[0], date: d };
      }
    }
  }
  return null;
}

function getDday(targetDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Finance formatting ─────────────────────────────────

const FINANCE_SYMBOLS = ["^KS11", "^GSPC", "USDKRW=X", "BTC-USD"] as const;
const FINANCE_LABELS: Record<string, string> = {
  "^KS11": "KOSPI",
  "^GSPC": "S&P 500",
  "USDKRW=X": "달러/원",
  "BTC-USD": "비트코인",
};

function formatPrice(symbol: string, price: number): string {
  if (symbol === "BTC-USD") return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (symbol === "USDKRW=X") return price.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) + "원";
  if (symbol === "^GSPC") return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // KOSPI
  return price.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatChange(symbol: string, change: number): string {
  const prefix = change > 0 ? "+" : "";
  if (symbol === "BTC-USD") return prefix + "$" + Math.abs(change).toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (symbol === "USDKRW=X") return prefix + change.toFixed(2) + "원";
  return prefix + change.toFixed(2);
}

// ── Steam formatting ───────────────────────────────────

function formatKRW(cents: number | null): string {
  if (cents === null) return "";
  if (cents === 0) return "무료";
  const won = Math.round(cents / 100);
  return "₩" + won.toLocaleString("ko-KR");
}

// ── Greeting ───────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "좋은 새벽이에요";
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "좋은 오후에요";
  return "좋은 저녁이에요";
}

function formatToday(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

// ── Component ──────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Finance state
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [financeLoading, setFinanceLoading] = useState(true);
  const [financeError, setFinanceError] = useState<string | null>(null);

  // Steam state
  const [steamGames, setSteamGames] = useState<SteamGame[]>([]);
  const [steamLoading, setSteamLoading] = useState(true);
  const [steamError, setSteamError] = useState<string | null>(null);

  // Books state
  const [books, setBooks] = useState<BookItem[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);

  // Holiday (sync, no loading needed)
  const nextHoliday = useMemo(() => getNextKoreanHoliday(), []);

  // Favorites
  const { favorites } = useFavorites();
  const favoriteTools = useMemo(
    () => tools.filter((t) => favorites.includes(t.href)).slice(0, 3),
    [favorites]
  );

  // Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return tools
      .filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery]);

  const fetchFinance = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/finance/quotes", { signal });
      if (!res.ok) throw new Error("금융 데이터를 불러올 수 없습니다");
      const json = await res.json();
      setQuotes(json.quotes);
      setFinanceError(null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setFinanceError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setFinanceLoading(false);
    }
  }, []);

  const fetchSteam = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/steam/featured", { signal });
      if (!res.ok) throw new Error("Steam 데이터를 불러올 수 없습니다");
      const json = await res.json();
      setSteamGames(json.specials?.slice(0, 4) ?? []);
      setSteamError(null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setSteamError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setSteamLoading(false);
    }
  }, []);

  const fetchBooks = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/aladin/bestsellers", { signal });
      if (!res.ok) throw new Error("도서 데이터를 불러올 수 없습니다");
      const json = await res.json();
      setBooks(json.bestsellers?.slice(0, 4) ?? []);
      setBooksError(null);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setBooksError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setBooksLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    fetchFinance(signal);
    fetchSteam(signal);
    fetchBooks(signal);
    return () => controller.abort();
  }, [fetchFinance, fetchSteam, fetchBooks]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 sm:py-8">
      {/* ── Hero ── */}
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-1">AlphaK</h1>
        <p className="text-sm text-muted-foreground mb-5">
          {formatToday()} · {getGreeting()}
        </p>

        {/* 검색바 */}
        <div className="relative max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              aria-label="도구 검색"
              placeholder="도구 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {/* 검색 결과 드롭다운 */}
          {searchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-card shadow-lg z-50 overflow-hidden">
              {searchResults.map((tool) => (
                <button
                  key={tool.href}
                  type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors"
                  onMouseDown={() => {
                    setSearchQuery("");
                    router.push(tool.href);
                  }}
                >
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* ── 도구 모음 배너 ── */}
        <Link
          href="/tools"
          className="group flex items-center gap-4 p-6 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
        >
          <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
            <Wrench className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold mb-0.5">도구 모음</h2>
            <p className="text-sm text-muted-foreground">
              PDF, 계산기, 변환, 텍스트, 이미지, 생성기, 개발도구 등 70개 이상의 유틸리티
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        {/* ── 즐겨찾기 도구 (최대 3개) ── */}
        {favoriteTools.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {favoriteTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-center gap-3 p-4 rounded-lg border border-yellow-400/30 bg-yellow-400/5 hover:border-yellow-400/60 hover:shadow-sm transition-all"
              >
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{tool.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── 금융 시장 ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> 금융 시장
            </h2>
            <Link href="/finance" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              더보기 →
            </Link>
          </div>

          {financeError ? (
            <div role="alert" className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
              {financeError}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {financeLoading
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-card animate-pulse">
                      <div className="h-4 bg-muted rounded w-20 mb-3" />
                      <div className="h-6 bg-muted rounded w-28 mb-2" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  ))
                : FINANCE_SYMBOLS.map((symbol) => {
                    const q = quotes[symbol];
                    if (!q) return null;
                    const up = q.changePercent > 0;
                    const down = q.changePercent < 0;
                    const color = up
                      ? "text-red-500 dark:text-red-400"
                      : down
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-muted-foreground";
                    return (
                      <Link
                        key={symbol}
                        href="/finance"
                        className="p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {FINANCE_LABELS[symbol]}
                        </p>
                        <p className="text-lg font-semibold tabular-nums">
                          {formatPrice(symbol, q.price)}
                        </p>
                        <p className={`text-xs font-medium tabular-nums ${color}`}>
                          <span className="sr-only">{up ? "상승" : down ? "하락" : "보합"}</span>
                          {formatChange(symbol, q.change)} ({up ? "+" : ""}{q.changePercent.toFixed(2)}%)
                        </p>
                      </Link>
                    );
                  })}
            </div>
          )}
        </section>

        {/* ── 베스트셀러 도서 ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> 베스트셀러 도서
            </h2>
            <Link href="/books" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              더보기 →
            </Link>
          </div>

          {booksError ? (
            <div role="alert" className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
              {booksError}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {booksLoading
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
                      <div className="aspect-[2/3] bg-muted" />
                      <div className="p-2.5">
                        <div className="h-4 bg-muted rounded w-3/4 mb-1.5" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))
                : books.map((book) => (
                    <Link
                      key={book.itemId}
                      href="/books"
                      className="group rounded-lg border bg-card overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2.5">
                        <p className="text-sm font-medium line-clamp-2" title={book.title}>
                          {book.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {book.author}
                        </p>
                      </div>
                    </Link>
                  ))}
            </div>
          )}
        </section>

        {/* ── 공휴일 달력 ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> 공휴일 달력
            </h2>
            <Link href="/calendar" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              달력 보기 →
            </Link>
          </div>

          {nextHoliday ? (
            <Link
              href="/calendar"
              className="group flex items-center justify-between p-5 rounded-xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">다음 공휴일</p>
                <p className="text-lg font-semibold">{nextHoliday.name}</p>
                <p className="text-sm text-muted-foreground">
                  {nextHoliday.date.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {(() => {
                  const dday = getDday(nextHoliday.date);
                  if (dday === 0) return <span className="text-3xl font-bold text-primary">D-Day</span>;
                  if (dday > 0) return <span className="text-3xl font-bold text-primary">D-{dday}</span>;
                  return null;
                })()}
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ) : (
            <div className="p-5 rounded-xl border bg-card text-sm text-muted-foreground">
              공휴일 데이터가 없습니다
            </div>
          )}
        </section>

        {/* ── Steam 할인 특가 ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" /> Steam 할인 특가
            </h2>
            <Link href="/steam" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              더보기 →
            </Link>
          </div>

          {steamError ? (
            <div role="alert" className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
              {steamError}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {steamLoading
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="rounded-lg border bg-card overflow-hidden animate-pulse">
                      <div className="aspect-[231/87] bg-muted" />
                      <div className="p-2.5">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))
                : steamGames.map((game) => (
                    <Link
                      key={game.id}
                      href="/steam"
                      className="group rounded-lg border bg-card overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={game.large_capsule_image}
                          alt={game.name}
                          className="w-full aspect-[231/87] object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2.5">
                        <p className="text-sm font-medium line-clamp-1" title={game.name}>
                          {game.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          {game.discount_percent > 0 && (
                            <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-green-600 text-white">
                              -{game.discount_percent}%
                            </span>
                          )}
                          <span className="text-sm font-medium">
                            {formatKRW(game.final_price)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
