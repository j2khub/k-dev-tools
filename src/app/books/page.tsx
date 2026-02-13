"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Clock, Star, Sparkles, PenLine } from "lucide-react";

// ── 타입 ──

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

interface BooksData {
  bestsellers: BookItem[];
  newSpecial: BookItem[];
  blogBest: BookItem[];
  timestamp: number;
}

// ── 가격 포맷 ──

function formatKRW(price: number): string {
  if (price === 0) return "무료";
  return price.toLocaleString("ko-KR") + "원";
}

// ── 책 카드 ──

function BookCard({ book }: { book: BookItem }) {
  return (
    <a
      href={book.link}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border bg-card hover:border-primary/30 transition-colors overflow-hidden group"
    >
      <div className="aspect-[2/3] bg-muted overflow-hidden">
        <img
          src={book.cover}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-2.5">
        <p
          className="text-sm font-medium line-clamp-2 leading-snug"
          title={book.title}
        >
          {book.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
          {book.author}
        </p>
        <div className="mt-1.5">
          {book.priceSales < book.priceStandard && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatKRW(book.priceStandard)}
            </p>
          )}
          <p className="text-sm font-bold tabular-nums">
            {formatKRW(book.priceSales)}
          </p>
        </div>
      </div>
    </a>
  );
}

// ── 스켈레톤 카드 ──

function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-muted" />
      <div className="p-2.5">
        <div className="h-4 bg-muted rounded w-3/4 mb-1.5" />
        <div className="h-3 bg-muted rounded w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

// ── 섹션 컴포넌트 ──

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
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

export default function BooksPage() {
  const [data, setData] = useState<BooksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/aladin/bestsellers");
      if (!res.ok) throw new Error("데이터를 불러올 수 없습니다");
      const json = await res.json();
      setData(json);
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
  }, [fetchData]);

  const skeletons = Array.from({ length: 10 }, (_, i) => (
    <SkeletonCard key={i} />
  ));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-2xl font-bold">베스트셀러 도서</h1>
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

      {/* 베스트셀러 */}
      <Section
        icon={<Star className="h-5 w-5 text-yellow-500" />}
        title="베스트셀러"
      >
        {loading
          ? skeletons
          : data?.bestsellers.map((book) => (
              <BookCard key={book.itemId} book={book} />
            ))}
      </Section>

      {/* 주목할만한 신간 */}
      <Section
        icon={<Sparkles className="h-5 w-5 text-blue-500" />}
        title="주목할만한 신간"
      >
        {loading
          ? skeletons
          : data?.newSpecial.map((book) => (
              <BookCard key={book.itemId} book={book} />
            ))}
      </Section>

      {/* 블로거 베스트 */}
      <Section
        icon={<PenLine className="h-5 w-5 text-purple-500" />}
        title="블로거 베스트"
      >
        {loading
          ? skeletons
          : data?.blogBest.map((book) => (
              <BookCard key={book.itemId} book={book} />
            ))}
      </Section>

      {/* 출처 */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        데이터 출처: 알라딘 OpenAPI | 캐시 주기: 1시간
      </p>
    </div>
  );
}
