"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KoreanLunarCalendar from "korean-lunar-calendar";

export default function LunarCalendar() {
  const today = new Date();
  const [solarYear, setSolarYear] = useState(today.getFullYear());
  const [solarMonth, setSolarMonth] = useState(today.getMonth() + 1);
  const [solarDay, setSolarDay] = useState(today.getDate());

  const [lunarYear, setLunarYear] = useState(today.getFullYear());
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarDay, setLunarDay] = useState(1);
  const [isLeap, setIsLeap] = useState(false);

  const calendar = new KoreanLunarCalendar();

  // 양력 → 음력
  let solarResult: string | null = null;
  let solarGanJi: string | null = null;
  try {
    calendar.setSolarDate(solarYear, solarMonth, solarDay);
    const lunar = calendar.getLunarCalendar();
    solarResult = `음력 ${lunar.year}년 ${lunar.intercalation ? "(윤)" : ""}${lunar.month}월 ${lunar.day}일`;
    const gapja = calendar.getGapja();
    solarGanJi = `${gapja.year} ${gapja.month} ${gapja.day}`;
  } catch {
    solarResult = null;
  }

  // 음력 → 양력
  let lunarResult: string | null = null;
  try {
    calendar.setLunarDate(lunarYear, lunarMonth, lunarDay, isLeap);
    const solar = calendar.getSolarCalendar();
    lunarResult = `양력 ${solar.year}년 ${solar.month}월 ${solar.day}일`;
  } catch {
    lunarResult = null;
  }

  return (
    <ToolLayout
      title="음력 ↔ 양력 변환기"
      description="음력 날짜와 양력 날짜를 상호 변환합니다"
    >
      <Card className="p-4">
        <Tabs defaultValue="solar-to-lunar">
          <TabsList className="mb-4">
            <TabsTrigger value="solar-to-lunar">양력 → 음력</TabsTrigger>
            <TabsTrigger value="lunar-to-solar">음력 → 양력</TabsTrigger>
          </TabsList>

          <TabsContent value="solar-to-lunar" className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={solarYear}
                onChange={(e) => setSolarYear(Number(e.target.value))}
                min={1900}
                max={2100}
                className="w-24 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
              />
              <span className="text-sm">년</span>
              <input
                type="number"
                value={solarMonth}
                onChange={(e) => setSolarMonth(Number(e.target.value))}
                min={1}
                max={12}
                className="w-16 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
              />
              <span className="text-sm">월</span>
              <input
                type="number"
                value={solarDay}
                onChange={(e) => setSolarDay(Number(e.target.value))}
                min={1}
                max={31}
                className="w-16 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
              />
              <span className="text-sm">일</span>
            </div>
            {solarResult ? (
              <div className="p-4 bg-muted rounded-md space-y-1">
                <div className="text-lg font-semibold">{solarResult}</div>
                {solarGanJi && (
                  <div className="text-sm text-muted-foreground">간지: {solarGanJi}</div>
                )}
              </div>
            ) : (
              <p className="text-sm text-destructive">유효하지 않은 날짜입니다</p>
            )}
          </TabsContent>

          <TabsContent value="lunar-to-solar" className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={lunarYear}
                onChange={(e) => setLunarYear(Number(e.target.value))}
                min={1900}
                max={2100}
                className="w-24 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
              />
              <span className="text-sm">년</span>
              <input
                type="number"
                value={lunarMonth}
                onChange={(e) => setLunarMonth(Number(e.target.value))}
                min={1}
                max={12}
                className="w-16 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
              />
              <span className="text-sm">월</span>
              <input
                type="number"
                value={lunarDay}
                onChange={(e) => setLunarDay(Number(e.target.value))}
                min={1}
                max={30}
                className="w-16 px-2 py-1.5 text-sm border rounded-md bg-transparent font-mono"
              />
              <span className="text-sm">일</span>
              <label className="flex items-center gap-1.5 text-sm ml-2">
                <input
                  type="checkbox"
                  checked={isLeap}
                  onChange={(e) => setIsLeap(e.target.checked)}
                  className="rounded"
                />
                윤달
              </label>
            </div>
            {lunarResult ? (
              <div className="p-4 bg-muted rounded-md">
                <div className="text-lg font-semibold">{lunarResult}</div>
              </div>
            ) : (
              <p className="text-sm text-destructive">유효하지 않은 날짜입니다</p>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </ToolLayout>
  );
}
