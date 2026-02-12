"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";

export default function CssUnits() {
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [pxValue, setPxValue] = useState("16");
  const [remValue, setRemValue] = useState("1");

  const handlePxChange = (value: string) => {
    setPxValue(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setRemValue((num / baseFontSize).toFixed(4).replace(/\.?0+$/, ""));
    }
  };

  const handleRemChange = (value: string) => {
    setRemValue(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setPxValue((num * baseFontSize).toFixed(2).replace(/\.?0+$/, ""));
    }
  };

  const handleBaseChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setBaseFontSize(num);
      const px = parseFloat(pxValue);
      if (!isNaN(px)) {
        setRemValue((px / num).toFixed(4).replace(/\.?0+$/, ""));
      }
    }
  };

  const commonValues = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];

  return (
    <ToolLayout
      title="CSS 단위 변환"
      description="px과 rem 단위를 상호 변환합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">기본 폰트 크기</label>
          <input
            type="number"
            min={1}
            value={baseFontSize}
            onChange={(e) => handleBaseChange(e.target.value)}
            className="w-20 px-2 py-1.5 text-sm border rounded-md bg-transparent"
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-2 block">px</label>
            <input
              type="number"
              value={pxValue}
              onChange={(e) => handlePxChange(e.target.value)}
              className="w-full px-3 py-2 text-lg font-mono border rounded-md bg-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">rem</label>
            <input
              type="number"
              value={remValue}
              onChange={(e) => handleRemChange(e.target.value)}
              step="0.0625"
              className="w-full px-3 py-2 text-lg font-mono border rounded-md bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">변환 참조표</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {commonValues.map((px) => (
              <button
                key={px}
                onClick={() => handlePxChange(String(px))}
                className="px-2 py-2 text-xs font-mono border rounded-md hover:bg-accent transition-colors text-center"
              >
                <div className="font-semibold">{px}px</div>
                <div className="text-muted-foreground">
                  {(px / baseFontSize).toFixed(4).replace(/\.?0+$/, "")}rem
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
