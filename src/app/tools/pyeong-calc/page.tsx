"use client";

import { useState, useMemo, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PyeongCalc() {
  const [pyeong, setPyeong] = useState("");
  const [sqm, setSqm] = useState("");

  const PYEONG_TO_SQM = 3.305785;

  // Common apartment sizes
  const commonSizes = [
    { pyeong: 10, label: "10평" },
    { pyeong: 18, label: "18평" },
    { pyeong: 24, label: "24평" },
    { pyeong: 32, label: "32평" },
    { pyeong: 42, label: "42평" },
    { pyeong: 59, label: "59평" },
  ];

  const handlePyeongChange = (value: string) => {
    setPyeong(value);
    const p = parseFloat(value);
    if (!isNaN(p) && p > 0) {
      const calculated = (p * PYEONG_TO_SQM).toFixed(2);
      setSqm(calculated);
    } else {
      setSqm("");
    }
  };

  const handleSqmChange = (value: string) => {
    setSqm(value);
    const s = parseFloat(value);
    if (!isNaN(s) && s > 0) {
      const calculated = (s / PYEONG_TO_SQM).toFixed(2);
      setPyeong(calculated);
    } else {
      setPyeong("");
    }
  };

  const handleQuickSelect = (p: number) => {
    handlePyeongChange(p.toString());
  };

  return (
    <ToolLayout
      title="평수 변환기"
      description="평(坪)과 제곱미터(㎡)를 상호 변환합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="pyeong">평 (坪)</Label>
            <Input
              id="pyeong"
              type="text"
              value={pyeong}
              onChange={(e) => handlePyeongChange(e.target.value)}
              placeholder="예: 32"
              className="font-mono text-lg"
            />
          </div>
          <div>
            <Label htmlFor="sqm">제곱미터 (㎡)</Label>
            <Input
              id="sqm"
              type="text"
              value={sqm}
              onChange={(e) => handleSqmChange(e.target.value)}
              placeholder="예: 105.79"
              className="font-mono text-lg"
            />
          </div>
        </div>

        {pyeong && sqm && (
          <div className="p-6 rounded-lg border bg-primary/5 border-primary/20">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">
                {parseFloat(pyeong).toFixed(2)}평
                <span className="mx-2 text-muted-foreground">=</span>
                {parseFloat(sqm).toFixed(2)}㎡
              </div>
              <div className="text-xs text-muted-foreground">
                1평 = {PYEONG_TO_SQM}㎡
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="font-semibold mb-3">일반적인 아파트 평수</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {commonSizes.map((size) => {
              const sqmValue = (size.pyeong * PYEONG_TO_SQM).toFixed(2);
              return (
                <button
                  key={size.pyeong}
                  onClick={() => handleQuickSelect(size.pyeong)}
                  className="p-4 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  <div className="font-bold text-lg">{size.label}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {sqmValue}㎡
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-semibold text-sm">
            전용면적 vs 공급면적
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div>
              <div className="font-semibold mb-1">전용면적</div>
              <p className="text-muted-foreground">
                실제로 거주할 수 있는 내부 공간의 면적입니다. 벽체 중심선을 기준으로
                측정하며, 발코니는 제외됩니다.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">공급면적</div>
              <p className="text-muted-foreground">
                전용면적 + 주거공용면적(계단, 복도 등)을 포함한 면적입니다. 분양 시
                기준이 되는 면적으로, 전용면적보다 약 1.3~1.4배 정도 큽니다.
              </p>
            </div>
            <div>
              <div className="font-semibold mb-1">계약면적</div>
              <p className="text-muted-foreground">
                공급면적 + 기타공용면적(관리사무소, 주민공동시설 등)을 포함한 전체
                면적입니다. 관리비 산정의 기준이 됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="font-semibold mb-2 text-sm">예시</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>전용면적 32평 (105.79㎡)</span>
              <span className="font-mono">실제 거주 공간</span>
            </div>
            <div className="flex justify-between">
              <span>공급면적 약 43평 (142㎡)</span>
              <span className="font-mono">분양 면적</span>
            </div>
            <div className="flex justify-between">
              <span>계약면적 약 46평 (152㎡)</span>
              <span className="font-mono">관리비 산정 기준</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-4 py-2 font-semibold text-sm">
            평수 변환표
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">평</th>
                  <th className="px-3 py-2 text-right">㎡</th>
                  <th className="px-3 py-2 text-left">평</th>
                  <th className="px-3 py-2 text-right">㎡</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  [1, 5],
                  [10, 20],
                  [15, 25],
                  [18, 30],
                  [24, 40],
                  [32, 50],
                  [42, 60],
                  [59, 84],
                ].map(([p1, p2]) => (
                  <tr key={p1} className="hover:bg-muted/50">
                    <td className="px-3 py-2 font-mono">{p1}평</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {(p1 * PYEONG_TO_SQM).toFixed(2)}㎡
                    </td>
                    <td className="px-3 py-2 font-mono">{p2}평</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {(p2 * PYEONG_TO_SQM).toFixed(2)}㎡
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>1평 = 3.305785제곱미터 (㎡)</p>
          <p>1제곱미터 = 0.3025평</p>
          <p>평은 한국, 일본, 대만 등에서 사용하는 면적 단위입니다.</p>
          <p>2007년부터 부동산 거래 시 제곱미터 표기가 의무화되었습니다.</p>
        </div>
      </Card>
    </ToolLayout>
  );
}
