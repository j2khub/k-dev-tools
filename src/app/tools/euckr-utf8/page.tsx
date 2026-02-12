"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Copy, Check } from "lucide-react";

function textToUtf8Hex(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return Array.from(bytes)
    .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");
}

function textToUtf8Percent(text: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return Array.from(bytes)
    .map((b) => `%${b.toString(16).toUpperCase().padStart(2, "0")}`)
    .join("");
}

function hexToText(hex: string): string {
  const clean = hex.replace(/%/g, " ").replace(/0x/gi, " ").trim();
  const bytes = clean.split(/\s+/).map((h) => parseInt(h, 16));
  const validBytes = bytes.filter((b) => !isNaN(b));
  if (validBytes.length === 0) return "";
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return decoder.decode(new Uint8Array(validBytes));
}

export default function EuckrUtf8() {
  const [textInput, setTextInput] = useState("");
  const [hexInput, setHexInput] = useState("");
  const [hexOutput, setHexOutput] = useState("");
  const [percentOutput, setPercentOutput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const { copied, copy } = useCopyToClipboard();

  const handleTextChange = (value: string) => {
    setTextInput(value);
    if (!value) {
      setHexOutput("");
      setPercentOutput("");
      return;
    }
    setHexOutput(textToUtf8Hex(value));
    setPercentOutput(textToUtf8Percent(value));
  };

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (!value.trim()) {
      setTextOutput("");
      return;
    }
    setTextOutput(hexToText(value));
  };

  return (
    <ToolLayout
      title="EUC-KR ↔ UTF-8"
      description="EUC-KR과 UTF-8 인코딩을 상호 변환합니다"
    >
      <Card className="p-4 space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">텍스트 → UTF-8 바이트</label>
          <Textarea
            placeholder="한글 텍스트를 입력하세요"
            className="font-mono text-sm min-h-[80px] resize-none"
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          {hexOutput && (
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-muted-foreground">HEX 바이트</label>
                  <Button size="sm" variant="ghost" onClick={() => copy(hexOutput)}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="px-3 py-2 bg-muted rounded-md font-mono text-xs break-all">
                  {hexOutput}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  퍼센트 인코딩
                </label>
                <div className="px-3 py-2 bg-muted rounded-md font-mono text-xs break-all">
                  {percentOutput}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">UTF-8 바이트 → 텍스트</label>
          <Textarea
            placeholder="ED 95 9C EA B8 80 또는 %ED%95%9C%EA%B8%80"
            className="font-mono text-sm min-h-[80px] resize-none"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
          />
          {textOutput && (
            <div className="mt-2 px-3 py-2 bg-muted rounded-md text-sm">
              {textOutput}
            </div>
          )}
        </div>
      </Card>
    </ToolLayout>
  );
}
