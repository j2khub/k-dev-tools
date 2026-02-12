"use client";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check, RefreshCw } from "lucide-react";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export default function RandomStringGenerator() {
  const [length, setLength] = useState(32);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [result, setResult] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const generate = useCallback(() => {
    let chars = "";
    if (options.uppercase) chars += CHARSETS.uppercase;
    if (options.lowercase) chars += CHARSETS.lowercase;
    if (options.numbers) chars += CHARSETS.numbers;
    if (options.symbols) chars += CHARSETS.symbols;
    if (!chars) return;

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    const str = Array.from(array)
      .map((n) => chars[n % chars.length])
      .join("");
    setResult(str);
  }, [length, options]);

  useState(() => {
    generate();
  });

  const toggleOption = (key: keyof typeof options) => {
    const next = { ...options, [key]: !options[key] };
    const anyChecked = Object.values(next).some(Boolean);
    if (anyChecked) setOptions(next);
  };

  return (
    <ToolLayout
      title="랜덤 문자열 생성기"
      description="지정한 길이와 옵션으로 랜덤 문자열을 생성합니다"
    >
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">길이</label>
            <input
              type="number"
              min={1}
              max={256}
              value={length}
              onChange={(e) =>
                setLength(Math.min(256, Math.max(1, Number(e.target.value))))
              }
              className="w-20 px-2 py-1.5 text-sm border rounded-md bg-transparent"
            />
          </div>
          {(
            [
              ["uppercase", "대문자"],
              ["lowercase", "소문자"],
              ["numbers", "숫자"],
              ["symbols", "특수문자"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggleOption(key)}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={generate}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            생성
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copy(result)}
            disabled={!result}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1" />
            )}
            {copied ? "복사됨" : "복사"}
          </Button>
        </div>
        {result && (
          <div className="px-3 py-3 bg-muted rounded-md font-mono text-sm break-all">
            {result}
          </div>
        )}
      </Card>
    </ToolLayout>
  );
}
