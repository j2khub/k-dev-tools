"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  let full = clean;
  if (clean.length === 3) full = clean.split("").map((c) => c + c).join("");
  if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface Check {
  label: string;
  level: string;
  threshold: number;
}

const CHECKS: Check[] = [
  { label: "일반 텍스트", level: "AA", threshold: 4.5 },
  { label: "일반 텍스트", level: "AAA", threshold: 7 },
  { label: "큰 텍스트", level: "AA", threshold: 3 },
  { label: "큰 텍스트", level: "AAA", threshold: 4.5 },
  { label: "UI 요소", level: "AA", threshold: 3 },
];

export default function WcagContrast() {
  const [fgHex, setFgHex] = useState("#000000");
  const [bgHex, setBgHex] = useState("#FFFFFF");

  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const ratio = fg && bg ? contrastRatio(fg, bg) : null;

  return (
    <ToolLayout
      title="WCAG 색상 대비 검사"
      description="전경/배경 색상의 대비율과 접근성 기준 충족 여부를 확인합니다"
    >
      <Card className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">전경색 (텍스트)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgHex}
                onChange={(e) => setFgHex(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={fgHex}
                onChange={(e) => setFgHex(e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">배경색</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-mono border rounded-md bg-transparent"
              />
            </div>
          </div>
        </div>

        {fg && bg && ratio !== null && (
          <>
            <div
              className="p-6 rounded-lg border text-center"
              style={{ backgroundColor: bgHex, color: fgHex }}
            >
              <div className="text-2xl font-bold mb-1">미리보기 텍스트</div>
              <div className="text-sm">Preview Text Sample 가나다라마바사</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold font-mono">{ratio.toFixed(2)}:1</div>
              <div className="text-sm text-muted-foreground mt-1">대비율</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHECKS.map((check, i) => {
                const pass = ratio >= check.threshold;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-md border"
                  >
                    <span className="text-sm">
                      {check.label}{" "}
                      <Badge variant="outline" className="ml-1">{check.level}</Badge>
                    </span>
                    <Badge variant={pass ? "default" : "destructive"}>
                      {pass ? "통과" : "미달"} ({check.threshold}:1)
                    </Badge>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </ToolLayout>
  );
}
