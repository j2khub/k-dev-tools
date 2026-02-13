// Cloudflare Worker 진입점 — API 라우팅 + 정적 자산 폴백

import { handleFinanceQuotes } from "./api/finance";
import { handleSteamFeatured } from "./api/steam";
import { handleAladinBestsellers } from "./api/aladin";

interface Env {
  ASSETS: Fetcher;
  ALADIN_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API 라우팅
    if (url.pathname === "/api/finance/quotes") {
      return handleFinanceQuotes();
    }
    if (url.pathname === "/api/steam/featured") {
      return handleSteamFeatured();
    }
    if (url.pathname === "/api/aladin/bestsellers") {
      return handleAladinBestsellers(env.ALADIN_API_KEY);
    }

    // 정적 자산 폴백
    return env.ASSETS.fetch(request);
  },
};
