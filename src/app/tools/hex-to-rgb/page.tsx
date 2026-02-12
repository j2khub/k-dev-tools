"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  let full = clean;
  if (clean.length === 3) {
    full = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export default function HexToRgb() {
  const [hex, setHex] = useState("#3B82F6");
  const rgb = hexToRgb(hex);
  const { copied, copy } = useCopyToClipboard();

  const formats = rgb
    ? [
        { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
        { label: "RGBA", value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
        { label: "CSS", value: `color: rgb(${rgb.r}, ${rgb.g}, ${rgb.b});` },
      ]
    : [];

  return (
    <ToolLayout
      title="HEX → RGB 변환"
      description="HEX 색상 코드를 RGB 값으로 변환합니다"
    >
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={rgb ? `#${hex.replace("#", "").padEnd(6, "0").slice(0, 6)}` : "#000000"}
              onChange={(e) => setHex(e.target.value)}
              className="w-12 h-10 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              placeholder="#3B82F6"
              className="w-36 px-3 py-2 text-sm font-mono border rounded-md bg-transparent"
            />
          </div>
          {rgb && (
            <div
              className="w-24 h-10 rounded-md border"
              style={{ backgroundColor: `rgb(${rgb.r},${rgb.g},${rgb.b})` }}
            />
          )}
        </div>

        {!rgb && hex.length > 1 && (
          <p className="text-sm text-destructive">유효하지 않은 HEX 색상입니다</p>
        )}

        {rgb && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-4 bg-muted rounded-md">
              <div className="text-2xl font-bold font-mono">{rgb.r}</div>
              <div className="text-xs text-muted-foreground mt-1">R (Red)</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <div className="text-2xl font-bold font-mono">{rgb.g}</div>
              <div className="text-xs text-muted-foreground mt-1">G (Green)</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-md">
              <div className="text-2xl font-bold font-mono">{rgb.b}</div>
              <div className="text-xs text-muted-foreground mt-1">B (Blue)</div>
            </div>
          </div>
        )}

        {formats.length > 0 && (
          <div className="space-y-2">
            {formats.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
              >
                <div>
                  <span className="text-xs text-muted-foreground mr-2">{f.label}</span>
                  <code className="text-sm font-mono">{f.value}</code>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copy(f.value)}>
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
