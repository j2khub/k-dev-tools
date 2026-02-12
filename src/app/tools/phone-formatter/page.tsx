"use client";

import { useState, useMemo } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

function formatKoreanPhone(input: string): { formatted: string; type: string } | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0) return null;

  // 4-digit service numbers: 1588, 1577, 1544, 1566, 1600, 1670, etc.
  if (/^1[0-9]{3}$/.test(digits)) {
    return { formatted: digits, type: "대표번호 (4자리)" };
  }

  // 8-digit service: 1588-1234
  if (/^1[0-9]{7}$/.test(digits)) {
    return { formatted: `${digits.slice(0, 4)}-${digits.slice(4)}`, type: "대표번호" };
  }

  // Mobile: 010, 011, 016, 017, 018, 019
  if (/^01[016789]/.test(digits)) {
    if (digits.length === 10) {
      return { formatted: `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`, type: "휴대전화" };
    }
    if (digits.length === 11) {
      return { formatted: `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`, type: "휴대전화" };
    }
  }

  // Seoul: 02
  if (/^02/.test(digits)) {
    if (digits.length === 9) {
      return { formatted: `02-${digits.slice(2, 5)}-${digits.slice(5)}`, type: "서울 지역번호" };
    }
    if (digits.length === 10) {
      return { formatted: `02-${digits.slice(2, 6)}-${digits.slice(6)}`, type: "서울 지역번호" };
    }
  }

  // 080 toll-free
  if (/^080/.test(digits)) {
    if (digits.length === 10) {
      return { formatted: `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`, type: "수신자부담" };
    }
    if (digits.length === 11) {
      return { formatted: `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`, type: "수신자부담" };
    }
  }

  // Other area codes: 031, 032, 033, 041, 042, 043, 044, 051, 052, 053, 054, 055, 061, 062, 063, 064
  if (/^0[3-6][1-5]/.test(digits) || /^044/.test(digits)) {
    if (digits.length === 10) {
      return { formatted: `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`, type: "지역번호" };
    }
    if (digits.length === 11) {
      return { formatted: `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`, type: "지역번호" };
    }
  }

  // International with country code +82
  if (/^82/.test(digits)) {
    const local = "0" + digits.slice(2);
    const result = formatKoreanPhone(local);
    if (result) {
      return { formatted: `+82-${result.formatted.slice(1)}`, type: `${result.type} (국제)` };
    }
  }

  return { formatted: digits, type: "인식할 수 없는 형식" };
}

export default function PhoneFormatterPage() {
  const [input, setInput] = useState("");
  const { copy, copied } = useCopyToClipboard();

  const results = useMemo(() => {
    const tokens = input.split(/[\s,]+/).filter(Boolean);
    return tokens
      .map((token) => ({ input: token, ...formatKoreanPhone(token) }))
      .filter((r): r is { input: string; formatted: string; type: string } => r.formatted !== undefined);
  }, [input]);

  const allFormatted = results.map((r) => r.formatted).join(", ");

  const examples = [
    "01012345678",
    "021234567",
    "0311234567",
    "15881234",
    "01012345678, 0311234567, 15881234",
  ];

  return (
    <ToolLayout title="전화번호 포매터" description="한국 전화번호를 올바른 형식으로 변환합니다">
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">전화번호 입력</Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-lg"
            placeholder="띄어쓰기 또는 쉼표로 여러 개 입력 (예: 01012345678, 021234567)"
          />
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">포맷 결과 ({results.length}건)</span>
              <Button variant="outline" size="sm" onClick={() => copy(allFormatted)}>
                {copied ? "복사됨!" : "전체 복사"}
              </Button>
            </div>
            {results.map((r, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/50 flex items-center justify-between">
                <div>
                  <div className="text-lg font-mono font-bold">{r.formatted}</div>
                  <div className="text-xs text-muted-foreground">{r.type}</div>
                </div>
                <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => copy(r.formatted)}>
                  복사
                </Button>
              </div>
            ))}
          </div>
        )}

        <div>
          <Label className="text-sm font-medium mb-2 block">예시</Label>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <Button
                key={ex}
                variant="outline"
                size="sm"
                onClick={() => setInput(ex)}
                className="font-mono"
              >
                {ex}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
