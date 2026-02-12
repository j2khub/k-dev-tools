"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const SMALL_UNITS = ["", "십", "백", "천"];
const BIG_UNITS = ["", "만", "억", "조", "경"];

function numberToKorean(num: number): string {
  if (num === 0) return "영";
  if (num < 0) return "마이너스 " + numberToKorean(-num);
  if (!Number.isFinite(num)) return "유효하지 않은 숫자";

  // Handle integer part only
  const intPart = Math.floor(num);
  const str = intPart.toString();

  // Split into groups of 4 from the right
  const groups: number[] = [];
  let remaining = intPart;
  while (remaining > 0) {
    groups.push(remaining % 10000);
    remaining = Math.floor(remaining / 10000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    if (group === 0) continue;

    let groupStr = "";
    const g = group.toString().split("").map(Number);

    // Pad to handle positions correctly
    while (g.length < 4) g.unshift(0);

    for (let j = 0; j < 4; j++) {
      const digit = g[j];
      if (digit === 0) continue;
      // Skip 일 for 십, 백, 천 (but not for ones place)
      if (digit === 1 && j < 3) {
        groupStr += SMALL_UNITS[3 - j];
      } else {
        groupStr += DIGITS[digit] + SMALL_UNITS[3 - j];
      }
    }

    parts.push(groupStr + BIG_UNITS[i]);
  }

  return parts.join("");
}

function formatNumber(value: string): string {
  const num = value.replace(/,/g, "");
  if (!num) return "";
  return Number(num).toLocaleString();
}

export default function AmountToKoreanPage() {
  const [input, setInput] = useState("");
  const { copy, copied } = useCopyToClipboard();

  const numValue = useMemo(() => {
    const cleaned = input.replace(/[,\s원]/g, "");
    return cleaned ? Number(cleaned) : NaN;
  }, [input]);

  const korean = useMemo(() => {
    if (isNaN(numValue)) return "";
    return numberToKorean(numValue);
  }, [numValue]);

  const koreanWithWon = korean ? korean + "원" : "";
  const formatted = useMemo(() => {
    if (isNaN(numValue)) return "";
    return numValue.toLocaleString() + "원";
  }, [numValue]);

  const handleInput = (value: string) => {
    // Allow only numbers, commas, spaces
    const cleaned = value.replace(/[^0-9,\s]/g, "");
    setInput(cleaned);
  };

  const examples = [
    { label: "1만", value: "10000" },
    { label: "100만", value: "1000000" },
    { label: "1억", value: "100000000" },
    { label: "12억3456만7890", value: "1234567890" },
    { label: "1조", value: "1000000000000" },
  ];

  return (
    <ToolLayout title="금액 한글 변환기" description="숫자 금액을 한글 표기로 변환합니다">
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">금액 입력</Label>
          <Input
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="font-mono text-lg"
            placeholder="숫자를 입력하세요 (예: 1234567890)"
          />
        </div>

        {korean && (
          <div className="space-y-4">
            <div className="p-6 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm text-muted-foreground">한글 표기</Label>
                <Button variant="outline" size="sm" onClick={() => copy(koreanWithWon)}>
                  {copied ? "복사됨!" : "복사"}
                </Button>
              </div>
              <div className="text-xl font-bold break-all">{koreanWithWon}</div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <Label className="text-sm text-muted-foreground mb-1 block">숫자 표기</Label>
              <div className="text-lg font-mono">{formatted}</div>
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium mb-2 block">빠른 예시</Label>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <Button
                key={ex.value}
                variant="outline"
                size="sm"
                onClick={() => setInput(ex.value)}
              >
                {ex.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
