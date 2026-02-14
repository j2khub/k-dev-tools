"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react";

import Holidays from "date-holidays";
import {
  y2018, y2019, y2020, y2021, y2022, y2023, y2024, y2025, y2026,
} from "@hyunbinseo/holidays-kr";

// holidays-kr: 관보(월력요항) 기반 정확한 한국 공휴일 데이터
const KR_DATA: Record<number, Readonly<Record<string, ReadonlyArray<string>>>> = {
  2018: y2018, 2019: y2019, 2020: y2020, 2021: y2021,
  2022: y2022, 2023: y2023, 2024: y2024, 2025: y2025, 2026: y2026,
};

const COUNTRIES = [
  { code: "KR", name: "대한민국" },
  { code: "US", name: "미국" },
  { code: "JP", name: "일본" },
  { code: "CN", name: "중국" },
  { code: "GB", name: "영국" },
  { code: "DE", name: "독일" },
  { code: "FR", name: "프랑스" },
  { code: "CA", name: "캐나다" },
  { code: "AU", name: "호주" },
  { code: "TW", name: "대만" },
  { code: "VN", name: "베트남" },
  { code: "TH", name: "태국" },
  { code: "SG", name: "싱가포르" },
];

const TIMEZONES: Record<string, { zone: string; label: string }> = {
  KR: { zone: "Asia/Seoul", label: "KST" },
  US: { zone: "America/New_York", label: "ET" },
  JP: { zone: "Asia/Tokyo", label: "JST" },
  CN: { zone: "Asia/Shanghai", label: "CST" },
  GB: { zone: "Europe/London", label: "GMT" },
  DE: { zone: "Europe/Berlin", label: "CET" },
  FR: { zone: "Europe/Paris", label: "CET" },
  CA: { zone: "America/Toronto", label: "ET" },
  AU: { zone: "Australia/Sydney", label: "AEST" },
  TW: { zone: "Asia/Taipei", label: "CST" },
  VN: { zone: "Asia/Ho_Chi_Minh", label: "ICT" },
  TH: { zone: "Asia/Bangkok", label: "ICT" },
  SG: { zone: "Asia/Singapore", label: "SGT" },
};

