"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BmiCalc() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const bmi = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return null;

    const heightInMeters = h / 100;
    const bmiValue = w / (heightInMeters * heightInMeters);

    let category = "";
    let color = "";
    let bgColor = "";
    let borderColor = "";

    if (bmiValue < 18.5) {
      category = "저체중";
      color = "text-blue-600 dark:text-blue-400";
      bgColor = "bg-blue-500/10";
      borderColor = "border-blue-500/20";
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      category = "정상";
      color = "text-green-600 dark:text-green-400";
      bgColor = "bg-green-500/10";
      borderColor = "border-green-500/20";
    } else if (bmiValue >= 25 && bmiValue < 30) {
      category = "과체중";
      color = "text-amber-600 dark:text-amber-400";
      bgColor = "bg-amber-500/10";
      borderColor = "border-amber-500/20";
    } else {
      category = "비만";
      color = "text-red-600 dark:text-red-400";
      bgColor = "bg-red-500/10";
      borderColor = "border-red-500/20";
    }

    return {
      value: bmiValue.toFixed(1),
      category,
      color,
      bgColor,
      borderColor,
    };
  }, [height, weight]);

  const getGaugePosition = (bmiValue: number) => {
    // Map BMI to percentage (10-40 range mapped to 0-100%)
    const min = 10;
    const max = 40;
    const clamped = Math.max(min, Math.min(max, bmiValue));
    return ((clamped - min) / (max - min)) * 100;
  };

  return (
    <ToolLayout
      title="BMI 계산기"
      description="체질량지수(BMI)를 계산하고 체중 상태를 확인합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height">키 (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
              className="font-mono text-lg"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <Label htmlFor="weight">몸무게 (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="65"
              className="font-mono text-lg"
              min="0"
              step="0.1"
            />
          </div>
        </div>

        {bmi !== null && (
          <div className="space-y-4">
            <div
              className={`p-6 rounded-lg border ${bmi.bgColor} ${bmi.borderColor}`}
            >
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  체질량지수 (BMI)
                </div>
                <div className={`text-5xl font-bold font-mono ${bmi.color}`}>
                  {bmi.value}
                </div>
                <div className={`text-xl font-semibold mt-3 ${bmi.color}`}>
                  {bmi.category}
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-3 text-center">
                BMI 범위 게이지
              </div>
              <div className="relative h-8 bg-gradient-to-r from-blue-500 via-green-500 via-amber-500 to-red-500 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-300"
                  style={{
                    left: `${getGaugePosition(parseFloat(bmi.value))}%`,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-xs font-bold whitespace-nowrap">
                    {bmi.value}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>10</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-center">
                <div className="font-semibold text-blue-600 dark:text-blue-400">
                  저체중
                </div>
                <div className="text-muted-foreground mt-1">&lt; 18.5</div>
              </div>
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-center">
                <div className="font-semibold text-green-600 dark:text-green-400">
                  정상
                </div>
                <div className="text-muted-foreground mt-1">18.5 - 24.9</div>
              </div>
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-center">
                <div className="font-semibold text-amber-600 dark:text-amber-400">
                  과체중
                </div>
                <div className="text-muted-foreground mt-1">25 - 29.9</div>
              </div>
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-center">
                <div className="font-semibold text-red-600 dark:text-red-400">
                  비만
                </div>
                <div className="text-muted-foreground mt-1">&ge; 30</div>
              </div>
            </div>
          </div>
        )}

        {!bmi && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            키와 몸무게를 입력하면 BMI를 계산합니다
          </div>
        )}

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>
            BMI(Body Mass Index) = 몸무게(kg) ÷ 키(m)²
          </p>
          <p>
            이 계산기는 참고용이며, 정확한 건강 상태는 전문의와 상담하세요.
          </p>
        </div>
      </Card>
    </ToolLayout>
  );
}
