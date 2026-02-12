"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Mode = "of" | "is" | "change";

export default function PercentageCalc() {
  const [mode, setMode] = useState<Mode>("of");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");

  const result = useMemo(() => {
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);

    if (isNaN(v1) || isNaN(v2)) return null;

    switch (mode) {
      case "of":
        // A의 B%는?
        return (v1 * v2 / 100).toFixed(2);
      case "is":
        // A는 B의 몇 %?
        if (v2 === 0) return null;
        return ((v1 / v2) * 100).toFixed(2);
      case "change":
        // A에서 B% 증가
        return (v1 * (1 + v2 / 100)).toFixed(2);
      default:
        return null;
    }
  }, [mode, value1, value2]);

  const resultDecrease = useMemo(() => {
    if (mode !== "change") return null;
    const v1 = parseFloat(value1);
    const v2 = parseFloat(value2);
    if (isNaN(v1) || isNaN(v2)) return null;
    return (v1 * (1 - v2 / 100)).toFixed(2);
  }, [mode, value1, value2]);

  return (
    <ToolLayout
      title="백분율 계산기"
      description="다양한 백분율 계산을 간편하게 수행합니다"
    >
      <Card className="p-4 space-y-6">
        <div>
          <Label className="mb-3 block">계산 모드</Label>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={mode === "of" ? "default" : "outline"}
              onClick={() => setMode("of")}
              className="flex-1 min-w-[140px]"
            >
              A의 B%는?
            </Button>
            <Button
              variant={mode === "is" ? "default" : "outline"}
              onClick={() => setMode("is")}
              className="flex-1 min-w-[140px]"
            >
              A는 B의 몇 %?
            </Button>
            <Button
              variant={mode === "change" ? "default" : "outline"}
              onClick={() => setMode("change")}
              className="flex-1 min-w-[140px]"
            >
              A에서 B% 증감
            </Button>
          </div>
        </div>

        {mode === "of" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value-a">값 (A)</Label>
                <Input
                  id="value-a"
                  type="number"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder="100"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="percentage">퍼센트 (B%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  placeholder="20"
                  className="font-mono"
                />
              </div>
            </div>
            {result !== null && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">결과</div>
                <div className="text-2xl font-bold font-mono">{result}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {value1}의 {value2}%
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "is" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value-a2">비교 값 (A)</Label>
                <Input
                  id="value-a2"
                  type="number"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder="25"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="value-b">기준 값 (B)</Label>
                <Input
                  id="value-b"
                  type="number"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  placeholder="100"
                  className="font-mono"
                />
              </div>
            </div>
            {result !== null && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">결과</div>
                <div className="text-2xl font-bold font-mono">{result}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {value1}은 {value2}의 {result}%
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "change" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base-value">기준 값 (A)</Label>
                <Input
                  id="base-value"
                  type="number"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  placeholder="100"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="change-percent">증감률 (B%)</Label>
                <Input
                  id="change-percent"
                  type="number"
                  value={value2}
                  onChange={(e) => setValue2(e.target.value)}
                  placeholder="20"
                  className="font-mono"
                />
              </div>
            </div>
            {result !== null && resultDecrease !== null && (
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    {value2}% 증가
                  </div>
                  <div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
                    {result}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {value1} + {value2}% = {result}
                  </div>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    {value2}% 감소
                  </div>
                  <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                    {resultDecrease}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {value1} - {value2}% = {resultDecrease}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
