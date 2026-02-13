// Cloudflare Pages Function — 알라딘 베스트셀러/신간/블로거베스트 프록시
// URL: /api/aladin/bestsellers

interface Env {
  ALADIN_API_KEY: string;
}

interface AladinItem {
  itemId: number;
  title: string;
  link: string;
  author: string;
  pubDate: string;
  description: string;
  isbn13: string;
  priceSales: number;
  priceStandard: number;
  cover: string;
  categoryName: string;
  publisher: string;
}

interface AladinResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  item: AladinItem[];
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

function mapBook(item: AladinItem): BookItem {
  return {
    itemId: item.itemId,
    title: item.title,
    link: item.link,
    author: item.author,
    pubDate: item.pubDate,
    isbn13: item.isbn13,
    priceSales: item.priceSales,
    priceStandard: item.priceStandard,
    cover: item.cover.replace(/coversum/, "cover500"),
    categoryName: item.categoryName,
    publisher: item.publisher,
  };
}

function buildUrl(apiKey: string, queryType: string, maxResults: number, extra = ""): string {
  return (
    `https://www.aladin.co.kr/ttb/api/ItemList.aspx` +
    `?ttbkey=${apiKey}` +
    `&QueryType=${queryType}` +
    `&MaxResults=${maxResults}` +
    `&start=1` +
    `&SearchTarget=Book` +
    `&output=js` +
    `&Version=20131101` +
    extra
  );
}

async function fetchList(
  apiKey: string,
  queryType: string,
  maxResults: number
): Promise<BookItem[]> {
  const res = await fetch(buildUrl(apiKey, queryType, maxResults), {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Aladin API ${queryType} 응답 오류: ${res.status}`);
  }

  const json = (await res.json()) as AladinResponse;
  return (json.item ?? []).slice(0, maxResults).map(mapBook);
}

/** 베스트셀러: 현재 주차가 비어있으면 이전 주차로 폴백 */
async function fetchBestsellers(apiKey: string, maxResults: number): Promise<BookItem[]> {
  const items = await fetchList(apiKey, "Bestseller", maxResults);
  if (items.length > 0) return items;

  // 현재 주차 데이터가 없으면 이전 주차 시도
  const now = new Date();
  const prevWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const year = prevWeek.getFullYear();
  const month = prevWeek.getMonth() + 1;
  // 해당 월의 몇 번째 주인지 계산
  const firstDay = new Date(year, month - 1, 1);
  const week = Math.ceil((prevWeek.getDate() + firstDay.getDay()) / 7);

  const extra = `&Year=${year}&Month=${month}&Week=${week}`;
  const res = await fetch(buildUrl(apiKey, "Bestseller", maxResults, extra), {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];
  const json = (await res.json()) as AladinResponse;
  return (json.item ?? []).slice(0, maxResults).map(mapBook);
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.ALADIN_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API 키가 설정되지 않았습니다" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const [bestsellers, newSpecial, blogBest] = await Promise.all([
      fetchBestsellers(apiKey, 10),
      fetchList(apiKey, "ItemNewSpecial", 10),
      fetchList(apiKey, "BlogBest", 10),
    ]);

    return new Response(
      JSON.stringify({
        bestsellers,
        newSpecial,
        blogBest,
        timestamp: Date.now(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "알라딘 API 요청 실패" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
