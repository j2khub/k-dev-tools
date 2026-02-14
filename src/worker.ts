// Cloudflare Worker 진입점 — API 라우팅 + 정적 자산 폴백

import { handleFinanceQuotes } from "./api/finance";
import { handleSteamFeatured } from "./api/steam";
import { handleAladinBestsellers } from "./api/aladin";
import { handleWeatherForecast } from "./api/weather";

interface Env {
  ASSETS: Fetcher;
  ALADIN_API_KEY: string;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API 라우팅
    if (url.pathname === "/api/finance/quotes") {
      return withSecurityHeaders(await handleFinanceQuotes());
    }
    if (url.pathname === "/api/steam/featured") {
      return withSecurityHeaders(await handleSteamFeatured());
    }
    if (url.pathname === "/api/aladin/bestsellers") {
      return withSecurityHeaders(await handleAladinBestsellers(env.ALADIN_API_KEY));
    }
    if (url.pathname === "/api/weather/forecast") {
      return withSecurityHeaders(await handleWeatherForecast());
    }

    // 정적 자산 폴백
    const response = await env.ASSETS.fetch(request);
    return withSecurityHeaders(response);
  },
};
