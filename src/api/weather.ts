// Open-Meteo API — 한국 주요 도시 날씨

interface CityConfig {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

const CITIES: CityConfig[] = [
  { id: "seoul", name: "서울", lat: 37.5665, lon: 126.978 },
  { id: "busan", name: "부산", lat: 35.1796, lon: 129.0756 },
  { id: "incheon", name: "인천", lat: 37.4563, lon: 126.7052 },
  { id: "daegu", name: "대구", lat: 35.8714, lon: 128.6014 },
  { id: "daejeon", name: "대전", lat: 36.3504, lon: 127.3845 },
  { id: "gwangju", name: "광주", lat: 35.1595, lon: 126.8526 },
  { id: "ulsan", name: "울산", lat: 35.5384, lon: 129.3114 },
  { id: "jeju", name: "제주", lat: 33.4996, lon: 126.5312 },
];

const KV_KEY = "weather-forecast";

async function fetchFromOpenMeteo(): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    latitude: CITIES.map((c) => c.lat).join(","),
    longitude: CITIES.map((c) => c.lon).join(","),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "sunrise",
      "sunset",
    ].join(","),
    timezone: "Asia/Seoul",
    models: "kma_seamless",
    forecast_days: "7",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  let res: Response | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2000 * attempt));
    res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "AlphaTools/1.0 (https://tools.alphak.workers.dev)" },
    });
    if (res.status !== 429) break;
  }

  if (!res || !res.ok) throw new Error(`Open-Meteo ${res?.status}`);

  const results: unknown[] = await res.json();
  const cities: Record<string, unknown> = {};

  results.forEach((data: any, i: number) => {
    const city = CITIES[i];
    const hourly = data.hourly;
    cities[city.id] = {
      id: city.id,
      name: city.name,
      current: data.current,
      hourly: {
        time: hourly.time.slice(0, 48),
        temperature_2m: hourly.temperature_2m.slice(0, 48),
        precipitation_probability: (hourly.precipitation_probability ?? []).slice(0, 48),
        weather_code: hourly.weather_code.slice(0, 48),
      },
      daily: data.daily,
    };
  });

  return cities;
}

/** Cron trigger: 30분마다 날씨 데이터를 KV에 저장 */
export async function refreshWeatherCache(kv: KVNamespace): Promise<void> {
  try {
    const cities = await fetchFromOpenMeteo();
    if (Object.keys(cities).length > 0) {
      await kv.put(
        KV_KEY,
        JSON.stringify({ cities, timestamp: Date.now() }),
        { expirationTtl: 3600 } // 1시간 후 자동 만료 (백업)
      );
      console.log(`Weather cache updated: ${Object.keys(cities).length} cities`);
    }
  } catch (err) {
    console.error("Weather cache refresh failed:", err);
  }
}

/** API 핸들러: KV에서 읽기, 없으면 직접 fetch 시도 */
export async function handleWeatherForecast(kv: KVNamespace): Promise<Response> {
  // KV에서 캐시된 데이터 조회
  const cached = await kv.get(KV_KEY);
  if (cached) {
    return new Response(cached, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  }

  // KV에 없으면 직접 fetch 시도 (최초 배포 등)
  let cities: Record<string, unknown> = {};
  try {
    cities = await fetchFromOpenMeteo();
    if (Object.keys(cities).length > 0) {
      await kv.put(
        KV_KEY,
        JSON.stringify({ cities, timestamp: Date.now() }),
        { expirationTtl: 3600 }
      );
    }
  } catch (err) {
    console.error("Weather fetch failed:", err);
  }

  return new Response(
    JSON.stringify({ cities, timestamp: Date.now() }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    }
  );
}
