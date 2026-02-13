// Cloudflare Pages Function — Steam Store 할인/인기 프록시
// URL: /api/steam/featured

interface SteamStoreItem {
  id: number;
  name: string;
  discounted: boolean;
  discount_percent: number;
  original_price: number | null;
  final_price: number | null;
  currency: string;
  large_capsule_image: string;
  small_capsule_image: string;
  windows_available: boolean;
  mac_available: boolean;
  linux_available: boolean;
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

function mapGame(item: SteamStoreItem): SteamGame {
  return {
    id: item.id,
    name: item.name,
    discounted: item.discounted,
    discount_percent: item.discount_percent,
    original_price: item.original_price,
    final_price: item.final_price,
    currency: item.currency,
    large_capsule_image: item.large_capsule_image,
    small_capsule_image: item.small_capsule_image,
  };
}

export const onRequest: PagesFunction = async () => {
  try {
    const res = await fetch(
      "https://store.steampowered.com/api/featuredcategories/?cc=KR&l=koreana",
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Steam API 응답 오류" }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const json = await res.json() as Record<string, { items?: SteamStoreItem[] }>;

    const specials = (json.specials?.items ?? []).slice(0, 10).map(mapGame);
    const top_sellers = (json.top_sellers?.items ?? []).slice(0, 10).map(mapGame);

    return new Response(
      JSON.stringify({
        specials,
        top_sellers,
        timestamp: Date.now(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=600, s-maxage=600",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Steam API 요청 실패" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
};
