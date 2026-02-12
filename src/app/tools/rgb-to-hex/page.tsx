"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

export default function RgbToHex() {
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const { copied, copy } = useCopyToClipboard();

  const hex = rgbToHex(r, g, b);

  const setChannel = (setter: (v: number) => void, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) setter(Math.max(0, Math.min(255, num)));
  };

  return (
    <ToolLayout
      title="RGB → HEX 변환"
      description="RGB 값을 HEX 색상 코드로 변환합니다"
    >
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {([
            ["R", r, setR, "text-red-500"],
            ["G", g, setG, "text-green-500"],
            ["B", b, setB, "text-blue-500"],
          ] as const).map(([label, value, setter, color]) => (
            <div key={label}>
              <label className={`text-sm font-semibold ${color} mb-2 block`}>{label}</label>
              <input
                type="number"
                min={0}
                max={255}
                value={value}
                onChange={(e) => setChannel(setter, e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border rounded-md bg-transparent"
              />
              <input
                type="range"
                min={0}
                max={255}
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-lg border"
            style={{ backgroundColor: hex }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <code className="text-2xl font-mono font-bold">{hex}</code>
              <Button size="sm" variant="outline" onClick={() => copy(hex)}>
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                {copied ? "복사됨" : "복사"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              rgb({r}, {g}, {b})
            </p>
          </div>
        </div>
      </Card>
    </ToolLayout>
  );
}
