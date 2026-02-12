"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Unit = "B" | "KB" | "MB" | "GB" | "TB" | "PB";

const units: Unit[] = ["B", "KB", "MB", "GB", "TB", "PB"];

const unitLabels: Record<Unit, string> = {
  B: "바이트 (B)",
  KB: "킬로바이트 (KB)",
  MB: "메가바이트 (MB)",
  GB: "기가바이트 (GB)",
  TB: "테라바이트 (TB)",
  PB: "페타바이트 (PB)",
};

export default function DataUnitConverter() {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Unit>("MB");
  const [useBinary, setUseBinary] = useState(false);

  const multiplier = useBinary ? 1024 : 1000;

  const results = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return null;

    const unitIndex = units.indexOf(unit);
    const bytes = num * Math.pow(multiplier, unitIndex);

    return units.map((targetUnit) => {
      const targetIndex = units.indexOf(targetUnit);
      const converted = bytes / Math.pow(multiplier, targetIndex);
      return {
        unit: targetUnit,
        label: unitLabels[targetUnit],
        value: converted,
        formatted: converted.toLocaleString("ko-KR", {
          maximumFractionDigits: 6,
        }),
      };
    });
  }, [value, unit, multiplier]);

  return (
    <ToolLayout
      title="데이터 용량 변환기"
      description="데이터 용량 단위를 상호 변환합니다 (B, KB, MB, GB, TB, PB)"
    >
      <Card className="p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="value-input">값</Label>
            <Input
              id="value-input"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="1024"
              className="font-mono text-lg mt-1"
              step="any"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="unit-select">단위</Label>
            <select
              id="unit-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-transparent mt-1"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {unitLabels[u]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Label className="flex-1 cursor-pointer">
              {useBinary ? "1 KiB = 1024 B (Binary)" : "1 KB = 1000 B (SI)"}
            </Label>
            <Button
              variant={useBinary ? "default" : "outline"}
              size="sm"
              onClick={() => setUseBinary(!useBinary)}
            >
              {useBinary ? "Binary" : "SI"}
            </Button>
          </div>
        </div>

        {results && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              변환 결과
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.map((result) => (
                <div
                  key={result.unit}
                  className={`p-3 rounded-lg border ${
                    result.unit === unit
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {result.label}
                  </div>
                  <div className="text-xl font-bold font-mono">
                    {result.formatted}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {result.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results && (
          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <div className="text-muted-foreground mb-1">참고</div>
            <div className="space-y-1 text-xs">
              <p>
                • SI 표준: 1 KB = 1000 B (10의 거듭제곱)
              </p>
              <p>
                • Binary: 1 KiB = 1024 B (2의 거듭제곱)
              </p>
              <p className="text-muted-foreground/80 mt-2">
                일반적으로 하드디스크는 SI 단위를, 메모리는 Binary 단위를 사용합니다.
              </p>
            </div>
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
