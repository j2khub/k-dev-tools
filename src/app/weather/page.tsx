"use client";

import { useState, useEffect, useCallback } from "react";
import { CloudSun, Clock, Droplets, Wind, Thermometer, Sunrise, Sunset } from "lucide-react";

// ── Types ──

interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
}

interface HourlyData {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
}

interface DailyData {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  sunrise: string[];
  sunset: string[];
}

interface CityWeather {
  id: string;
  name: string;
  current: CurrentWeather;
  hourly: HourlyData;
  daily: DailyData;
}

// ── WMO 코드 매핑 ──

const WMO_MAP: Record<number, { text: string; emoji: string }> = {
  0: { text: "맑음", emoji: "☀️" },
  1: { text: "대체로 맑음", emoji: "🌤️" },
  2: { text: "구름 조금", emoji: "⛅" },
  3: { text: "흐림", emoji: "☁️" },
  45: { text: "안개", emoji: "🌫️" },
  48: { text: "안개", emoji: "🌫️" },
  51: { text: "이슬비", emoji: "🌦️" },
  53: { text: "이슬비", emoji: "🌦️" },
  55: { text: "이슬비", emoji: "🌦️" },
  56: { text: "진눈깨비", emoji: "🌧️" },
  57: { text: "진눈깨비", emoji: "🌧️" },
  61: { text: "비", emoji: "🌧️" },
  63: { text: "비", emoji: "🌧️" },
  65: { text: "폭우", emoji: "🌧️" },
  66: { text: "진눈깨비", emoji: "🌧️" },
  67: { text: "진눈깨비", emoji: "🌧️" },
  71: { text: "눈", emoji: "❄️" },
  73: { text: "눈", emoji: "❄️" },
  75: { text: "폭설", emoji: "❄️" },
  77: { text: "싸락눈", emoji: "❄️" },
  80: { text: "소나기", emoji: "🌧️" },
  81: { text: "소나기", emoji: "🌧️" },
  82: { text: "폭우", emoji: "🌧️" },
  85: { text: "눈", emoji: "❄️" },
  86: { text: "폭설", emoji: "❄️" },
  95: { text: "뇌우", emoji: "⛈️" },
  96: { text: "뇌우", emoji: "⛈️" },
  99: { text: "뇌우", emoji: "⛈️" },
};

function getWeather(code: number) {
  return WMO_MAP[code] ?? { text: "알 수 없음", emoji: "❓" };
}

