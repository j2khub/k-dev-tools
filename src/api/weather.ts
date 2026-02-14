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

async function fetchCityWeather(city: CityConfig) {
  const params = new URLSearchParams({
    latitude: String(city.lat),
    longitude: String(city.lon),
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

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { signal: AbortSignal.timeout(8000) }
  );

  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

  const data = await res.json();

  // hourly 데이터: 오늘+내일만 필터 (48시간)
  const hourly = data.hourly;
  const trimmedHourly = {
    time: hourly.time.slice(0, 48),
    temperature_2m: hourly.temperature_2m.slice(0, 48),
    precipitation_probability: hourly.precipitation_probability.slice(0, 48),
    weather_code: hourly.weather_code.slice(0, 48),
  };

  return {
    id: city.id,
    name: city.name,
    current: data.current,
    hourly: trimmedHourly,
    daily: data.daily,
  };
}

export async function handleWeatherForecast(): Promise<Response> {
  const results = await Promise.allSettled(CITIES.map(fetchCityWeather));

  const cities: Record<string, unknown> = {};
  results.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value) {
      cities[CITIES[i].id] = r.value;
    }
  });

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
