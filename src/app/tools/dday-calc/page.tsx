"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DdayCalc() {
  const today = new Date().toISOString().split("T")[0];
  const [targetDate, setTargetDate] = useState("");

  const dday = useMemo(() => {
    if (!targetDate) return null;

    const target = new Date(targetDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    if (isNaN(target.getTime())) return null;

    const timeDiff = target.getTime() - now.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Calculate years, months, days breakdown
    let years = target.getFullYear() - now.getFullYear();
    let months = target.getMonth() - now.getMonth();
    let days = target.getDate() - now.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Handle past dates
    if (timeDiff < 0) {
      years = Math.abs(years);
      months = Math.abs(months);
      days = Math.abs(days);
    }

    return {
      days: daysDiff,
      isPast: daysDiff < 0,
      isToday: daysDiff === 0,
      years: Math.abs(years),
      months: Math.abs(months),
      daysOnly: Math.abs(days),
    };
  }, [targetDate]);

  const quickButtons = [
    { label: "오늘", days: 0 },
    { label: "7일 후", days: 7 },
    { label: "30일 후", days: 30 },
    { label: "100일 후", days: 100 },
    { label: "200일 후", days: 200 },
    { label: "1년 후", days: 365 },
    { label: "졸업 (2027-02-01)", date: "2027-02-01" },
    { label: "수능 (2026-11-12)", date: "2026-11-12" },
  ];

  const handleQuickButton = (days?: number, date?: string) => {
    if (date) {
      setTargetDate(date);
    } else if (days !== undefined) {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + days);
      setTargetDate(newDate.toISOString().split("T")[0]);
    }
  };

  return (
    <ToolLayout
      title="디데이 계산기"
      description="목표 날짜까지 남은 일수를 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <div>
          <Label htmlFor="target-date">목표 날짜</Label>
          <Input
            id="target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="font-mono"
          />
        </div>

        <div>
          <Label className="mb-3 block">빠른 선택</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickButtons.map((btn, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleQuickButton(btn.days, btn.date)}
                className="text-xs"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>

        {dday !== null && (
          <div className="space-y-4">
            <div
              className={`p-6 rounded-lg ${
                dday.isToday
                  ? "bg-green-500/20 border border-green-500/30"
                  : dday.isPast
                  ? "bg-muted"
                  : "bg-primary/10"
              }`}
            >
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  {dday.isToday
                    ? "오늘이 그날!"
                    : dday.isPast
                    ? "지난 날"
                    : "남은 일수"}
                </div>
                <div className="text-5xl font-bold font-mono">
                  {dday.isToday
                    ? "D-Day"
                    : dday.isPast
                    ? `D+${Math.abs(dday.days)}`
                    : `D-${dday.days}`}
                </div>
                <div className="text-sm text-muted-foreground mt-3">
                  {targetDate}
                </div>
              </div>
            </div>

            {!dday.isToday && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-3 text-center">
                  기간 상세
                </div>
                <div className="flex justify-center gap-6">
                  {dday.years > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono">
                        {dday.years}
                      </div>
                      <div className="text-xs text-muted-foreground">년</div>
                    </div>
                  )}
                  {(dday.months > 0 || dday.years > 0) && (
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono">
                        {dday.months}
                      </div>
                      <div className="text-xs text-muted-foreground">개월</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono">
                      {dday.daysOnly}
                    </div>
                    <div className="text-xs text-muted-foreground">일</div>
                  </div>
                </div>
              </div>
            )}

            {!dday.isPast && !dday.isToday && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full">
                  <div className="text-sm text-muted-foreground">
                    총 {Math.abs(dday.days).toLocaleString()}일 남음
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!targetDate && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            목표 날짜를 선택하거나 빠른 선택 버튼을 눌러주세요
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