function windDirection(deg: number): string {
  const dirs = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
  return dirs[Math.round(deg / 45) % 8];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

const CITY_ORDER = ["seoul", "busan", "incheon", "daegu", "daejeon", "gwangju", "ulsan", "jeju"];
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// ── Component ──

export default function WeatherPage() {
  const [cities, setCities] = useState<Record<string, CityWeather>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState("seoul");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/weather/forecast");
      if (!res.ok) throw new Error("날씨 데이터를 불러올 수 없습니다");
      const json = await res.json();
      setCities(json.cities);
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
    const interval = setInterval(() => fetchData(), 600_000); // 10분

    const onVisibility = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchData]);

  const city = cities[selectedCity];
  const now = new Date();
  const currentHour = now.getHours();
  const todayStr = now.toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* A. 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CloudSun className="h-6 w-6" />
          <h1 className="text-2xl font-bold">날씨</h1>
        </div>
        {lastUpdated && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(lastUpdated).toLocaleTimeString("ko-KR")} 기준
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-10 w-24 rounded-lg bg-muted animate-pulse shrink-0" />
            ))}
          </div>
          <div className="h-48 rounded-lg bg-muted animate-pulse" />
          <div className="h-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-32 rounded-lg bg-muted animate-pulse" />
        </div>
      ) : city ? (
        <>
          {/* B. 도시 탭 바 */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
            {CITY_ORDER.map((id) => {
              const c = cities[id];
              if (!c) return null;
              const w = getWeather(c.current.weather_code);
              const isActive = id === selectedCity;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedCity(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-colors shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-accent border-border"
                  }`}
                >
                  <span>{c.name}</span>
                  <span>{w.emoji}</span>
                  <span className="tabular-nums">{Math.round(c.current.temperature_2m)}°</span>
                </button>
              );
            })}
          </div>

          {/* C. 현재 날씨 히어로 카드 */}
          <div className="p-6 rounded-xl border bg-card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getWeather(city.current.weather_code).emoji}</span>
                <div>
                  <div className="text-4xl font-bold tabular-nums">
                    {city.current.temperature_2m.toFixed(1)}°C
                  </div>
                  <div className="text-muted-foreground mt-1">
                    {getWeather(city.current.weather_code).text}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Thermometer className="h-4 w-4 shrink-0" />
                  <span>체감 {city.current.apparent_temperature.toFixed(1)}°C</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-4 w-4 shrink-0" />
                  <span>습도 {city.current.relative_humidity_2m}%</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="h-4 w-4 shrink-0" />
                  <span>{windDirection(city.current.wind_direction_10m)} {city.current.wind_speed_10m.toFixed(1)}km/h</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Droplets className="h-4 w-4 shrink-0" />
                  <span>강수 {city.current.precipitation}mm</span>
                </div>
                {city.daily.sunrise?.[0] && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sunrise className="h-4 w-4 shrink-0" />
                    <span>{formatTime(city.daily.sunrise[0])}</span>
                  </div>
                )}
                {city.daily.sunset?.[0] && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sunset className="h-4 w-4 shrink-0" />
                    <span>{formatTime(city.daily.sunset[0])}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* D. 시간별 기온 차트 (오늘) */}
          <div className="p-5 rounded-xl border bg-card mb-6">
            <h2 className="text-lg font-semibold mb-4">시간별 기온</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-1 items-end min-w-[600px]" style={{ height: 180 }}>
                {(() => {
                  // 오늘 24시간만 필터
                  const todayIndices: number[] = [];
                  city.hourly.time.forEach((t, i) => {
                    if (t.startsWith(todayStr) && todayIndices.length < 24) {
                      todayIndices.push(i);
                    }
                  });

                  const temps = todayIndices.map((i) => city.hourly.temperature_2m[i]);
                  const minT = Math.min(...temps);
                  const maxT = Math.max(...temps);
                  const range = maxT - minT || 1;

                  return todayIndices.map((idx) => {
                    const temp = city.hourly.temperature_2m[idx];
                    const precip = city.hourly.precipitation_probability[idx];
                    const hour = new Date(city.hourly.time[idx]).getHours();
                    const heightPct = ((temp - minT) / range) * 70 + 20; // 20~90%
                    const isCurrent = hour === currentHour;
                    const isRainy = precip >= 50;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center flex-1 min-w-0"
                        style={{ height: "100%" }}
                      >
                        <span className="text-[10px] tabular-nums text-muted-foreground mb-1">
                          {Math.round(temp)}°
                        </span>
                        <div className="flex-1 flex items-end w-full px-0.5">
                          <div
                            className={`w-full rounded-t transition-all ${
                              isCurrent
                                ? "bg-primary"
                                : isRainy
                                  ? "bg-blue-400 dark:bg-blue-500"
                                  : "bg-muted-foreground/30"
                            }`}
                            style={{ height: `${heightPct}%` }}
                            title={`${hour}시: ${temp.toFixed(1)}°C, 강수확률 ${precip}%`}
                          />
                        </div>
                        <span
                          className={`text-[10px] mt-1 tabular-nums ${
                            isCurrent ? "font-bold text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {hour}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-primary" /> 현재
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-blue-400 dark:bg-blue-500" /> 강수확률 50%+
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-muted-foreground/30" /> 기본
              </span>
            </div>
          </div>

          {/* E. 7일 예보 */}
          <div className="p-5 rounded-xl border bg-card mb-6">
            <h2 className="text-lg font-semibold mb-4">7일 예보</h2>
            <div className="grid grid-cols-7 gap-2 max-sm:flex max-sm:overflow-x-auto max-sm:gap-3">
              {city.daily.time.map((dateStr, i) => {
                const d = new Date(dateStr + "T00:00:00+09:00");
                const dayName = DAY_NAMES[d.getDay()];
                const w = getWeather(city.daily.weather_code[i]);
                const isToday = dateStr === todayStr;
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                return (
                  <div
                    key={dateStr}
                    className={`flex flex-col items-center p-3 rounded-lg text-center transition-colors max-sm:min-w-[80px] max-sm:shrink-0 ${
                      isToday ? "bg-primary/10 border border-primary/30" : "hover:bg-accent"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium mb-1 ${
                        isToday
                          ? "text-primary"
                          : isWeekend
                            ? "text-red-500 dark:text-red-400"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isToday ? "오늘" : dayName}
                    </span>
                    <span className="text-xs text-muted-foreground mb-2">
                      {d.getMonth() + 1}/{d.getDate()}
                    </span>
                    <span className="text-2xl mb-2">{w.emoji}</span>
                    <div className="text-sm tabular-nums">
                      <span className="font-semibold text-red-500 dark:text-red-400">
                        {Math.round(city.daily.temperature_2m_max[i])}°
                      </span>
                      <span className="text-muted-foreground mx-0.5">/</span>
                      <span className="text-blue-500 dark:text-blue-400">
                        {Math.round(city.daily.temperature_2m_min[i])}°
                      </span>
                    </div>
                    {city.daily.precipitation_sum[i] > 0 && (
                      <span className="text-[10px] text-blue-500 mt-1 tabular-nums">
                        {city.daily.precipitation_sum[i].toFixed(1)}mm
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* F. 전체 도시 한눈에 */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">전체 도시 한눈에</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CITY_ORDER.map((id) => {
                const c = cities[id];
                if (!c) return null;
                const w = getWeather(c.current.weather_code);
                const isActive = id === selectedCity;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedCity(id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      isActive
                        ? "border-primary/50 bg-primary/5"
                        : "bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{c.name}</span>
                      <span className="text-xl">{w.emoji}</span>
                    </div>
                    <div className="text-xl font-bold tabular-nums">
                      {Math.round(c.current.temperature_2m)}°C
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums mt-1">
                      <span className="text-red-500 dark:text-red-400">
                        {Math.round(c.daily.temperature_2m_max[0])}°
                      </span>
                      <span className="mx-0.5">/</span>
                      <span className="text-blue-500 dark:text-blue-400">
                        {Math.round(c.daily.temperature_2m_min[0])}°
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* G. 출처 */}
          <p className="text-xs text-muted-foreground text-center">
            데이터: Open-Meteo (KMA 모델) | 30분 캐시
          </p>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          날씨 데이터가 없습니다
        </div>
      )}
    </div>
  );
}