function useCountryClock(countryCode: string) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tz = TIMEZONES[countryCode]?.zone ?? "UTC";
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("ko-KR", {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [countryCode]);

  return { time, label: TIMEZONES[countryCode]?.label ?? "" };
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

interface Holiday {
  date: string;
  name: string;
  type: string;
  start: Date;
}

/** 한국 공휴일 — holidays-kr 관보 데이터 사용 */
function getKoreanHolidays(year: number): Holiday[] {
  const data = KR_DATA[year];
  if (!data) return []; // 데이터 없는 연도
  const holidays: Holiday[] = [];
  for (const [dateStr, names] of Object.entries(data)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const start = new Date(y, m - 1, d);
    for (const name of names) {
      holidays.push({ date: dateStr, name, type: "public", start });
    }
  }
  return holidays;
}

/** 기타 국가 — date-holidays 사용 */
function getOtherHolidays(countryCode: string, year: number): Holiday[] {
  const hd = new Holidays(countryCode);
  const raw = hd.getHolidays(year) || [];
  return raw
    .filter((h: { type: string }) => h.type === "public")
    .map((h: { date: string; name: string; type: string }) => {
      const parts = h.date.split(" ")[0].split("-");
      const start = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return { date: h.date, name: h.name, type: h.type, start };
    })
    .filter((h) => h.start.getFullYear() === year);
}

function getHolidays(countryCode: string, year: number): Holiday[] {
  if (countryCode === "KR") return getKoreanHolidays(year);
  return getOtherHolidays(countryCode, year);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDday(targetDate: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function CalendarPage() {
  const now = new Date();
  const [country, setCountry] = useState("KR");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const clock = useCountryClock(country);

  const holidays = useMemo(() => getHolidays(country, year), [country, year]);

  const holidayMap = useMemo(() => {
    const map = new Map<string, Holiday[]>();
    for (const h of holidays) {
      const key = formatDate(h.start);
      const arr = map.get(key) || [];
      arr.push(h);
      map.set(key, arr);
    }
    return map;
  }, [holidays]);

  const monthHolidays = useMemo(
    () =>
      holidays.filter((h) => h.start.getMonth() === month),
    [holidays, month]
  );

  const nextHoliday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return holidays.find((h) => {
      const d = new Date(h.start);
      d.setHours(0, 0, 0, 0);
      return d >= today;
    });
  }, [holidays]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  const todayStr = formatDate(now);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="h-6 w-6" />
        <h1 className="text-2xl font-bold">공휴일 달력</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="px-3 py-2 text-sm border rounded-md bg-background"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 text-sm border rounded-md bg-background"
        >
          {(() => {
            const krYears = Object.keys(KR_DATA).map(Number);
            const minYear = country === "KR" ? Math.min(...krYears) : now.getFullYear() - 5;
            const maxYear = country === "KR" ? Math.max(...krYears) : now.getFullYear() + 5;
            return Array.from(
              { length: maxYear - minYear + 1 },
              (_, i) => minYear + i
            ).map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ));
          })()}
        </select>

        <button
          onClick={goToToday}
          className="px-3 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
        >
          오늘
        </button>

        <div className="flex items-center gap-1.5 ml-auto px-3 py-2 text-sm border rounded-md bg-card tabular-nums">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono">{clock.time}</span>
          <span className="text-xs text-muted-foreground">{clock.label}</span>
        </div>
      </div>

      {/* D-day banner */}
      {nextHoliday && (
        <div className="mb-6 p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">다음 공휴일</p>
              <p className="font-semibold">{nextHoliday.name}</p>
              <p className="text-sm text-muted-foreground">
                {nextHoliday.start.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </p>
            </div>
            <div className="text-right">
              {(() => {
                const dday = getDday(nextHoliday.start);
                if (dday === 0) return <span className="text-2xl font-bold text-primary">D-Day</span>;
                if (dday > 0) return <span className="text-2xl font-bold text-primary">D-{dday}</span>;
                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="border rounded-lg overflow-hidden mb-6">
        {/* Month navigation */}
        <div className="flex items-center justify-between p-3 border-b bg-card">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">
            {year}년 {MONTHS[month]}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div role="row" className="grid grid-cols-7 border-b bg-muted/50">
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              role="columnheader"
              className={`py-2 text-center text-xs font-medium ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[72px] border-b border-r p-1" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayOfWeek = (firstDay + i) % 7;
            const isToday = dateStr === todayStr;
            const dayHolidays = holidayMap.get(dateStr);
            const isHoliday = !!dayHolidays;
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;

            return (
              <div
                key={day}
                className={`min-h-[72px] border-b border-r p-1 ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${
                    isToday
                      ? "bg-primary text-primary-foreground font-bold"
                      : isHoliday || isSunday
                        ? "text-red-500 font-medium"
                        : isSaturday
                          ? "text-blue-500"
                          : ""
                  }`}
                >
                  {day}
                </span>
                {dayHolidays?.map((h, idx) => (
                  <div
                    key={idx}
                    className="mt-0.5 px-1 py-0.5 text-[10px] leading-tight rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 truncate"
                    title={h.name}
                  >
                    {h.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly holiday list */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-3 border-b bg-card">
          <h3 className="font-semibold">
            {MONTHS[month]} 공휴일 ({monthHolidays.length}개)
          </h3>
        </div>
        {monthHolidays.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            이번 달 공휴일이 없습니다
          </div>
        ) : (
          <ul className="divide-y">
            {monthHolidays.map((h, i) => {
              const dday = getDday(h.start);
              return (
                <li key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-medium text-sm">{h.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {h.start.toLocaleDateString("ko-KR", {
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      dday === 0
                        ? "text-primary"
                        : dday > 0
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {dday === 0 ? "오늘" : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
