"use client";

import { useState, useEffect, useCallback } from "react";
import { Gamepad2, Clock, Tag } from "lucide-react";

// ── 타입 ──

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

interface FeaturedData {
  specials: SteamGame[];
  top_sellers: SteamGame[];
  timestamp: number;
}

// ── 가격 포맷 ──

function formatKRW(cents: number | null): string {
  if (cents === null) return "";
  if (cents === 0) return "무료";
  const won = Math.round(cents / 100);
  return "₩" + won.toLocaleString("ko-KR");
}

// ── 게임 카드 ──

function GameCard({ game }: { game: SteamGame }) {
  const storeUrl = `https://store.steampowered.com/app/${game.id}`;

  return (
    <a
      href={storeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border bg-card hover:border-primary/30 transition-colors overflow-hidden group"
    >
      <div className="aspect-[231/87] bg-muted overflow-hidden">
        <img
          src={game.large_capsule_image}
          alt={game.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-2.5">
        <p className="text-sm font-medium line-clamp-1" title={game.name}>
          {game.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {game.discounted && game.discount_percent > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-bold rounded bg-green-600 text-white">
              -{game.discount_percent}%
            </span>
          )}
          <span className="text-sm font-bold tabular-nums">
            {formatKRW(game.final_price)}
          </span>
        </div>
        {game.discounted && game.original_price !== null && game.original_price !== game.final_price && (
          <p className="text-xs text-muted-foreground line-through tabular-nums mt-0.5">
            {formatKRW(game.original_price)}
          </p>
        )}
        {!game.discounted && game.final_price === null && (
          <p className="text-xs text-muted-foreground mt-1">가격 정보 없음</p>
        )}
      </div>
    </a>
  );
}

// ── 스켈레톤 카드 ──

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[231/87] bg-muted" />
      <div className="p-2.5">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

// ── 섹션 컴포넌트 ──

function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {children}
      </div>
    </div>
  );
}

// ── 메인 페이지 ──

export default function SteamPage() {
  const [featured, setFeatured] = useState<FeaturedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/steam/featured");
      if (!res.ok) throw new Error("데이터를 불러올 수 없습니다");
      const json = await res.json();
      setFeatured(json);
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

  const skeletons = Array.from({ length: 10 }, (_, i) => (
    <SkeletonCard key={i} />
  ));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Steam 트렌드</h1>
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

      {/* 할인 특가 */}
      <Section icon={<Tag className="h-5 w-5 text-green-500" />} title="할인 특가">
        {loading
          ? skeletons
          : featured?.specials.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
      </Section>

      {/* 인기 판매 */}
      <Section icon={<span className="text-base">🏆</span>} title="인기 판매">
        {loading
          ? skeletons
          : featured?.top_sellers.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
      </Section>

      {/* 안내 */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        데이터 출처: Steam Store API | 캐시 주기: 10분
      </p>
    </div>
  );
}
