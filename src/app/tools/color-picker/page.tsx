"use client";

import { useState, useMemo, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(h: number, s: number, l: number) {
  return {
    complementary: [hslToHex((h + 180) % 360, s, l)],
    analogous: [hslToHex((h + 30) % 360, s, l), hslToHex((h - 30 + 360) % 360, s, l)],
    triadic: [hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
    splitComplementary: [hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)],
  };
}

export default function ColorPickerPage() {
  const [hex, setHex] = useState("#3b82f6");
  const { copy, copied } = useCopyToClipboard();

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null, [rgb]);
  const palette = useMemo(() => hsl ? generatePalette(hsl.h, hsl.s, hsl.l) : null, [hsl]);

  const handleHexInput = (val: string) => {
    if (!val.startsWith("#")) val = "#" + val;
    setHex(val);
  };

  const colorValues = rgb && hsl ? [
    { label: "HEX", value: hex.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ] : [];

  const paletteGroups = palette ? [
    { name: "보색", colors: palette.complementary },
    { name: "유사색", colors: palette.analogous },
    { name: "삼색 조화", colors: palette.triadic },
    { name: "분할 보색", colors: palette.splitComplementary },
  ] : [];

  return (
    <ToolLayout title="색상 피커/팔레트" description="색상을 선택하고 다양한 형식으로 변환하며 팔레트를 생성합니다">
      <div className="space-y-6">
        {/* Picker + values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-20 h-20 rounded-lg cursor-pointer border-0 p-0"
              />
              <div className="flex-1">
                <Label className="text-sm font-medium mb-1 block">HEX</Label>
                <Input
                  value={hex}
                  onChange={(e) => handleHexInput(e.target.value)}
                  className="font-mono"
                  maxLength={7}
                />
              </div>
            </div>
            {/* Color preview */}
            <div
              className="w-full h-24 rounded-lg border"
              style={{ backgroundColor: hex }}
            />
          </div>
          <div className="space-y-3">
            {colorValues.map((cv) => (
              <div key={cv.label} className="flex items-center gap-2">
                <Label className="text-sm font-medium w-10">{cv.label}</Label>
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono">{cv.value}</code>
                <Button variant="outline" size="sm" onClick={() => copy(cv.value)}>
                  복사
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Palette */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold block">색상 팔레트</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paletteGroups.map((group) => (
              <div key={group.name} className="p-4 border rounded-lg">
                <Label className="text-sm font-medium mb-2 block">{group.name}</Label>
                <div className="flex gap-2">
                  {/* Current color */}
                  <button
                    onClick={() => copy(hex)}
                    className="flex-1 h-12 rounded-md border-2 border-primary/50"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                  {group.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => { copy(c); setHex(c); }}
                      className="flex-1 h-12 rounded-md border hover:border-primary/50 transition-colors cursor-pointer"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
