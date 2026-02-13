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

async function fetchList(apiKey: string, queryType: string, maxResults: number): Promise<BookItem[]> {
  const res = await fetch(buildUrl(apiKey, queryType, maxResults), {
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    throw new Error(`Aladin API ${queryType} 응답 오류: ${res.status}`);
  }

  const json = (await res.json()) as AladinResponse;
  return (json.item ?? []).slice(0, maxResults).map(mapBook);
}

async function fetchBestsellers(apiKey: string, maxResults: number): Promise<BookItem[]> {
  const items = await fetchList(apiKey, "Bestseller", maxResults);
  if (items.length > 0) return items;

  const now = new Date();
  const prevWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const year = prevWeek.getFullYear();
  const month = prevWeek.getMonth() + 1;
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

export async function handleAladinBestsellers(apiKey: string): Promise<Response> {
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
      JSON.stringify({ bestsellers, newSpecial, blogBest, timestamp: Date.now() }),
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
}
