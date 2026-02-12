"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DateDiff() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const diff = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    // Calculate weekdays only
    let weekdays = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        weekdays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return {
      days: Math.abs(daysDiff),
      weeks: Math.abs(Math.floor(daysDiff / 7)),
      months: Math.abs(
        (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth())
      ),
      years: Math.abs(
        Math.floor(
          (end.getFullYear() - start.getFullYear()) +
            (end.getMonth() - start.getMonth()) / 12
        )
      ),
      weekdays: Math.abs(weekdays),
      isNegative: daysDiff < 0,
    };
  }, [startDate, endDate]);

  const handleSwap = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
  };

  return (
    <ToolLayout
      title="날짜 차이 계산기"
      description="두 날짜 사이의 차이를 일, 주, 월, 년 단위로 계산합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="start-date">시작일</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              className="w-full max-w-[120px]"
            >
              ↑↓ 바꾸기
            </Button>
          </div>
          <div>
            <Label htmlFor="end-date">종료일</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>

        {diff !== null && (
          <div className="space-y-3">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">
                날짜 차이
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">일</div>
                  <div className="text-xl font-bold font-mono">
                    {diff.days.toLocaleString()}일
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">주</div>
                  <div className="text-xl font-bold font-mono">
                    {diff.weeks.toLocaleString()}주
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">월</div>
                  <div className="text-xl font-bold font-mono">
                    {diff.months.toLocaleString()}개월
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">년</div>
                  <div className="text-xl font-bold font-mono">
                    {diff.years.toLocaleString()}년
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                평일만 계산
              </div>
              <div className="text-2xl font-bold font-mono">
                {diff.weekdays.toLocaleString()}일
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                주말 제외 (월~금)
              </div>
            </div>

            {diff.isNegative && (
              <div className="text-sm text-amber-600 dark:text-amber-400 text-center">
                시작일이 종료일보다 나중입니다
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <div>시작일: {startDate}</div>
            <div>종료일: {endDate}</div>
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
